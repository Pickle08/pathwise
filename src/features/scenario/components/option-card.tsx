import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { OptionForm } from "@/features/scenario/components/option-form";
import {
    useDeleteOption,
    useUpdateOption,
} from "@/features/scenario/hooks/use-options";
import type { OptionRow } from "@/features/scenario/types/schema";
import { AnalysisPanel } from "@/features/scenario/components/analysis-panel";

export function OptionCard({
    option,
    scenarioId,
}: {
    option: OptionRow;
    scenarioId: string;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const updateOption = useUpdateOption(scenarioId);
    const deleteOption = useDeleteOption(scenarioId);

    const handleDelete = () => {
        deleteOption.mutate(option.id, {
            onSuccess: () => {
                toast.success("Option deleted");
                setShowDeleteConfirm(false);
            },
            onError: (err) => toast.error(err.message),
        });
    };

    if (isEditing) {
        return (
            <OptionForm
                defaultValues={{
                    title: option.title,
                    description: option.description ?? "",
                }}
                isPending={updateOption.isPending}
                submitLabel="Save"
                onCancel={() => setIsEditing(false)}
                onSubmit={(values) =>
                    updateOption.mutate(
                        { id: option.id, input: values },
                        {
                            onSuccess: () => {
                                toast.success("Option updated");
                                setIsEditing(false);
                            },
                            onError: (err) => toast.error(err.message),
                        },
                    )
                }
            />
        );
    }

    return (
        <>
            <div className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h3 className="font-medium">{option.title}</h3>
                        {option.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {option.description}
                            </p>
                        )}
                        <span className="mt-2 inline-block rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            {option.status}
                        </span>
                    </div>
                    <div className="flex shrink-0 gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowDeleteConfirm(true)}
                            isLoading={deleteOption.isPending}>
                            Delete
                        </Button>
                    </div>
                </div>
                <AnalysisPanel optionId={option.id} />
            </div>
            <ConfirmDialog
                open={showDeleteConfirm}
                title={`Delete "${option.title}"?`}
                description="This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={deleteOption.isPending}
            />
        </>
    );
}
