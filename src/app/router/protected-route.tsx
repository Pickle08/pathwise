import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/stores/auth-store";

export function ProtectedRoute() {
  const session = useAuthStore((s) => s.session);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Wait for the initial Supabase session check before deciding.
  // Without this, a logged-in user gets bounced to /login for a split
  // second on page refresh, before the session has loaded.
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
