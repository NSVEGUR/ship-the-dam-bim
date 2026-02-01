"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface ValidationCategory {
    id: string;
    name: string;
    percentage: number;
    status: "ok" | "warning" | "critical";
}

export interface ValidationRule {
    ruleId: string;
    ruleName: string;
    severity: string;
    checked: number;
    failed: number;
    passRate: number;
    notes: string;
    whyItMatters?: string;
    whereToFixIt?: string;
}

export interface MissingProperty {
    severity: string;
    issueType: string;
    ruleId: string;
    ruleName: string;
    ifcGuid: string;
    elementType: string;
    elementName: string;
    objectType?: string;
    level: string;
    propertySet: string;
    propertyKey: string;
    expected?: string;
    current?: string;
    suggestedValue?: string;
    confidence?: number;
    whyItMatters?: string;
    whatIsWrong?: string;
    whereToFixIt?: string;
}

export interface TerminologyMapping {
    entryId?: string;
    scope?: string;
    elementType?: string;
    ifcGuid?: string;
    original: string;
    canonicalKey?: string;
    suggestedEN: string;
    suggestedDE: string;
    confidence: number;
    whyItMatters?: string;
    whatIsWrong?: string;
    whereToFixIt?: string;
    status: "PROPOSED" | "ACCEPTED" | "REJECTED";
}

export interface ProjectStats {
    readinessScore: number;
    readinessScoreChange?: number;
    issuesCritical: number;
    issuesWarning: number;
    issuesOk: number;
    validationCategories: ValidationCategory[];
    validationRules: ValidationRule[];
    missingProperties: MissingProperty[];
    terminologyMappings: TerminologyMapping[];
    lastScan: string;
}

export interface Project {
    id: string;
    name: string;
    stats: ProjectStats;
    language?: string;
    createdAt?: string;
    description?: string;
}

interface ProjectContextType {
    currentProject: Project;
    projects: Project[];
    setCurrentProject: (projectId: string) => void;
    createNewProject: (name: string, description: string, language: string) => Promise<void>;
    updateProjectStats: (
        projectId: string,
        scores: { overall_readiness: number; object_classification: number; property_sets: number; naming_conventions: number },
        issueSummaries: any[],
        missingProperties: any[],
        terminologyMappings: any[]
    ) => void;

    updateTerminologyStatus: (projectId: string, originalTerm: string, status: "PROPOSED" | "ACCEPTED" | "REJECTED") => void;
    updateTerminologySuggestion: (projectId: string, originalTerm: string, newSuggestion: string) => void;
    saveReport: (projectId: string) => Promise<any>;
}

// Default mock data
// Default mock data (now empty)
const getDefaultStats = (): ProjectStats => ({
    readinessScore: 0,
    issuesCritical: 0,
    issuesWarning: 0,
    issuesOk: 0,
    validationCategories: [
        { id: "obj-class", name: "Object Classification", percentage: 0, status: "ok" },
        { id: "prop-sets", name: "Property Sets", percentage: 0, status: "ok" },
        { id: "naming", name: "Naming Conventions", percentage: 0, status: "ok" },
    ],
    validationRules: [],
    missingProperties: [],
    terminologyMappings: [],
    lastScan: "No scans yet",
});

const getEmptyStats = (): ProjectStats => ({
    readinessScore: 0,
    issuesCritical: 0,
    issuesWarning: 0,
    issuesOk: 0,
    validationCategories: [
        { id: "obj-class", name: "Object Classification", percentage: 0, status: "ok" },
        { id: "prop-sets", name: "Property Sets", percentage: 0, status: "ok" },
        { id: "naming", name: "Naming Conventions", percentage: 0, status: "ok" },
    ],
    validationRules: [],
    missingProperties: [],
    terminologyMappings: [],
    lastScan: "No scans yet",
});

