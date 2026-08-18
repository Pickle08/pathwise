import { supabase } from "@/lib/supabase/client";
import type { OptionAnalysisRow } from "@/features/scenario/types/schema";

export async function listAnalysis(
    optionId: string,
): Promise<OptionAnalysisRow[]> {
    const { data, error } = await supabase
        .from("option_analysis")
        .select("*")
        .eq("option_id", optionId)
        .order("version_number", { ascending: false });

    if (error) throw error;
    return data;
}

export async function generateAnalysis(
    optionId: string,
): Promise<OptionAnalysisRow> {
    const { data, error } = await supabase.functions.invoke(
        "generate-analysis",
        {
            body: { optionId },
        },
    );

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data as OptionAnalysisRow;
}
