import { useState } from "react";
import { Link, useParams } from "react-router";
import { ConstraintsSection } from "@/features/scenario/components/constraints-section";
import { CurrentStateSection } from "@/features/scenario/components/current-state-section";
import { JourneyStep } from "@/features/scenario/components/journey-step";
import { OptionsSection } from "@/features/scenario/components/options-section";
import { PrioritiesSection } from "@/features/scenario/components/priorities-section";
import { ReflectionsSection } from "@/features/scenario/components/reflections-section";
import { TimelineSection } from "@/features/scenario/components/timeline-section";
import { VersionSelector } from "@/features/scenario/components/version-selector";
import { VisibilitySelect } from "@/features/scenario/components/visibility-select";
import {
    useScenarioDetail,
    useScenarioVersions,
} from "@/features/scenario/hooks/use-scenarios";

export function ScenarioDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, isError, error } = useScenarioDetail(id);
    const { data: versions } = useScenarioVersions(id);
    const [selectedVersionNumber, setSelectedVersionNumber] = useState<number | null>(
        null,
    );

    if (isLoading) {
        return (
            <div className="p-8">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="p-8">
                <p className="text-sm text-red-500">
                    Failed to load scenario:{" "}
                    {error instanceof Error ? error.message : "Not found"}
                </p>
                <Link to="/" className="mt-4 inline-block text-sm underline">
                    Back to dashboard
                </Link>
            </div>
        );
    }

    const { scenario, version: latestVersion } = data;

    const viewedVersion =
        (selectedVersionNumber !== null &&
            versions?.find(
                (v) => v.version_number === selectedVersionNumber,
            )) ||
        latestVersion;

    const isViewingLatest =
        viewedVersion.version_number === latestVersion.version_number;

    return (
        <div className="mx-auto max-w-2xl p-4 sm:p-8">
            <Link
                to="/"
                className="text-sm text-muted-foreground hover:underline">
                ← Back to dashboard
            </Link>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                    {scenario.title}
                </h1>
                <div className="flex shrink-0 items-center gap-2">
                    <VisibilitySelect
                        scenarioId={scenario.id}
                        visibility={scenario.visibility}
                    />
                    <VersionSelector
                        versions={versions ?? [latestVersion]}
                        selectedVersionNumber={viewedVersion.version_number}
                        onChange={setSelectedVersionNumber}
                    />
                </div>
            </div>

            {!isViewingLatest && (
                <div className="mt-4 rounded-md border border-dashed border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    Viewing v{viewedVersion.version_number} — historical,
                    read-only. Switch to the latest version to make changes.
                </div>
            )}

            <div className="mt-6 space-y-4">
                <Field label="Description" value={viewedVersion.description} />
                <Field label="Goal" value={viewedVersion.goal} />
            </div>

            {/* The journey: each step is a real point in the decision process,
          in order — situation, constraints, options, timeline, priorities,
          reflection. The numbering and spine reflect that sequence rather
          than decorating it. */}
            <div className="relative mt-8">
                <div className="absolute bottom-2 left-[13px] top-2 w-px bg-border" />
                <div className="space-y-6">
                    <JourneyStep index={1}>
                        <CurrentStateSection
                            scenarioId={scenario.id}
                            versionId={viewedVersion.id}
                            currentState={viewedVersion.current_state}
                            readOnly={!isViewingLatest}
                        />
                    </JourneyStep>
                    <JourneyStep index={2}>
                        <ConstraintsSection
                            scenarioId={scenario.id}
                            versionId={viewedVersion.id}
                            constraints={viewedVersion.constraints}
                            readOnly={!isViewingLatest}
                        />
                    </JourneyStep>
                    <JourneyStep index={3}>
                        <OptionsSection scenarioId={scenario.id} />
                    </JourneyStep>
                    <JourneyStep index={4}>
                        <TimelineSection
                            scenarioId={scenario.id}
                            versionId={viewedVersion.id}
                            timeline={viewedVersion.timeline}
                            readOnly={!isViewingLatest}
                        />
                    </JourneyStep>
                    <JourneyStep index={5}>
                        <PrioritiesSection
                            scenarioId={scenario.id}
                            versionId={viewedVersion.id}
                            priorities={viewedVersion.priorities}
                            readOnly={!isViewingLatest}
                        />
                    </JourneyStep>
                    {isViewingLatest && (
                        <JourneyStep index={6}>
                            <ReflectionsSection
                                scenarioId={scenario.id}
                                version={latestVersion}
                            />
                        </JourneyStep>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string | null }) {
    return (
        <div>
            <h2 className="text-sm font-medium text-muted-foreground">
                {label}
            </h2>
            <p className="mt-1 whitespace-pre-wrap">
                {value || (
                    <span className="text-muted-foreground italic">Empty</span>
                )}
            </p>
        </div>
    );
}
