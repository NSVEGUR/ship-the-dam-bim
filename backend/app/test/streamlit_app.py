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

# LLM Provider Selection
st.sidebar.header("AI Configuration")
llm_options = {"gemini": "Gemini (Default)", "minimax": "MiniMax M2.1", "openai": "OpenAI GPT-4o"}
llm_provider = st.sidebar.selectbox(
    "Base LLM Provider",
    options=list(llm_options.keys()),
    format_func=lambda x: llm_options[x],
    help="Select the LLM"
)

if st.button("Run Scan", type="primary", disabled=not uploaded_file):
    with st.spinner("Scanning... this may take a moment (AI reasoning in progress)..."):
        try:
            files = {"file": (uploaded_file.name, uploaded_file, "application/octet-stream")}
            data = {
                "project_id": str(project_id),
                "llm_provider": llm_provider,
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
                
                # Helper to show score with adjustment if present
                def show_score(label, key):
                    val = scores.get(key, 0.0)
                    adj_key = f"adjusted_{key}"
                    if adj_key in scores:
                        adj_val = scores[adj_key]
                        delta = (adj_val - val) * 100
                        st.metric(label, f"{adj_val * 100:.1f}%", delta=f"{delta:+.1f}% (Adjusted)", delta_color="normal")
                    else:
                        st.metric(label, f"{val * 100:.1f}%")

                with sc1:
                    show_score("Overall Readiness", "overall_readiness")
                with sc2:
                    show_score("Object Classification", "object_classification")
                with sc3:
                    show_score("Property Sets", "property_sets")
                with sc4:
                    show_score("Naming Conventions", "naming_conventions")

                st.header("2. Issue Summary")
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

                st.header("3. Missing Properties")
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

                st.header("4. Terminology Mapping")
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
