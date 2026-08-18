import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateScenarioVersion } from "@/features/scenario/hooks/use-scenarios";
import {
    currentStateFormSchema,
    type CurrentStateFormInput,
} from "@/features/scenario/types/schema";

export function CurrentStateSection({
    scenarioId,
    versionId,
    currentState,
    readOnly = false,
}: {
    scenarioId: string;
    versionId: string;
    currentState: Record<string, unknown>;
    readOnly?: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const updateVersion = useUpdateScenarioVersion(scenarioId);
    const entries = Object.entries(currentState);

    if (!isEditing) {
        return (
            <div className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Current situation
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
                {entries.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Not filled in yet.
                    </p>
                ) : (
                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                        {entries.map(([key, value]) => (
                            <div key={key} className="contents">
                                <dt className="text-muted-foreground">{key}</dt>
                                <dd>{String(value)}</dd>
                            </div>
                        ))}
                    </dl>
                )}
            </div>
        );
    }

    return (
        <CurrentStateForm
            initialValues={currentState}
            isPending={updateVersion.isPending}
            onSave={(values) =>
                updateVersion.mutate(
                    { versionId, patch: { current_state: values } },
                    {
                        onSuccess: () => {
                            toast.success("Current situation saved");
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

function CurrentStateForm({
    initialValues,
    isPending,
    onSave,
    onCancel,
}: {
    initialValues: Record<string, unknown>;
    isPending: boolean;
    onSave: (values: Record<string, string>) => void;
    onCancel: () => void;
}) {
    const { control, register, handleSubmit } = useForm<CurrentStateFormInput>({
        resolver: zodResolver(currentStateFormSchema),
        defaultValues: {
            entries: Object.entries(initialValues).map(([key, value]) => ({
                key,
                value: String(value),
            })),
        },
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "entries",
    });

    const submit = (data: CurrentStateFormInput) => {
        const record: Record<string, string> = {};
        for (const entry of data.entries) {
            record[entry.key] = entry.value;
        }
        onSave(record);
    };

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="space-y-3 rounded-lg border border-border p-4">
            <h2 className="text-sm font-medium text-muted-foreground">
                Current situation
            </h2>

            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            placeholder="Age"
                            className="w-full sm:w-1/3"
                            {...register(`entries.${index}.key`)}
                        />
                        <Input
                            placeholder="25"
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
                onClick={() => append({ key: "", value: "" })}>
                Add field
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
