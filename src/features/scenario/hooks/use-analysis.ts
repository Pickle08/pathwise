import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    generateAnalysis,
    listAnalysis,
} from "@/features/scenario/api/analysis";

const analysisKey = (optionId: string) => ["analysis", optionId] as const;

export function useOptionAnalysis(optionId: string) {
    return useQuery({
        queryKey: analysisKey(optionId),
        queryFn: () => listAnalysis(optionId),
    });
}

export function useGenerateAnalysis(optionId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => generateAnalysis(optionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: analysisKey(optionId) });
        },
    });
}
