"""
Streamlit test app for Ship the BIM pipeline.

Upload IFC/CSV, select or paste profile, run scan, view results.
"""

import streamlit as st
import json
import pandas as pd
import requests
import os

st.set_page_config(page_title="Ship the BIM", layout="wide")

st.title("Ship the BIM - Release Gate")

API_URL = os.getenv("API_URL", "http://localhost:8000")

st.sidebar.header("Configuration")
api_status = "Checking..."
try:
    requests.get(f"{API_URL}/health", timeout=2)
    api_status = "API Online"
except Exception:
    api_status = "API Offline"
st.sidebar.write(f"Backend Status: {api_status}")

# 1. Inputs
st.header("1. Upload & Configure")

col1, col2 = st.columns(2)

with col1:
    uploaded_file = st.file_uploader("Upload IFC or CSV File", type=["ifc", "csv"])

with col2:
    # Profile: dropdown or JSON
    profiles = {}
    try:
        r = requests.get(f"{API_URL}/profiles", timeout=2)
        if r.status_code == 200:
            profiles = r.json()
    except Exception:
        pass

    profile_source = st.radio("Profile source", ["Select stored profile", "Paste JSON"])
    profile_id = None
    profile_str = None

    if profile_source == "Select stored profile" and profiles:
        profile_id = st.selectbox("Profile", list(profiles.keys()), format_func=lambda k: f"{k} ({profiles.get(k, '')})")
        profile_str = None
    else:
        profile_id = None
        default_profile = {
            "name": "Default Safety Profile",
            "version": "1.0",
            "rules": [
                {
                    "id": "R001",
                    "name": "Wall Fire Rating",
                    "check_type": "PROPERTY_EXISTENCE",
                    "entity_type": "IfcWall",
                    "property_set": "Pset_WallCommon",
                    "property_name": "FireRating",
                    "severity": "BLOCKER",
                    "description": "All walls must have a FireRating property.",
                },
                {
                    "id": "R002",
                    "name": "Door Acoustic Rating",
                    "check_type": "PROPERTY_VALUE",
                    "entity_type": "IfcDoor",
                    "property_set": "Pset_DoorCommon",
                    "property_name": "AcousticRating",
                    "allowed_values": ["25dB", "30dB", "35dB"],
                    "severity": "MAJOR",
                },
            ],
        }
        profile_str = st.text_area("Profile (JSON)", value=json.dumps(default_profile, indent=2), height=280)

# Project ID
project_id = st.number_input("Project ID (Numeric)", min_value=1, value=123, step=1)

if st.button("Run Scan", type="primary", disabled=not uploaded_file):
    with st.spinner("Scanning... this may take a moment (AI reasoning in progress)..."):
        try:
            files = {"file": (uploaded_file.name, uploaded_file, "application/octet-stream")}
            data = {
                "project_id": str(project_id),
            }
            if profile_id:
                data["profile_id"] = profile_id
            elif profile_str:
                data["profile_data"] = profile_str
            else:
                st.error("Select a profile or paste profile JSON.")
                st.stop()

            response = requests.post(f"{API_URL}/scan", files=files, data=data)

            if response.status_code == 200:
                result = response.json()
                st.success("Scan Complete!")

                st.header("1. Readiness Scores")
                scores = result.get("scores", {})
                
                sc1, sc2, sc3, sc4 = st.columns(4)
                with sc1:
                    st.metric("Overall Readiness", f"{scores.get('overall_readiness', 0.0) * 100:.1f}%")
                with sc2:
                    st.metric("Object Classification", f"{scores.get('object_classification', 0.0) * 100:.1f}%")
                with sc3:
                    st.metric("Property Sets", f"{scores.get('property_sets', 0.0) * 100:.1f}%")
                with sc4:
                    st.metric("Naming Conventions", f"{scores.get('naming_conventions', 0.0) * 100:.1f}%")

                # st.divider()
                
                # New Guidance Section
                st.header("Git-based Guidance (guidances)")
                guidances = result.get("guidances", [])
                if guidances:
                    g_df = pd.DataFrame(guidances)
                    for _, g in g_df.iterrows():
                        with st.expander(f"🔴 {g['what_is_wrong']}"):
                            st.write(f"**Why it matters:** {g['why_it_matters']}")
                            st.write(f"**How to fix:** {g['where_to_fix_it']}")
                    
                    g_csv = g_df.to_csv(index=False).encode("utf-8")
                    st.download_button(
                        "Download Guidance CSV",
                        g_csv,
                        "guidances.csv",
                        "text/csv",
                        key="download-guidance",
                    )
                else:
                    st.info("No AI guidance generated.")

                st.header("2. Issue Summary (issue_summaries)")
                summary_df = pd.DataFrame(result.get("issue_summaries", []))
                if not summary_df.empty:
                    # Fix for 'LargeUtf8' error with Pandas 3.0+ / PyArrow strings
                    summary_df = summary_df.astype(object)
                    st.dataframe(summary_df, use_container_width=True)
                    total_failed = int(summary_df["failed_count"].sum())
                    st.metric("Total Violations", total_failed, delta=-total_failed, delta_color="inverse")
                    
                    # Add Download Button for Issues Summary
                    summary_csv = summary_df.to_csv(index=False).encode("utf-8")
                    st.download_button(
                        "Download Issue Summary CSV",
                        summary_csv,
                        "issue_summaries.csv",
                        "text/csv",
                        key="download-summary",
                    )
                else:
                    st.info("No summary data generated.")

                st.header("3. Missing Properties (missing_properties)")
                # Updated to use missing_properties from API result
                issues_df = pd.DataFrame(result.get("missing_properties", []))
                if not issues_df.empty:
                    # Fix for 'LargeUtf8' error
                    issues_df = issues_df.astype(object)
                    st.dataframe(issues_df, use_container_width=True)
                    csv = issues_df.to_csv(index=False).encode("utf-8")
                    st.download_button(
                        "Download Missing Properties CSV",
                        csv,
                        "missing_properties.csv",
                        "text/csv",
                        key="download-missing-props",
                    )
                else:
                    st.success("No issues found.")

                st.header("4. Terminology Mapping (terminology_mappings)")
                term_df = pd.DataFrame(result.get("terminology_mappings", []))
                if not term_df.empty:
                    # Fix for 'LargeUtf8' error
                    term_df = term_df.astype(object)
                    st.dataframe(term_df, use_container_width=True)
                    term_csv = term_df.to_csv(index=False).encode("utf-8")
                    st.download_button(
                        "Download Terminology Mapping CSV",
                        term_csv,
                        "terminology_mappings.csv",
                        "text/csv",
                        key="download-term",
                    )
                else:
                    st.info("No terminology mismatches found.")

            else:
                st.error(f"Scan failed: {response.text}")

        except Exception as e:
            st.error(f"An error occurred: {str(e)}")
