import {Badge} from "@repraze/kernelkit/components/badge";
import {Button} from "@repraze/kernelkit/components/button";
import {Link} from "@tanstack/react-router";
import {CATEGORIES} from "@termicolor/build";
import {ExternalLinkIcon} from "lucide-react";

import {Markdown} from "@/components/markdown";
import type {RegistryEntry} from "@/lib/registry";

type AvailableEntry = Extract<RegistryEntry, {status: "available"}>;

/** Breadcrumb, title, description and links shared by every port page. */
export function PortHeader({entry}: {entry: AvailableEntry}) {
    return (
        <div className="flex flex-col gap-3">
            <nav className="text-muted-foreground flex items-center gap-1 font-mono text-xs" aria-label="Breadcrumb">
                <Link to="/ports" className="hover:text-foreground">
                    ports
                </Link>
                <span>/</span>
                <Link to="/ports" search={{category: entry.category}} className="hover:text-foreground">
                    {entry.category}
                </Link>
                <span>/</span>
                <span className="text-foreground">{entry.id}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">{entry.name}</h1>
                <Badge variant="outline">{CATEGORIES[entry.category]}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">{entry.description}</p>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" render={<a href={entry.source} />}>
                    Source <ExternalLinkIcon />
                </Button>
                {entry.homepage && (
                    <Button variant="ghost" size="sm" render={<a href={entry.homepage} />}>
                        {new URL(entry.homepage).hostname} <ExternalLinkIcon />
                    </Button>
                )}
            </div>
        </div>
    );
}

/** The registry entry's install notes. */
export function PortInstall({entry}: {entry: AvailableEntry}) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Install</h2>
            <Markdown source={entry.install} />
        </section>
    );
}
