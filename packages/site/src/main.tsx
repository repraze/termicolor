import "./index.css";

import {TooltipProvider} from "@repraze/kernelkit/components/tooltip";
import {ThemeProvider} from "@repraze/kernelkit/provider";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {createRouter, RouterProvider} from "@tanstack/react-router";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";

import {SITE_THEME, THEME_KEY} from "./lib/theme";
import {routeTree} from "./routeTree.gen";

const queryClient = new QueryClient();

const router = createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL,
    context: {queryClient},
    defaultPreload: "intent",
    scrollRestoration: true,
    // Key saved scroll by path, not path+search: filters live in the search params and changing one
    // must keep the scroll position (any extra render would otherwise reset it to the top).
    getScrollRestorationKey: (location) => location.pathname,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider storageKey={THEME_KEY} defaultTheme={SITE_THEME}>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <RouterProvider router={router} />
                </TooltipProvider>
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>,
);
