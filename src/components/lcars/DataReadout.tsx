import "./DataReadout.css";

export interface DataReadoutProps {
    label: string;
    value: number | string;
    delta?: number;
    unit?: string;
    maxValue?: number;
}

export function DataReadout({
    label,
    value,
    delta,
    unit = "",
    maxValue,
}: DataReadoutProps) {
    const numericValue = typeof value === "number" ? value : parseFloat(value);
    const fillPercent = maxValue ? Math.min((numericValue / maxValue) * 100, 100) : null;

    return (
        <div className="lcars-readout">
            <span className="lcars-readout__label">{label}</span>
            <div className="lcars-readout__value-row">
                <span className="lcars-readout__value">
                    {typeof value === "number" ? value.toLocaleString() : value}
                    {unit && <span className="lcars-readout__unit">{unit}</span>}
                </span>
                {delta !== undefined && (
                    <span
                        className={`lcars-readout__delta ${delta > 0 ? "lcars-readout__delta--positive" : delta < 0 ? "lcars-readout__delta--negative" : ""
                            }`}
                    >
                        {delta > 0 ? "+" : ""}
                        {delta.toLocaleString()}
                    </span>
                )}
            </div>
            {fillPercent !== null && (
                <div className="lcars-readout__bar">
                    <div
                        className="lcars-readout__bar-fill"
                        style={{ width: `${fillPercent}%` }}
                    />
                </div>
            )}
        </div>
    );
}
