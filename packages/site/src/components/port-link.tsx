import {Link} from "@tanstack/react-router";
import type {ReactNode} from "react";

/**
 * Link to a port page. Ports with a dedicated route (more specific than /ports/$portId) link to it directly, so the
 * router doesn't warn that the generated /ports/$portId path matched another route.
 */
export function PortLink({
    portId,
    className,
    onClick,
    children,
}: {
    portId: string;
    className?: string;
    onClick?: () => void;
    children: ReactNode;
}) {
    if (portId === "wallpapers") {
        return (
            <Link to="/ports/wallpapers" className={className} onClick={onClick}>
                {children}
            </Link>
        );
    }
    return (
        <Link to="/ports/$portId" params={{portId}} className={className} onClick={onClick}>
            {children}
        </Link>
    );
}
