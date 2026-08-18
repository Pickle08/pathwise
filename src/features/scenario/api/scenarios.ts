import { supabase } from "@/lib/supabase/client";
import type {
    CreateScenarioInput,
    ScenarioRow,
    ScenarioVersionRow,
} from "@/features/scenario/types/schema";

/**
 * Creates a scenario + its first version.
 *
 * NOTE: this is two separate inserts, not a single DB transaction. Supabase's
 * JS client doesn't expose multi-statement transactions directly — the
 * "correct" long-term fix is a Postgres RPC function that wraps both inserts
 * in `begin/commit`. For now we do a manual best-effort rollback: if the
 * version insert fails, we delete the scenario we just created so we don't
 * leave an orphaned scenario with zero versions. Revisit with an RPC if this
 * ever needs to be bulletproof (e.g. once multiple version-mutating actions
 * exist and race conditions become more likely).
 */
export async function createScenario(
    input: CreateScenarioInput,
): Promise<ScenarioRow> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: scenario, error: scenarioError } = await supabase
        .from("scenarios")
        .insert({ title: input.title, user_id: user.id })
        .select()
        .single();

    if (scenarioError) throw scenarioError;

    const { error: versionError } = await supabase
        .from("scenario_versions")
        .insert({
            scenario_id: scenario.id,
            version_number: 1,
            description: input.description || null,
            goal: input.goal || null,
        });

    if (versionError) {
        await supabase.from("scenarios").delete().eq("id", scenario.id);
        throw versionError;
    }

    // Keep latest_version in sync with what we just inserted.
    await supabase
        .from("scenarios")
        .update({ latest_version: 1 })
        .eq("id", scenario.id);

    return { ...scenario, latest_version: 1 };
}

export async function listScenarios(): Promise<ScenarioRow[]> {
    const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) throw error;
    return data;
}

export async function updateScenarioVisibility(
    id: string,
    visibility: ScenarioRow["visibility"],
): Promise<ScenarioRow> {
    const { data, error } = await supabase
        .from("scenarios")
        .update({ visibility })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export interface ScenarioDetail {
    scenario: ScenarioRow;
    version: ScenarioVersionRow;
}

export async function getScenarioDetail(id: string): Promise<ScenarioDetail> {
    const { data: scenario, error: scenarioError } = await supabase
        .from("scenarios")
        .select("*")
        .eq("id", id)
        .single();

    if (scenarioError) throw scenarioError;

    const { data: version, error: versionError } = await supabase
        .from("scenario_versions")
        .select("*")
        .eq("scenario_id", id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

    if (versionError) throw versionError;

    return { scenario, version };
}

export async function listScenarioVersions(
    scenarioId: string,
): Promise<ScenarioVersionRow[]> {
    const { data, error } = await supabase
        .from("scenario_versions")
        .select("*")
        .eq("scenario_id", scenarioId)
        .order("version_number", { ascending: false });

    if (error) throw error;
    return data;
}
