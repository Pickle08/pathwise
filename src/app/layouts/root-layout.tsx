import { Outlet } from "react-router";
import { Toaster } from "sonner";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <Outlet />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
