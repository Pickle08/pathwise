import type { ScenarioVersionRow } from "@/features/scenario/types/schema";

export function VersionSelector({
    versions,
    selectedVersionNumber,
    onChange,
}: {
    versions: ScenarioVersionRow[];
    selectedVersionNumber: number;
    onChange: (versionNumber: number) => void;
}) {
    if (versions.length <= 1) {
        return (
            <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                v{selectedVersionNumber}
            </span>
        );
    }

    return (
        <select
            value={selectedVersionNumber}
            onChange={(e) => onChange(Number(e.target.value))}
            className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            {versions.map((v) => (
                <option key={v.id} value={v.version_number}>
                    v{v.version_number}
                    {v.version_number === versions[0].version_number
                        ? " (latest)"
                        : ""}
                </option>
            ))}
        </select>
    );
}
