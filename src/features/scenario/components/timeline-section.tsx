import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateScenarioVersion } from "@/features/scenario/hooks/use-scenarios";
import {
    timelineFormSchema,
    type TimelineFormInput,
} from "@/features/scenario/types/schema";

export function TimelineSection({
    scenarioId,
    versionId,
    timeline,
    readOnly = false,
}: {
    scenarioId: string;
    versionId: string;
    timeline: string[];
    readOnly?: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const updateVersion = useUpdateScenarioVersion(scenarioId);

    if (!isEditing) {
        return (
            <div className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Timeline
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
                {timeline.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Not filled in yet.
                    </p>
                ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {timeline.map((stage, i) => (
                            <span key={i} className="flex items-center gap-2">
                                <span className="rounded-full border border-border px-3 py-1 text-sm">
                                    {stage}
                                </span>
                                {i < timeline.length - 1 && (
                                    <span className="text-muted-foreground">
                                        →
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <TimelineForm
            initialValues={timeline}
            isPending={updateVersion.isPending}
            onSave={(values) =>
                updateVersion.mutate(
                    { versionId, patch: { timeline: values } },
                    {
                        onSuccess: () => {
                            toast.success("Timeline saved");
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

function TimelineForm({
    initialValues,
    isPending,
    onSave,
    onCancel,
}: {
    initialValues: string[];
    isPending: boolean;
    onSave: (values: string[]) => void;
    onCancel: () => void;
}) {
    const { control, register, handleSubmit } = useForm<TimelineFormInput>({
        resolver: zodResolver(timelineFormSchema),
        defaultValues: {
            entries: initialValues.map((value) => ({ value })),
        },
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "entries",
    });

    const submit = (data: TimelineFormInput) => {
        onSave(data.entries.map((e) => e.value));
    };

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="space-y-3 rounded-lg border border-border p-4">
            <h2 className="text-sm font-medium text-muted-foreground">
                Timeline (in order)
            </h2>

            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <span className="hidden w-5 text-xs text-muted-foreground sm:inline">
                            {index + 1}.
                        </span>
                        <Input
                            placeholder="Graduate"
                            className="min-w-0 flex-1"
                            {...register(`entries.${index}.value`)}
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => remove(index)}>
                            Remove
                        </Button>
                    </div>
                ))}
            </div>

            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ value: "" })}>
                Add stage
            </Button>

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
