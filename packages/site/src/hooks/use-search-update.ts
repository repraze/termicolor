import {useNavigate} from "@tanstack/react-router";
import {useCallback} from "react";

/**
 * Updates the current URL's search params in place: replace (no history entry per click) and no
 * scroll reset, so filters feel like state, not page loads. TanStack Router resets scroll on every
 * navigation by default, search-only ones included.
 */
export function useSearchUpdate<T extends object>() {
    const navigate = useNavigate();
    return useCallback(
        (search: T) =>
            navigate({
                to: ".",
                search: search as never,
                replace: true,
                resetScroll: false,
            }),
        [navigate],
    );
}
