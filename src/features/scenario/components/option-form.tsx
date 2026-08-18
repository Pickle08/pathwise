import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    optionSchema,
    type OptionInput,
} from "@/features/scenario/types/schema";

export function OptionForm({
    defaultValues,
    isPending,
    onSubmit,
    onCancel,
    submitLabel,
}: {
    defaultValues?: Partial<OptionInput>;
    isPending: boolean;
    onSubmit: (values: OptionInput) => void;
    onCancel: () => void;
    submitLabel: string;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OptionInput>({
        resolver: zodResolver(optionSchema),
        defaultValues,
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 rounded-lg border border-border p-4">
            <div className="space-y-1.5">
                <Label htmlFor="option-title">Title</Label>
                <Input
                    id="option-title"
                    placeholder="Become Frontend Engineer"
                    {...register("title")}
                />
                {errors.title && (
                    <p className="text-xs text-red-500">
                        {errors.title.message}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="option-description">Description</Label>
                <textarea
                    id="option-description"
                    rows={2}
                    placeholder="Focus on React and portfolio"
                    className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    {...register("description")}
                />
            </div>

            <div className="flex gap-2">
                <Button type="submit" size="sm" isLoading={isPending}>
                    {submitLabel}
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
