import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    useGenerateAnalysis,
    useOptionAnalysis,
} from "@/features/scenario/hooks/use-analysis";

const CONFIDENCE_COLOR: Record<string, string> = {
    low: "text-amber-600",
    medium: "text-blue-600",
    high: "text-green-600",
};

export function AnalysisPanel({ optionId }: { optionId: string }) {
    const { data: history, isLoading } = useOptionAnalysis(optionId);
    const generate = useGenerateAnalysis(optionId);
    const latest = history?.[0];

    const handleGenerate = () => {
        generate.mutate(undefined, {
            onSuccess: () => toast.success("Analysis generated"),
            onError: (err) => toast.error(err.message),
        });
    };

    return (
        <div className="mt-3 border-t border-border pt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-xs font-medium text-muted-foreground">
                    AI Analysis{latest ? ` — v${latest.version_number}` : ""}
                </h4>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerate}
                    isLoading={generate.isPending}>
                    {latest ? "Regenerate" : "Generate analysis"}
                </Button>
            </div>

            {generate.isPending && (
                <p className="mt-2 text-xs text-muted-foreground">
                    Calling the model — this can take 10-30 seconds on free-tier
                    models...
                </p>
            )}

            {isLoading && (
                <p className="mt-2 text-xs text-muted-foreground">Loading...</p>
            )}

            {!isLoading && !latest && !generate.isPending && (
                <p className="mt-2 text-xs text-muted-foreground">
                    No analysis yet.
                </p>
            )}

            {latest && (
                <div className="mt-3 space-y-3 text-sm">
                    {latest.summary && (
                        <div>
                            <p>{latest.summary}</p>
                            {latest.confidence && (
                                <span
                                    className={`mt-1 inline-block text-xs font-medium ${CONFIDENCE_COLOR[latest.confidence] ?? "text-muted-foreground"}`}>
                                    Confidence: {latest.confidence}
                                </span>
                            )}
                        </div>
                    )}

                    <AnalysisList label="Benefits" items={latest.benefits} />
                    <AnalysisList label="Risks" items={latest.risks} />
                    <AnalysisList
                        label="Requirements"
                        items={latest.requirements}
                    />

                    {latest.opportunity_cost && (
                        <AnalysisField
                            label="Opportunity cost"
                            value={latest.opportunity_cost}
                        />
                    )}
                    {latest.hidden_cost && (
                        <AnalysisField
                            label="Hidden cost"
                            value={latest.hidden_cost}
                        />
                    )}
                    {latest.timeline && (
                        <AnalysisField
                            label="Timeline"
                            value={latest.timeline}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function AnalysisList({ label, items }: { label: string; items: string[] }) {
    if (!items || items.length === 0) return null;
    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
                {items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

function AnalysisField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p>{value}</p>
        </div>
    );
}
