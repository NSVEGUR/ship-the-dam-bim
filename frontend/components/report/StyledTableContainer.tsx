"use client";

import { ReactNode } from "react";

interface StyledTableContainerProps {
    children: ReactNode;
    className?: string;
}

export function StyledTableContainer({ children, className = "" }: StyledTableContainerProps) {
    return (
        <div className={`rounded-xl border border-gray-200 bg-white overflow-hidden ${className}`}>
            {children}
        </div>
    );
}
