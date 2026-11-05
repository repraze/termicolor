import "./index.css";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {createRouter, RouterProvider} from "@tanstack/react-router";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";

import {TooltipProvider} from "@/components/ui/tooltip";

import {routeTree} from "./routeTree.gen";

const queryClient = new QueryClient();

const router = createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL,
    context: {queryClient},
    defaultPreload: "intent",
    scrollRestoration: true,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <RouterProvider router={router} />
            </TooltipProvider>
        </QueryClientProvider>
    </StrictMode>,
);
