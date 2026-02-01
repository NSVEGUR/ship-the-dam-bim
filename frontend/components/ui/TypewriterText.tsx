"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
    text: string;
    speed?: number;
    className?: string;
    onComplete?: () => void;
    start?: boolean;
}

export function TypewriterText({ text, speed = 15, className, onComplete, start = true }: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Reset when text changes
    useEffect(() => {
        setDisplayedText("");
        setCurrentIndex(0);
        setIsComplete(false);
    }, [text]);

    useEffect(() => {
        if (!start) return;
        if (isComplete) return;

        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else {
            setIsComplete(true);
            if (onComplete) {
                onComplete();
            }
        }
    }, [currentIndex, text, speed, onComplete, start, isComplete]);

    return <p className={className}>{displayedText}</p>;
}
