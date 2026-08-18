import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a career and life-decision analyst. Given a decision scenario and one option the user is considering, produce a structured analysis.

Respond with ONLY a JSON object, no markdown fences, no commentary before or after. Use exactly this shape:

{
  "summary": "2-3 sentence overall take on this option given the person's context",
  "benefits": ["short benefit 1", "short benefit 2", "..."],
  "risks": ["short risk 1", "short risk 2", "..."],
  "requirements": ["skill or resource needed 1", "..."],
  "opportunity_cost": "1-2 sentences on what they give up by choosing this",
  "hidden_cost": "1-2 sentences on non-obvious costs (time, stress, relationships, etc)",
  "timeline": "rough realistic timeframe for this path, e.g. '6-12 months to see results'",
  "confidence": "low" | "medium" | "high"
}

Ground every point in the specific context given — their constraints, priorities, and current situation — rather than generic advice. Keep each list item under 15 words.`;

function buildUserPrompt(option: any, version: any): string {
    const currentState =
        Object.entries(version.current_state ?? {})
            .map(([k, v]) => `- ${k}: ${v}`)
            .join("\n") || "(not specified)";

    const constraints =
        (version.constraints ?? []).length > 0
            ? (version.constraints as string[]).map((c) => `- ${c}`).join("\n")
            : "(none specified)";

    const priorities =
        Object.entries(version.priorities ?? {})
            .map(([k, v]) => `- ${k}: ${v}/10`)
            .join("\n") || "(not specified)";

    return `DECISION CONTEXT
Goal: ${version.goal ?? "(not specified)"}
Description: ${version.description ?? "(not specified)"}

Current situation:
${currentState}

Constraints:
${constraints}

Priorities (0-10 scale):
${priorities}

OPTION BEING ANALYZED
Title: ${option.title}
Description: ${option.description ?? "(not specified)"}

Analyze this specific option against the context above.`;
}

function extractJson(text: string): any {
    // Models sometimes wrap JSON in markdown fences despite instructions.
    // Strip fences if present, then find the first {...} block as a fallback.
    const stripped = text.replace(/```json\s*|```\s*/g, "").trim();
    try {
        return JSON.parse(stripped);
    } catch {
        const match = stripped.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error("Model did not return valid JSON");
    }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { optionId } = await req.json();
        if (!optionId) throw new Error("optionId is required");

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Missing authorization header");

        // Uses the caller's own JWT, so RLS applies exactly as it would for a
        // normal client request — this function can only ever read/write data
        // the logged-in user already has access to.
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: authHeader } } },
        );

        const { data: option, error: optionError } = await supabase
            .from("options")
            .select("*")
            .eq("id", optionId)
            .single();
        if (optionError) throw optionError;

        const { data: version, error: versionError } = await supabase
            .from("scenario_versions")
            .select("*")
            .eq("scenario_id", option.scenario_id)
            .order("version_number", { ascending: false })
            .limit(1)
            .single();
        if (versionError) throw versionError;

        const openrouterRes = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "openrouter/free",
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        {
                            role: "user",
                            content: buildUserPrompt(option, version),
                        },
                    ],
                }),
            },
        );

        if (!openrouterRes.ok) {
            const errText = await openrouterRes.text();
            throw new Error(
                `OpenRouter error (${openrouterRes.status}): ${errText}`,
            );
        }

        const openrouterData = await openrouterRes.json();
        const content = openrouterData.choices?.[0]?.message?.content;
        if (!content) throw new Error("No content returned from model");

        const parsed = extractJson(content);

        const { data: existing } = await supabase
            .from("option_analysis")
            .select("version_number")
            .eq("option_id", optionId)
            .order("version_number", { ascending: false })
            .limit(1);

        const nextVersion =
            existing && existing.length > 0
                ? existing[0].version_number + 1
                : 1;

        const { data: inserted, error: insertError } = await supabase
            .from("option_analysis")
            .insert({
                option_id: optionId,
                version_number: nextVersion,
                benefits: parsed.benefits ?? [],
                risks: parsed.risks ?? [],
                requirements: parsed.requirements ?? [],
                opportunity_cost: parsed.opportunity_cost ?? null,
                hidden_cost: parsed.hidden_cost ?? null,
                timeline: parsed.timeline ?? null,
                summary: parsed.summary ?? null,
                confidence: parsed.confidence ?? null,
            })
            .select()
            .single();
        if (insertError) throw insertError;

        await supabase
            .from("options")
            .update({ status: "analyzed" })
            .eq("id", optionId);

        return new Response(JSON.stringify(inserted), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return new Response(JSON.stringify({ error: message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
