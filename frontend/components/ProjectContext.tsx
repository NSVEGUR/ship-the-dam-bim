"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

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
    severity: "CRITICAL" | "WARNING" | "OK";
    checked: number;
    failed: number;
    passRate: number;
    notes: string;
}

export interface MissingProperty {
    severity: "CRITICAL" | "WARNING";
    issueType: string;
    ruleId: string;
    ruleName: string;
    ifcGuid: string;
    elementType: string;
    elementName: string;
    level: string;
    propertySet: string;
    propertyKey: string;
}

export interface TerminologyMapping {
    original: string;
    suggestedEN: string;
    suggestedDE: string;
    confidence: number;
    status: "PROPOSED" | "ACCEPTED";
}

export interface ProjectStats {
    readinessScore: number;
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
}

interface ProjectContextType {
    currentProject: Project;
    projects: Project[];
    setCurrentProject: (projectId: string) => void;
    createNewProject: (name: string) => void;
}

// Default mock data
const getDefaultStats = (): ProjectStats => ({
    readinessScore: 97,
    issuesCritical: 3,
    issuesWarning: 3,
    issuesOk: 5,
    validationCategories: [
        { id: "obj-class", name: "Object Classification", percentage: 96.5, status: "warning" },
        { id: "prop-sets", name: "Property Sets", percentage: 94.9, status: "warning" },
        { id: "naming", name: "Naming Conventions", percentage: 95.7, status: "warning" },
    ],
    validationRules: [
        { ruleId: "OBJ-001", ruleName: "IfcWall Classification", severity: "CRITICAL", checked: 245, failed: 12, passRate: 95.1, notes: "Some walls missing IFC classification" },
        { ruleId: "OBJ-002", ruleName: "IfcDoor Type Definition", severity: "WARNING", checked: 89, failed: 5, passRate: 94.4, notes: "Door types need standardization" },
        { ruleId: "OBJ-003", ruleName: "IfcWindow Parameters", severity: "OK", checked: 156, failed: 0, passRate: 100, notes: "All windows properly classified" },
        { ruleId: "PROP-001", ruleName: "Fire Rating Property", severity: "CRITICAL", checked: 334, failed: 28, passRate: 91.6, notes: "Missing fire rating on structural elements" },
        { ruleId: "PROP-002", ruleName: "Material Property Set", severity: "WARNING", checked: 512, failed: 15, passRate: 97.1, notes: "Some elements lack material definitions" },
        { ruleId: "NAME-001", ruleName: "Element Naming Convention", severity: "WARNING", checked: 1024, failed: 45, passRate: 95.6, notes: "Naming inconsistencies detected" },
        { ruleId: "NAME-002", ruleName: "Level Naming Standard", severity: "OK", checked: 12, failed: 0, passRate: 100, notes: "Level names comply with standard" },
    ],
    missingProperties: [
        { severity: "CRITICAL", issueType: "Missing Property", ruleId: "PROP-001", ruleName: "Fire Rating Property", ifcGuid: "202Fr$t4X7...", elementType: "IfcWall", elementName: "Basic Wall:Interior...", level: "Level 1", propertySet: "Pset_WallCommon", propertyKey: "FireRating" },
        { severity: "CRITICAL", issueType: "Missing Property", ruleId: "PROP-001", ruleName: "Fire Rating Property", ifcGuid: "3P3Gs$u5Y8...", elementType: "IfcWall", elementName: "Basic Wall:Exterior...", level: "Level 1", propertySet: "Pset_WallCommon", propertyKey: "FireRating" },
        { severity: "WARNING", issueType: "Invalid Value", ruleId: "PROP-002", ruleName: "Material Property Set", ifcGuid: "1N1Eq$s3W6...", elementType: "IfcSlab", elementName: "Floor:Generic 200...", level: "Level 2", propertySet: "Pset_SlabCommon", propertyKey: "Material" },
        { severity: "WARNING", issueType: "Missing Property", ruleId: "PROP-003", ruleName: "Acoustic Rating", ifcGuid: "4Q4Ht$v6Z9...", elementType: "IfcWall", elementName: "Basic Wall:Partition...", level: "Level 3", propertySet: "Pset_WallCommon", propertyKey: "AcousticRating" },
        { severity: "CRITICAL", issueType: "Missing Property", ruleId: "PROP-001", ruleName: "Fire Rating Property", ifcGuid: "5R5Iu$w7A0...", elementType: "IfcDoor", elementName: "Door:Fire Door-Si...", level: "Level 1", propertySet: "Pset_DoorCommon", propertyKey: "FireRating" },
        { severity: "WARNING", issueType: "Inconsistent Value", ruleId: "PROP-004", ruleName: "Thermal Transmittance", ifcGuid: "6S6Jv$x8B1...", elementType: "IfcWindow", elementName: "Window:Fixed:6789...", level: "Level 2", propertySet: "Pset_WindowCommon", propertyKey: "ThermalTransmittance" },
    ],
    terminologyMappings: [
        { original: "Grundriss", suggestedEN: "Floor Plan", suggestedDE: "Grundriss", confidence: 98, status: "PROPOSED" },
        { original: "Schnitt", suggestedEN: "Section", suggestedDE: "Schnitt", confidence: 97, status: "PROPOSED" },
        { original: "Ansicht", suggestedEN: "Elevation", suggestedDE: "Ansicht", confidence: 96, status: "PROPOSED" },
        { original: "Decke", suggestedEN: "Ceiling", suggestedDE: "Decke", confidence: 95, status: "PROPOSED" },
        { original: "Fußboden", suggestedEN: "Floor", suggestedDE: "Fußboden", confidence: 94, status: "PROPOSED" },
        { original: "Innenwand", suggestedEN: "Interior Wall", suggestedDE: "Innenwand", confidence: 99, status: "ACCEPTED" },
        { original: "Außenwand", suggestedEN: "Exterior Wall", suggestedDE: "Außenwand", confidence: 99, status: "ACCEPTED" },
    ],
    lastScan: "31/01/2026, 15:19:23",
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
    name: "testproject",
    stats: getDefaultStats(),
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([defaultProject]);
    const [currentProjectId, setCurrentProjectId] = useState<string>("testproject");

    const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];

    const setCurrentProject = useCallback((projectId: string) => {
        setCurrentProjectId(projectId);
    }, []);

    const createNewProject = useCallback((name: string) => {
        const newProject: Project = {
            id: name.toLowerCase().replace(/\s+/g, "-"),
            name,
            stats: getEmptyStats(),
        };
        setProjects(prev => [...prev, newProject]);
        setCurrentProjectId(newProject.id);
    }, []);

    return (
        <ProjectContext.Provider value={{ currentProject, projects, setCurrentProject, createNewProject }}>
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
