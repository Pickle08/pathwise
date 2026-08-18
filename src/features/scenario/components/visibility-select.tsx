import { toast } from "sonner";
import { useUpdateScenarioVisibility } from "@/features/scenario/hooks/use-scenarios";
import type { ScenarioRow } from "@/features/scenario/types/schema";

const OPTIONS: { value: ScenarioRow["visibility"]; label: string }[] = [
    { value: "private", label: "Private — only you" },
    { value: "unlisted", label: "Unlisted — anyone with the link" },
    { value: "public", label: "Public — visible to everyone" },
];

export function VisibilitySelect({
    scenarioId,
    visibility,
}: {
    scenarioId: string;
    visibility: ScenarioRow["visibility"];
}) {
    const updateVisibility = useUpdateScenarioVisibility(scenarioId);

    return (
        <select
            value={visibility}
            disabled={updateVisibility.isPending}
            onChange={(e) => {
                const next = e.target.value as ScenarioRow["visibility"];
                updateVisibility.mutate(next, {
                    onSuccess: () => toast.success(`Visibility set to ${next}`),
                    onError: (err) => toast.error(err.message),
                });
            }}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50">
            {OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
