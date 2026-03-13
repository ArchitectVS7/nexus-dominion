import { ReactNode } from "react";
import "./Button.css";

export interface ButtonProps {
    label: string;
    variant?: "primary" | "secondary" | "danger";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    onClick?: () => void;
    children?: ReactNode;
}

export function Button({
    label,
    variant = "primary",
    size = "md",
    disabled = false,
    onClick,
}: ButtonProps) {
    return (
        <button
            className={`lcars-btn lcars-btn--${variant} lcars-btn--${size}`}
            disabled={disabled}
            onClick={onClick}
            type="button"
        >
            {label}
        </button>
    );
}
