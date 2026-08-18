import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createOption,
    deleteOption,
    listOptions,
    updateOption,
} from "@/features/scenario/api/options";
import type { OptionInput } from "@/features/scenario/types/schema";

const optionsKey = (scenarioId: string) => ["options", scenarioId] as const;

export function useOptions(scenarioId: string) {
    return useQuery({
        queryKey: optionsKey(scenarioId),
        queryFn: () => listOptions(scenarioId),
    });
}

export function useCreateOption(scenarioId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: OptionInput) => createOption(scenarioId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: optionsKey(scenarioId) });
        },
    });
}

export function useUpdateOption(scenarioId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: OptionInput }) =>
            updateOption(id, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: optionsKey(scenarioId) });
        },
    });
}

export function useDeleteOption(scenarioId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteOption(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: optionsKey(scenarioId) });
        },
    });
}
