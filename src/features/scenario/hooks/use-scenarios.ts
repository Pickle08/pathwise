import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createScenario,
    getScenarioDetail,
    listScenarios,
    listScenarioVersions,
    updateScenarioVisibility,
} from "@/features/scenario/api/scenarios";
import {
    createNewVersion,
    updateScenarioVersion,
    type ScenarioVersionPatch,
} from "@/features/scenario/api/scenario-version";
import type {
    CreateScenarioInput,
    ScenarioRow,
    ScenarioVersionRow,
} from "@/features/scenario/types/schema";

const scenariosKey = ["scenarios"] as const;
const scenarioDetailKey = (id: string) => ["scenarios", id] as const;

export function useScenarios() {
    return useQuery({
        queryKey: scenariosKey,
        queryFn: listScenarios,
    });
}

export function useScenarioDetail(id: string | undefined) {
    return useQuery({
        queryKey: scenarioDetailKey(id ?? ""),
        queryFn: () => getScenarioDetail(id as string),
        enabled: !!id,
    });
}

export function useScenarioVersions(id: string | undefined) {
    return useQuery({
        queryKey: ["scenarios", id ?? "", "versions"] as const,
        queryFn: () => listScenarioVersions(id as string),
        enabled: !!id,
    });
}

export function useCreateScenario() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateScenarioInput) => createScenario(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scenariosKey });
        },
    });
}

export function useUpdateScenarioVersion(scenarioId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (args: {
            versionId: string;
            patch: ScenarioVersionPatch;
        }) => updateScenarioVersion(args.versionId, args.patch),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: scenarioDetailKey(scenarioId),
            });
        },
    });
}

export function useUpdateScenarioVisibility(scenarioId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (visibility: ScenarioRow["visibility"]) =>
            updateScenarioVisibility(scenarioId, visibility),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: scenarioDetailKey(scenarioId),
            });
            queryClient.invalidateQueries({ queryKey: scenariosKey });
        },
    });
}

export function useCreateNewVersion(scenarioId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (latestVersion: ScenarioVersionRow) =>
            createNewVersion(scenarioId, latestVersion),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: scenarioDetailKey(scenarioId),
            });
            queryClient.invalidateQueries({ queryKey: scenariosKey });
            queryClient.invalidateQueries({
                queryKey: ["scenarios", scenarioId, "versions"] as const,
            });
        },
    });
}