const defaultProject: Project = {
    id: "testproject",
    name: "Loading...",
    stats: getDefaultStats(),
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([defaultProject]);
    const [currentProjectId, setCurrentProjectId] = useState<string>("testproject");

    useEffect(() => {
        const fetchProjects = async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*');

            if (data && data.length > 0) {
                const mappedProjects: Project[] = data.map((p: any) => ({
                    id: p.project_id,
                    name: p.project_name || "Unnamed Project",
                    language: p.project_language,
                    createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : undefined,
                    stats: getEmptyStats(), // Initialize with empty stats
                }));
                setProjects(mappedProjects);
                // Set the first project as current if we are still on the default
                if (currentProjectId === "testproject") {
                    setCurrentProjectId(mappedProjects[0].id);
                }
            } else if (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, []);

    const currentProject = projects.find(p => p.id === currentProjectId) || projects[0] || defaultProject;

    const setCurrentProject = useCallback((projectId: string) => {
        setCurrentProjectId(projectId);
    }, []);

    const createNewProject = useCallback(async (name: string, description: string, language: string) => {
        try {
            console.log("Creating project:", name, description, language);
            const { data, error } = await supabase
                .from('projects')
                .insert([
                    {
                        project_name: name,
                        project_description: description,
                        project_language: language,
                        // project_id is likely auto-generated
                        // created_at is likely auto-generated
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error("Error creating project:", error);
                throw error;
            }

            if (data) {
                console.log("Project created:", data);
                const newProject: Project = {
                    id: data.project_id,
                    name: data.project_name,
                    language: data.project_language,
                    description: data.project_description,
                    createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
                    stats: getEmptyStats(),
                };
                setProjects(prev => [...prev, newProject]);
                setCurrentProjectId(newProject.id);
            }
        } catch (err) {
            console.error("Failed to create project:", err);
            // Fallback or alert logic could go here
            alert("Failed to create project in database. Check console.");
        }
    }, []);

    const updateProjectStats = useCallback(async (
        projectId: string,
        scores: { overall_readiness: number; object_classification: number; property_sets: number; naming_conventions: number },
        issueSummaries: any[] = [],
        missingProperties: any[] = [],
        terminologyMappings: any[] = []
    ) => {

        let scoreChange = 0;
        try {
            // Fetch the most recent report for this project to compare against
            // We assume the current scan hasn't been saved to reports table yet, or if it has, we should get the second most recent?
            // User instruction implies we just fetch "a look at the last created_at", so we fetch the latest ONE.
            // If the current scan is NOT yet in the DB, fetching the latest gives us the previous scan.
            const { data, error } = await supabase
                .from('reports')
                .select('content')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data && data.content) {
                // Parse content if it's a string, otherwise use as object
                const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
                const prevScore = (content.scores?.overall_readiness || 0) * 100;
                const currentScore = scores.overall_readiness * 100;
                scoreChange = Math.round(currentScore - prevScore);
            }
        } catch (err) {
            console.error("Error calculating score change:", err);
        }

        setProjects(prev => prev.map(project => {
            if (project.id !== projectId) return project;

            // Aggregate issues by severity
            let criticalCount = 0;
            let warningCount = 0;
            let infoCount = 0;

            // Map API issue summaries to ValidationRule type
            const validationRules: ValidationRule[] = issueSummaries.map(issue => {
                const checked = issue.checked_count || 0;
                const failed = issue.failed_count || 0;
                const severity = issue.severity || "INFO";

                // Aggregate counts
                if (["BLOCKER", "CRITICAL"].includes(severity)) {
                    criticalCount += failed;
                } else if (["MAJOR", "WARNING"].includes(severity)) {
                    warningCount += failed;
                } else {
                    infoCount += failed;
                }

                // Map severity to frontend expectation
                let feSeverity: "CRITICAL" | "WARNING" | "OK" = "OK";
                if (["BLOCKER", "CRITICAL"].includes(severity)) feSeverity = "CRITICAL";
                else if (["MAJOR", "WARNING"].includes(severity)) feSeverity = "WARNING";

                return {
                    ruleId: issue.rule_id,
                    ruleName: issue.rule_name,
                    severity: feSeverity,
                    checked: checked,
                    failed: failed,
                    passRate: issue.pass_rate !== undefined ? Math.round(issue.pass_rate * 100) : (checked > 0 ? Math.round(((checked - failed) / checked) * 100) : 100),
                    notes: issue.why_it_matters || ""
                };
            });

            // Map missing properties
            const mappedMissingProperties: MissingProperty[] = missingProperties.map(mp => {
                let feSeverity: "CRITICAL" | "WARNING" = "WARNING";
                if (["BLOCKER", "CRITICAL"].includes(mp.severity)) feSeverity = "CRITICAL";

                return {
                    severity: feSeverity,
                    issueType: mp.issue_type === "MISSING_PROPERTY" ? "Missing Property" : "Invalid Value",
                    ruleId: mp.rule_id,
                    ruleName: mp.rule_name,
                    ifcGuid: mp.ifc_guid,
                    elementType: mp.element_type,
                    elementName: mp.element_name || "Unknown Element",
                    level: mp.level || "Unknown Level",
                    propertySet: mp.property_set || "None",
                    propertyKey: mp.property_key || "None"
                };
            });

            // Map terminology
            const mappedTerminology: TerminologyMapping[] = terminologyMappings.map(tm => ({
                original: tm.original,
                suggestedEN: tm.suggested_en || "Review",
                suggestedDE: tm.suggested_de || tm.original,
                confidence: Math.round((tm.confidence || 0) * 100),
                status: tm.status || "PROPOSED"
            }));

            return {
                ...project,
                stats: {
                    ...project.stats,
                    readinessScore: Math.round(scores.overall_readiness * 100),
                    readinessScoreChange: scoreChange,
                    issuesCritical: criticalCount,
                    issuesWarning: warningCount,
                    issuesOk: infoCount,
                    validationCategories: [
                        { id: "obj-class", name: "Object Classification", percentage: Math.round(scores.object_classification * 100), status: scores.object_classification >= 0.95 ? "ok" : scores.object_classification >= 0.7 ? "warning" : "critical" },
                        { id: "prop-sets", name: "Property Sets", percentage: Math.round(scores.property_sets * 100), status: scores.property_sets >= 0.95 ? "ok" : scores.property_sets >= 0.7 ? "warning" : "critical" },
                        { id: "naming", name: "Naming Conventions", percentage: Math.round(scores.naming_conventions * 100), status: scores.naming_conventions >= 0.95 ? "ok" : scores.naming_conventions >= 0.7 ? "warning" : "critical" },
                    ],
                    validationRules: validationRules,
                    missingProperties: mappedMissingProperties,
                    terminologyMappings: mappedTerminology,
                    lastScan: new Date().toLocaleString('en-GB'),
                }
            };
        }));
    }, []);

    const updateTerminologyStatus = useCallback((projectId: string, originalTerm: string, status: "PROPOSED" | "ACCEPTED" | "REJECTED") => {
        setProjects(prev => prev.map(project => {
            if (project.id !== projectId) return project;
            return {
                ...project,
                stats: {
                    ...project.stats,
                    terminologyMappings: project.stats.terminologyMappings.map(tm =>
                        tm.original === originalTerm ? { ...tm, status } : tm
                    )
                }
            };
        }));
    }, []);

    const updateTerminologySuggestion = useCallback((projectId: string, originalTerm: string, newSuggestion: string) => {
        setProjects(prev => prev.map(project => {
            if (project.id !== projectId) return project;
            return {
                ...project,
                stats: {
                    ...project.stats,
                    terminologyMappings: project.stats.terminologyMappings.map(tm =>
                        tm.original === originalTerm ? { ...tm, suggestedDE: newSuggestion } : tm
                    )
                }
            };
        }));
    }, []);

    const saveReport = useCallback(async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return null;

        // Construct report object matching user specification
        const reportContent = {
            missing_properties: [
                ...project.stats.missingProperties.map(mp => ({
                    severity: mp.severity === "CRITICAL" ? "BLOCKER" : "MINOR",
                    issue_type: mp.issueType === "Missing Property" ? "MISSING_PROPERTY" : "INVALID_VALUE",
                    rule_id: mp.ruleId,
                    rule_name: mp.ruleName,
                    ifc_guid: mp.ifcGuid,
                    element_type: mp.elementType,
                    element_name: mp.elementName,
                    object_type: mp.objectType || "unknown",
                    level: mp.level,
                    property_set: mp.propertySet,
                    property_key: mp.propertyKey,
                    expected: mp.expected || "",
                    current: mp.current || "Missing",
                    suggested_value: mp.suggestedValue || null,
                    confidence: mp.confidence || 1.0,
                    why_it_matters: mp.whyItMatters || "Important for data integrity",
                    what_is_wrong: mp.whatIsWrong || null,
                    where_to_fix_it: mp.whereToFixIt || null
                })),
                ...project.stats.terminologyMappings.filter(tm => tm.status !== "ACCEPTED").map(tm => ({
                    severity: "MINOR",
                    issue_type: "TERMINOLOGY_MISMATCH",
                    rule_id: "DE-S04",
                    rule_name: "Terminology consistency",
                    ifc_guid: tm.ifcGuid || "",
                    element_type: tm.elementType || "IfcElement",
                    element_name: tm.original,
                    object_type: "unknown",
                    level: "unknown",
                    property_set: null,
                    property_key: tm.canonicalKey || "Name",
                    expected: "Review",
                    current: tm.original,
                    suggested_value: tm.suggestedDE,
                    confidence: tm.confidence / 100,
                    why_it_matters: tm.whyItMatters || "Inconsistent terminology causes confusion and requires manual normalization.",
                    what_is_wrong: tm.whatIsWrong || null,
                    where_to_fix_it: tm.whereToFixIt || null
                }))
            ],
            terminology_mappings: project.stats.terminologyMappings.map((tm: any, idx: number) => ({
                entry_id: tm.entryId || `term_${String(idx + 1).padStart(3, '0')}`,
                scope: tm.scope || "PROPERTY_VALUE",
                element_type: tm.elementType || "IfcSpace",
                ifc_guid: tm.ifcGuid || "",
                original: tm.original,
                canonical_key: tm.canonicalKey || "Name",
                suggested_en: tm.suggestedEN,
                suggested_de: tm.suggestedDE,
                confidence: tm.confidence / 100,
                status: tm.status
            })),
            issue_summaries: project.stats.validationRules.map(vr => ({
                rule_id: vr.ruleId,
                rule_name: vr.ruleName,
                severity: vr.severity === "CRITICAL" ? "BLOCKER" : "MINOR",
                checked_count: vr.checked,
                failed_count: vr.failed,
                pass_rate: vr.passRate / 100,
                what_is_wrong: vr.notes,
                why_it_matters: vr.whyItMatters || null,
                where_to_fix_it: vr.whereToFixIt || null
            })),
            scores: {
                overall_readiness: project.stats.readinessScore / 100,
                object_classification: (project.stats.validationCategories.find(c => c.id === "obj-class")?.percentage || 0) / 100,
                property_sets: (project.stats.validationCategories.find(c => c.id === "prop-sets")?.percentage || 0) / 100,
                naming_conventions: (project.stats.validationCategories.find(c => c.id === "naming")?.percentage || 0) / 100,
            },
            timestamp: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('reports')
            .insert({ project_id: projectId, content: reportContent })
            .select()
            .single();

        if (error) {
            console.error("Error saving report:", error);
            throw error;
        }

        return reportContent;
    }, [projects]);

    return (
        <ProjectContext.Provider value={{
            currentProject,
            projects,
            setCurrentProject,
            createNewProject,
            updateProjectStats,
            updateTerminologyStatus,
            updateTerminologySuggestion,
            saveReport
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
}
