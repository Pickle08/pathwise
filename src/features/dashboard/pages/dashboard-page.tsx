import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/features/auth/hooks/use-auth";
import { CreateScenarioForm, ScenarioList } from "@/features/scenario";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardPage() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const signOut = useSignOut();
    const [showForm, setShowForm] = useState(false);

    const handleSignOut = () => {
        signOut.mutate(undefined, {
            onSuccess: () => navigate("/login", { replace: true }),
        });
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold sm:text-3xl">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Signed in as {user?.email}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleSignOut}
                    isLoading={signOut.isPending}>
                    Sign out
                </Button>
            </div>

            <div className="mt-8 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-medium">Your scenarios</h2>
                    {!showForm && (
                        <Button onClick={() => setShowForm(true)}>
                            New scenario
                        </Button>
                    )}
                </div>

                {showForm && (
                    <CreateScenarioForm onDone={() => setShowForm(false)} />
                )}

                <ScenarioList />
            </div>
        </div>
    );
}
