"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useProject } from "./ProjectContext";

interface NewProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [language, setLanguage] = useState("de");
    const [isCreating, setIsCreating] = useState(false);
    const { createNewProject } = useProject();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (projectName.trim()) {
            setIsCreating(true);
            try {
                await createNewProject(projectName.trim(), description.trim(), language);
                setProjectName("");
                setDescription("");
                setLanguage("de");
                onOpenChange(false);
            } catch (error) {
                console.error("Failed to create project", error);
            } finally {
                setIsCreating(false);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Enter project details. Validation statistics will start fresh.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="project-name">Project Name</Label>
                            <Input
                                id="project-name"
                                placeholder="Enter project name..."
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="project-description">Description</Label>
                            <Textarea
                                id="project-description"
                                placeholder="Enter project description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="project-language">Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="de">German (DE)</SelectItem>
                                    <SelectItem value="en">English (EN)</SelectItem>
                                    <SelectItem value="fr">French (FR)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!projectName.trim() || isCreating}>
                            {isCreating ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
