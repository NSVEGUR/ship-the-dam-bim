import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Project } from "@/components/ProjectContext";

export const exportFixPack = async (project: Project): Promise<void> => {
    try {
        const zip = new JSZip();

        // 1. Generate issues.csv
        const issuesHeader = "Rule ID,Rule Name,Severity,Checked,Failed,Pass Rate,Notes\n";
        const issuesRows = project.stats.validationRules.map(rule =>
            `"${rule.ruleId}","${rule.ruleName}","${rule.severity}",${rule.checked},${rule.failed},${rule.passRate},"${rule.notes.replace(/"/g, '""')}"`
        ).join("\n");
        zip.file("issues.csv", issuesHeader + issuesRows);

        // 2. Generate missing_properties.csv
        const mpHeader = "Severity,Issue Type,Rule ID,Element Type,Element Name,IFC GUID,Property Set,Property Key,Expected,Current\n";
        const mpRows = project.stats.missingProperties.map(mp =>
            `"${mp.severity}","${mp.issueType}","${mp.ruleId}","${mp.elementType}","${mp.elementName}","${mp.ifcGuid}","${mp.propertySet}","${mp.propertyKey}","${mp.expected || ''}","${mp.current || ''}"`
        ).join("\n");
        zip.file("missing_properties.csv", mpHeader + mpRows);

        // 3. Generate terminology.csv
        const termHeader = "Original Term,Suggested EN,Suggested DE,Status,Confidence\n";
        const termRows = project.stats.terminologyMappings.map(tm =>
            `"${tm.original}","${tm.suggestedEN}","${tm.suggestedDE}","${tm.status}",${tm.confidence}`
        ).join("\n");
        zip.file("terminology.csv", termHeader + termRows);

        // 4. Generate report.md
        const reportContent = `# Readiness Report: ${project.name}
Date: ${new Date().toLocaleDateString()}
Readiness Score: ${project.stats.readinessScore}%

## Overview
- Critical Issues: ${project.stats.issuesCritical}
- Warnings: ${project.stats.issuesWarning}
- OK: ${project.stats.issuesOk}

## Summary
Auto-generated report based on the latest scan.
`;
        zip.file("report.md", reportContent);

        // Generate zip file
        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, `fix-pack-${project.id}.zip`);

    } catch (error) {
        console.error("Export failed:", error);
        throw error; // Let caller handle alert/logging
    }
};
