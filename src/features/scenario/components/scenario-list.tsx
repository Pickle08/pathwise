import { Link } from "react-router";
import { useScenarios } from "@/features/scenario/hooks/use-scenarios";

export function ScenarioList() {
    const { data: scenarios, isLoading, isError, error } = useScenarios();

    if (isLoading) {
        return (
            <p className="text-sm text-muted-foreground">
                Loading scenarios...
            </p>
        );
    }

    if (isError) {
        return (
            <p className="text-sm text-red-500">
                Failed to load scenarios: {error instanceof Error ? error.message : "Unknown error"}
            </p>
        );
    }

    if (!scenarios || scenarios.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No scenarios yet. Create your first one above.
            </p>
        );
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
                <Link
                    key={scenario.id}
                    to={`/scenario/${scenario.id}`}
                    className="rounded-xl border border-border p-4 transition-colors hover:border-primary/60 hover:bg-muted/40">
                    <h3 className="font-display text-lg font-semibold leading-snug">
                        {scenario.title}
                    </h3>
                    <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                        v{scenario.latest_version} ·{" "}
                        {new Date(scenario.updated_at).toLocaleDateString()}
                    </p>
                </Link>
            ))}
        </div>
    );
}
