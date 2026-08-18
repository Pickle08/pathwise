import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    useCreateReflection,
    useReflections,
} from "@/features/scenario/hooks/use-reflections";
import { useCreateNewVersion } from "@/features/scenario/hooks/use-scenarios";
import {
    reflectionSchema,
    type ReflectionInput,
    type ScenarioVersionRow,
} from "@/features/scenario/types/schema";

export function ReflectionsSection({
    scenarioId,
    version,
}: {
    scenarioId: string;
    version: ScenarioVersionRow;
}) {
    const { data: reflections, isLoading } = useReflections(scenarioId);
    const createReflection = useCreateReflection(scenarioId, version.id);
    const createNewVersion = useCreateNewVersion(scenarioId);
    const [showVersionConfirm, setShowVersionConfirm] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ReflectionInput>({ resolver: zodResolver(reflectionSchema) });

    const onSubmitReflection = (values: ReflectionInput) => {
        createReflection.mutate(values, {
            onSuccess: () => {
                toast.success("Reflection saved");
                reset();
            },
            onError: (err) => toast.error(err.message),
        });
    };

    const handleNewVersion = () => {
        createNewVersion.mutate(version, {
            onSuccess: (newVersion) => {
                toast.success(`Started version ${newVersion.version_number}`);
                setShowVersionConfirm(false);
            },
            onError: (err) => toast.error(err.message),
        });
    };

    return (
        <div className="rounded-lg border border-border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                    Reflections
                </h2>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowVersionConfirm(true)}
                    isLoading={createNewVersion.isPending}>
                    Start new version
                </Button>
            </div>

            <form
                onSubmit={handleSubmit(onSubmitReflection)}
                className="mt-3 space-y-2">
                <textarea
                    rows={2}
                    placeholder="What happened? Any updates since your last check-in?"
                    className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    {...register("content")}
                />
                {errors.content && (
                    <p className="text-xs text-red-500">
                        {errors.content.message}
                    </p>
                )}
                <Button
                    type="submit"
                    size="sm"
                    isLoading={createReflection.isPending}>
                    Add reflection
                </Button>
            </form>

            <div className="mt-4 space-y-3">
                {isLoading && (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                )}
                {reflections && reflections.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No reflections yet.
                    </p>
                )}
                {reflections?.map((r) => (
                    <div
                        key={r.id}
                        className="border-t border-border pt-3 text-sm">
                        <p className="whitespace-pre-wrap">{r.content}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            <ConfirmDialog
                open={showVersionConfirm}
                title={`Start version ${version.version_number + 1}?`}
                description="This copies your current goal, situation, constraints, and priorities so you can update them. The current version stays as history."
                onConfirm={handleNewVersion}
                onCancel={() => setShowVersionConfirm(false)}
                isLoading={createNewVersion.isPending}
            />
        </div>
    );
}
