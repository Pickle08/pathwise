import { supabase } from "@/lib/supabase/client";
import type { ScenarioVersionRow } from "@/features/scenario/types/schema";

// Updates the current version IN PLACE — no new row, no version bump.
// This is deliberate: version bumps only happen at Reflection checkpoints
// (see the RLS/versioning note from the schema design). Editing
// current_state/constraints/priorities is just refining the current
// snapshot, not creating meaningful history.
export type ScenarioVersionPatch = Partial<
    Pick<
        ScenarioVersionRow,
        "current_state" | "constraints" | "priorities" | "timeline"
    >
>;

export async function updateScenarioVersion(
    versionId: string,
    patch: ScenarioVersionPatch,
): Promise<ScenarioVersionRow> {
    const { data, error } = await supabase
        .from("scenario_versions")
        .update(patch)
        .eq("id", versionId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Creates a new version by cloning the latest one's content. This is the
// ONLY place a new scenario_versions row gets inserted after v1 — everyday
// edits to current_state/constraints/priorities stay in-place (see
// updateScenarioVersion above). A version bump is a deliberate checkpoint,
// meant to happen alongside a Reflection ("I graduated, updating my plan").
export async function createNewVersion(
    scenarioId: string,
    latestVersion: ScenarioVersionRow,
): Promise<ScenarioVersionRow> {
    const nextVersionNumber = latestVersion.version_number + 1;

    const { data: newVersion, error: versionError } = await supabase
        .from("scenario_versions")
        .insert({
            scenario_id: scenarioId,
            version_number: nextVersionNumber,
            description: latestVersion.description,
            goal: latestVersion.goal,
            current_state: latestVersion.current_state,
            constraints: latestVersion.constraints,
            priorities: latestVersion.priorities,
            timeline: latestVersion.timeline,
        })
        .select()
        .single();

    if (versionError) throw versionError;

    const { error: scenarioError } = await supabase
        .from("scenarios")
        .update({ latest_version: nextVersionNumber })
        .eq("id", scenarioId);

    if (scenarioError) throw scenarioError;

    return newVersion;
}
