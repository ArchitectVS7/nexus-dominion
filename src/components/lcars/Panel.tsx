import { ReactNode } from "react";
import "./Panel.css";

export interface PanelProps {
    title: string;
    variant?: "default" | "alert" | "info";
    onClose?: () => void;
    children: ReactNode;
    className?: string;
}

export function Panel({
    title,
    variant = "default",
    onClose,
    children,
    className = "",
}: PanelProps) {
    return (
        <div className={`lcars-panel lcars-panel--${variant} ${className}`}>
            <div className="lcars-panel__accent" />
            <div className="lcars-panel__header">
                <h2 className="lcars-panel__title">{title}</h2>
                {onClose && (
                    <button
                        className="lcars-panel__close"
                        onClick={onClose}
                        aria-label="Close panel"
                    >
                        ×
                    </button>
                )}
            </div>
            <div className="lcars-panel__body">{children}</div>
        </div>
    );
}
