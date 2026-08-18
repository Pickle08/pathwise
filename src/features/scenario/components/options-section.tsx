import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OptionCard } from "@/features/scenario/components/option-card";
import { OptionForm } from "@/features/scenario/components/option-form";
import {
    useCreateOption,
    useOptions,
} from "@/features/scenario/hooks/use-options";

export function OptionsSection({ scenarioId }: { scenarioId: string }) {
    const { data: options, isLoading, isError, error } = useOptions(scenarioId);
    const createOption = useCreateOption(scenarioId);
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                    Options
                </h2>
                {!showAddForm && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddForm(true)}>
                        Add option
                    </Button>
                )}
            </div>

            <div className="mt-2 space-y-3">
                {showAddForm && (
                    <OptionForm
                        isPending={createOption.isPending}
                        submitLabel="Add"
                        onCancel={() => setShowAddForm(false)}
                        onSubmit={(values) =>
                            createOption.mutate(values, {
                                onSuccess: () => {
                                    toast.success("Option added");
                                    setShowAddForm(false);
                                },
                                onError: (err) => toast.error(err.message),
                            })
                        }
                    />
                )}

                {isLoading && (
                    <p className="text-sm text-muted-foreground">
                        Loading options...
                    </p>
                )}

                {isError && (
                    <p className="text-sm text-red-500">
                        Failed to load options: {error instanceof Error ? error.message : "Unknown error"}
                    </p>
                )}

                {options && options.length === 0 && !showAddForm && (
                    <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                        No options yet. This is the core of the decision — add
                        at least two to compare.
                    </p>
                )}

                {options?.map((option) => (
                    <OptionCard
                        key={option.id}
                        option={option}
                        scenarioId={scenarioId}
                    />
                ))}
            </div>
        </div>
    );
}
