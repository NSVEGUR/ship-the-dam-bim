"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Profile {
    id: string;
    name: string;
    description: string;
    icon: string;
}

const profiles: Profile[] = [
    {
        id: "ifc-basic",
        name: "IFC Basic",
        description: "Basic IFC validation rules",
        icon: "📋"
    },
    {
        id: "ifc-advanced",
        name: "IFC Advanced",
        description: "Advanced property and geometry checks",
        icon: "⚙️"
    },
    {
        id: "custom",
        name: "Custom Profile",
        description: "Custom validation rules",
        icon: "🔧"
    },
];

export function ProfilesSection() {
    const [selectedProfile, setSelectedProfile] = useState<string>("ifc-basic");

    return (
        <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-gray-900">Validation Profiles</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
                {profiles.map((profile) => (
                    <button
                        key={profile.id}
                        onClick={() => setSelectedProfile(profile.id)}
                        className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors text-center",
                            selectedProfile === profile.id
                                ? "border-emerald-400 bg-emerald-50"
                                : "border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center text-2xl",
                            selectedProfile === profile.id
                                ? "bg-emerald-100"
                                : "bg-gray-100"
                        )}>
                            {profile.icon}
                        </div>
                        <div>
                            <p className={cn(
                                "text-sm font-medium",
                                selectedProfile === profile.id ? "text-emerald-700" : "text-gray-900"
                            )}>
                                {profile.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{profile.description}</p>
                        </div>
                        {selectedProfile === profile.id && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </CardContent>
        </Card>
    );
}
