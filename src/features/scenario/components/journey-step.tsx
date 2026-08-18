import type { ReactNode } from "react";

export function JourneyStep({
    index,
    children,
}: {
    index: number;
    children: ReactNode;
}) {
    return (
        <div className="relative pl-8 sm:pl-10">
            <div className="absolute left-0 top-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-background font-mono text-xs font-semibold text-primary">
                {String(index).padStart(2, "0")}
            </div>
            {children}
        </div>
    );
}
