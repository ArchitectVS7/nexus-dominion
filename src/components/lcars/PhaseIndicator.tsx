import "./PhaseIndicator.css";

export interface PhaseIndicatorProps {
    phases: string[];
    currentPhase: number;
    variant?: "horizontal" | "compact";
}

export function PhaseIndicator({
    phases,
    currentPhase,
    variant = "horizontal",
}: PhaseIndicatorProps) {
    return (
        <div className={`lcars-phase lcars-phase--${variant}`}>
            {phases.map((phase, i) => (
                <div
                    key={phase}
                    className={`lcars-phase__step ${i === currentPhase
                            ? "lcars-phase__step--active"
                            : i < currentPhase
                                ? "lcars-phase__step--done"
                                : ""
                        }`}
                >
                    {/* Connector line (not before the first item) */}
                    {i > 0 && (
                        <div
                            className={`lcars-phase__connector ${i <= currentPhase ? "lcars-phase__connector--filled" : ""
                                }`}
                        />
                    )}
                    <div className="lcars-phase__dot" />
                    <span className="lcars-phase__label">{phase}</span>
                </div>
            ))}
        </div>
    );
}
