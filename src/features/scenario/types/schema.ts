import { z } from "zod";

export const createScenarioSchema = z.object({
    title: z.string().min(3, "At least 3 characters").max(120),
    description: z.string().max(1000).optional(),
    goal: z.string().max(200).optional(),
});
export type CreateScenarioInput = z.infer<typeof createScenarioSchema>;

// Row shapes matching the Supabase schema (kept minimal — extend as more
// fields go live in the UI).
export interface ScenarioRow {
    id: string;
    user_id: string;
    title: string;
    status: "active" | "archived";
    visibility: "private" | "unlisted" | "public";
    latest_version: number;
    created_at: string;
    updated_at: string;
}

export interface ScenarioVersionRow {
    id: string;
    scenario_id: string;
    version_number: number;
    description: string | null;
    goal: string | null;
    current_state: Record<string, unknown>;
    constraints: string[];
    priorities: Record<string, number>;
    analysis: Record<string, unknown> | null;
    timeline: string[];
    change_note: string | null;
    created_at: string;
}

export interface OptionRow {
    id: string;
    scenario_id: string;
    title: string;
    description: string | null;
    status: "draft" | "analyzed";
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export const optionSchema = z.object({
    title: z.string().min(2, "At least 2 characters").max(120),
    description: z.string().max(1000).optional(),
});
export type OptionInput = z.infer<typeof optionSchema>;

// current_state: dynamic list of { key, value } pairs, converted to/from
// Record<string, string> at the API boundary.
export const currentStateFormSchema = z.object({
    entries: z.array(
        z.object({
            key: z.string().min(1, "Required"),
            value: z.string().min(1, "Required"),
        }),
    ),
});
export type CurrentStateFormInput = z.infer<typeof currentStateFormSchema>;

// constraints: dynamic list of plain strings, wrapped in { value } objects
// because react-hook-form's useFieldArray needs object items.
export const constraintsFormSchema = z.object({
    entries: z.array(
        z.object({
            value: z.string().min(1, "Required"),
        }),
    ),
});
export type ConstraintsFormInput = z.infer<typeof constraintsFormSchema>;

// timeline: ordered list of stage labels ("Today", "Graduate", "Junior", ...).
// Same shape as constraints — reusing the pattern deliberately since the
// editing UX is identical (dynamic list, add/remove, order = array index).
export const timelineFormSchema = z.object({
    entries: z.array(
        z.object({
            value: z.string().min(1, "Required"),
        }),
    ),
});
export type TimelineFormInput = z.infer<typeof timelineFormSchema>;

// priorities: fixed set of weighted categories, 0-10 each.
export const prioritiesFormSchema = z.object({
    money: z.number().min(0).max(10),
    learning: z.number().min(0).max(10),
    work_life_balance: z.number().min(0).max(10),
    career_growth: z.number().min(0).max(10),
});
export type PrioritiesFormInput = z.infer<typeof prioritiesFormSchema>;

export interface ReflectionRow {
    id: string;
    scenario_id: string;
    version_id: string | null;
    content: string;
    created_at: string;
}

export const reflectionSchema = z.object({
    content: z.string().min(3, "Write at least a few words").max(2000),
});
export type ReflectionInput = z.infer<typeof reflectionSchema>;

export interface OptionAnalysisRow {
    id: string;
    option_id: string;
    version_number: number;
    benefits: string[];
    risks: string[];
    requirements: string[];
    opportunity_cost: string | null;
    hidden_cost: string | null;
    timeline: string | null;
    summary: string | null;
    confidence: string | null;
    created_at: string;
}
