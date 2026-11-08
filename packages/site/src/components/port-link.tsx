import {Link} from "@tanstack/react-router";
import type {ComponentProps} from "react";

type PortLinkProps = Omit<ComponentProps<"a">, "href"> & {portId: string};

/**
 * Link to a port page. Ports with a dedicated route (more specific than /ports/$portId) link to it directly, so the
 * router doesn't warn that the generated /ports/$portId path matched another route. Forwards every other prop
 * (classes, data attributes, ref), so it works as a kernelkit `render` target.
 */
export function PortLink({portId, ...props}: PortLinkProps) {
    if (portId === "wallpapers") {
        return <Link to="/ports/wallpapers" {...props} />;
    }
    return <Link to="/ports/$portId" params={{portId}} {...props} />;
}
