import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateScenarioVersion } from "@/features/scenario/hooks/use-scenarios";
import {
    constraintsFormSchema,
    type ConstraintsFormInput,
} from "@/features/scenario/types/schema";

export function ConstraintsSection({
    scenarioId,
    versionId,
    constraints,
    readOnly = false,
}: {
    scenarioId: string;
    versionId: string;
    constraints: string[];
    readOnly?: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const updateVersion = useUpdateScenarioVersion(scenarioId);

    if (!isEditing) {
        return (
            <div className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Constraints
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
                {constraints.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Not filled in yet.
                    </p>
                ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {constraints.map((c, i) => (
                            <span
                                key={i}
                                className="rounded-full border border-border px-2.5 py-0.5 text-xs">
                                {c}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <ConstraintsForm
            versionId={versionId}
            initialValues={constraints}
            isPending={updateVersion.isPending}
            onSave={(values) =>
                updateVersion.mutate(
                    { versionId, patch: { constraints: values } },
                    {
                        onSuccess: () => {
                            toast.success("Constraints saved");
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

function ConstraintsForm({
    initialValues,
    isPending,
    onSave,
    onCancel,
}: {
    versionId: string;
    initialValues: string[];
    isPending: boolean;
    onSave: (values: string[]) => void;
    onCancel: () => void;
}) {
    const { control, register, handleSubmit } = useForm<ConstraintsFormInput>({
        resolver: zodResolver(constraintsFormSchema),
        defaultValues: {
            entries: initialValues.map((value) => ({ value })),
        },
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "entries",
    });

    const submit = (data: ConstraintsFormInput) => {
        onSave(data.entries.map((e) => e.value));
    };

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="space-y-3 rounded-lg border border-border p-4">
            <h2 className="text-sm font-medium text-muted-foreground">
                Constraints
            </h2>

            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                        <Input
                            placeholder="Cannot relocate"
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
                Add constraint
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
