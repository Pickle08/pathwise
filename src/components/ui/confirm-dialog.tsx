import { Button } from "@/components/ui/button";

export function ConfirmDialog({
    open,
    title,
    description,
    onConfirm,
    onCancel,
    isLoading,
}: {
    open: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onCancel}
            />
            <div className="relative mx-4 w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-lg">
                <h3 className="text-sm font-medium">{title}</h3>
                {description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        variant="default"
                        onClick={onConfirm}
                        isLoading={isLoading}>
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
}
