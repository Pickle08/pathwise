import { createBrowserRouter } from "react-router";
import { RootLayout } from "@/app/layouts/root-layout";
import { ProtectedRoute } from "@/app/router/protected-route";
import { LoginPage } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard";
import { ScenarioDetailPage } from "@/features/scenario";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { path: "login", element: <LoginPage /> },
            {
                element: <ProtectedRoute />,
                children: [
                    { index: true, element: <DashboardPage /> },
                    { path: "scenario/:id", element: <ScenarioDetailPage /> },
                ],
            },
        ],
    },
]);
