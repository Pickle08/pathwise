import { supabase } from "@/lib/supabase/client";
import type { OptionInput, OptionRow } from "@/features/scenario/types/schema";

export async function listOptions(scenarioId: string): Promise<OptionRow[]> {
    const { data, error } = await supabase
        .from("options")
        .select("*")
        .eq("scenario_id", scenarioId)
        .order("sort_order", { ascending: true });

    if (error) throw error;
    return data;
}

export async function createOption(
    scenarioId: string,
    input: OptionInput,
): Promise<OptionRow> {
    // Append at the end — fetch current count to compute sort_order.
    // Fine at this scale (a handful of options per scenario); if this ever
    // needs to survive concurrent inserts, move sort_order assignment into
    // a DB trigger instead of computing it client-side.
    const { count } = await supabase
        .from("options")
        .select("*", { count: "exact", head: true })
        .eq("scenario_id", scenarioId);

    const { data, error } = await supabase
        .from("options")
        .insert({
            scenario_id: scenarioId,
            title: input.title,
            description: input.description || null,
            sort_order: count ?? 0,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateOption(
    id: string,
    input: OptionInput,
): Promise<OptionRow> {
    const { data, error } = await supabase
        .from("options")
        .update({
            title: input.title,
            description: input.description || null,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteOption(id: string): Promise<void> {
    const { error } = await supabase.from("options").delete().eq("id", id);
    if (error) throw error;
}
