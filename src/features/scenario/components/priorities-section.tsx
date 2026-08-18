import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUpdateScenarioVersion } from "@/features/scenario/hooks/use-scenarios";
import {
    prioritiesFormSchema,
    type PrioritiesFormInput,
} from "@/features/scenario/types/schema";

const CATEGORIES: { key: keyof PrioritiesFormInput; label: string }[] = [
    { key: "money", label: "Money" },
    { key: "learning", label: "Learning" },
    { key: "work_life_balance", label: "Work-Life Balance" },
    { key: "career_growth", label: "Career Growth" },
];

export function PrioritiesSection({
    scenarioId,
    versionId,
    priorities,
    readOnly = false,
}: {
    scenarioId: string;
    versionId: string;
    priorities: Record<string, number>;
    readOnly?: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const updateVersion = useUpdateScenarioVersion(scenarioId);
    const hasValues = Object.keys(priorities).length > 0;

    if (!isEditing) {
        return (
            <div className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Priorities
                    </h2>
                    {!readOnly && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                    )}
                </div>
                {!hasValues ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Not filled in yet.
                    </p>
                ) : (
                    <div className="mt-3 space-y-2">
                        {CATEGORIES.map(({ key, label }) => {
                            const value = priorities[key] ?? 0;
                            return (
                                <div key={key}>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{label}</span>
                                        <span className="font-mono">
                                            {value}/10
                                        </span>
                                    </div>
                                    <div className="mt-1 h-2 rounded-full bg-muted">
                                        <div
                                            className="h-2 rounded-full bg-primary"
                                            style={{
                                                width: `${(value / 10) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <PrioritiesForm
            initialValues={priorities}
            isPending={updateVersion.isPending}
            onSave={(values) =>
                updateVersion.mutate(
                    { versionId, patch: { priorities: values } },
                    {
                        onSuccess: () => {
                            toast.success("Priorities saved");
                            setIsEditing(false);
                        },
                        onError: (err) => toast.error(err.message),
                    },
                )
            }
            onCancel={() => setIsEditing(false)}
        />
    );
}

function PrioritiesForm({
    initialValues,
    isPending,
    onSave,
    onCancel,
}: {
    initialValues: Record<string, number>;
    isPending: boolean;
    onSave: (values: PrioritiesFormInput) => void;
    onCancel: () => void;
}) {
    const { register, handleSubmit, watch } = useForm<PrioritiesFormInput>({
        resolver: zodResolver(prioritiesFormSchema),
        defaultValues: {
            money: initialValues.money ?? 5,
            learning: initialValues.learning ?? 5,
            work_life_balance: initialValues.work_life_balance ?? 5,
            career_growth: initialValues.career_growth ?? 5,
        },
    });
    const values = watch();

    return (
        <form
            onSubmit={handleSubmit(onSave)}
            className="space-y-4 rounded-lg border border-border p-4">
            <h2 className="text-sm font-medium text-muted-foreground">
                Priorities
            </h2>

            {CATEGORIES.map(({ key, label }) => (
                <div key={key}>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{label}</span>
                        <span className="font-mono">{values[key]}/10</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        className="mt-1 w-full accent-primary"
                        {...register(key, { valueAsNumber: true })}
                    />
                </div>
            ))}

            <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" isLoading={isPending}>
                    Save
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
