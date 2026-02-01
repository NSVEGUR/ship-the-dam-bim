"use client";

import { ReactNode } from "react";

interface StyledTableContainerProps {
    children: ReactNode;
    className?: string;
}

export function StyledTableContainer({ children, className = "" }: StyledTableContainerProps) {
    return (
        <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden ${className}`}>
            {children}
        </div>
    );
}
