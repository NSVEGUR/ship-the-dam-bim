"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface ScanningOverlayProps {
    isVisible: boolean;
}

const LOADING_STEPS = [
    "Parsing IFC file...",
    "Analyzing building elements...",
    "Running compliance checks...",
    "Generating AI suggestions...",
    "Preparing readiness report...",
];

export function ScanningOverlay({ isVisible }: ScanningOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setCurrentStep(0);
            return;
        }

        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % LOADING_STEPS.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden"
        >
            {/* Fullscreen Gemini-style animated background */}
            <div className="absolute inset-0 ai-gemini-bg" />
            <div className="absolute inset-0 ai-gemini-shimmer" />

            {/* Sparkle elements scattered across the screen */}
            <div className="ai-sparkle" style={{ top: '10%', left: '15%' }} />
            <div className="ai-sparkle" style={{ top: '25%', right: '20%' }} />
            <div className="ai-sparkle" style={{ top: '60%', left: '10%' }} />
            <div className="ai-sparkle" style={{ top: '40%', right: '15%' }} />
            <div className="ai-sparkle" style={{ bottom: '20%', left: '25%' }} />
            <div className="ai-sparkle" style={{ bottom: '30%', right: '30%' }} />
            <div className="ai-sparkle" style={{ top: '50%', left: '50%' }} />

            {/* Subtle glass overlay for better content visibility */}
            <div className="absolute inset-0 bg-white/40 dark:bg-background/40 backdrop-blur-[2px]" />

            {/* Centered content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="w-20 h-20 rounded-2xl bg-white dark:bg-card border border-indigo-100 dark:border-indigo-800 flex items-center justify-center mb-6 shadow-lg relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/20 dark:from-indigo-900/50 dark:via-purple-900/30 dark:to-pink-900/20" />
                    <Sparkles className="h-10 w-10 text-indigo-500 dark:text-indigo-400 relative z-10 animate-pulse" />
                </motion.div>

                {/* Animated text that changes */}
                <div className="h-8 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-xl font-medium text-gray-800 dark:text-gray-100"
                        >
                            {LOADING_STEPS[currentStep]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Step indicator dots */}
                <div className="flex gap-2 mt-6">
                    {LOADING_STEPS.map((_, i) => (
                        <motion.div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === currentStep
                                ? 'bg-indigo-500 dark:bg-indigo-400'
                                : i < currentStep
                                    ? 'bg-indigo-300 dark:bg-indigo-600'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            animate={i === currentStep ? {
                                scale: [1, 1.3, 1],
                            } : {}}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
