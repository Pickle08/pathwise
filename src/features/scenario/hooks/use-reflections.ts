import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createReflection,
    listReflections,
} from "@/features/scenario/api/reflections";
import type { ReflectionInput } from "@/features/scenario/types/schema";

const reflectionsKey = (scenarioId: string) =>
    ["reflections", scenarioId] as const;

export function useReflections(scenarioId: string) {
    return useQuery({
        queryKey: reflectionsKey(scenarioId),
        queryFn: () => listReflections(scenarioId),
    });
}

export function useCreateReflection(scenarioId: string, versionId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: ReflectionInput) =>
            createReflection(scenarioId, versionId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: reflectionsKey(scenarioId),
            });
        },
    });
}
