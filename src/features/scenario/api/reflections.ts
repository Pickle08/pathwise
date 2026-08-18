import { supabase } from "@/lib/supabase/client";
import type {
    ReflectionInput,
    ReflectionRow,
} from "@/features/scenario/types/schema";

export async function listReflections(
    scenarioId: string,
): Promise<ReflectionRow[]> {
    const { data, error } = await supabase
        .from("scenario_reflections")
        .select("*")
        .eq("scenario_id", scenarioId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

export async function createReflection(
    scenarioId: string,
    versionId: string,
    input: ReflectionInput,
): Promise<ReflectionRow> {
    const { data, error } = await supabase
        .from("scenario_reflections")
        .insert({
            scenario_id: scenarioId,
            version_id: versionId,
            content: input.content,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
