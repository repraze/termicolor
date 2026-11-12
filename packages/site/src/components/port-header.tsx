import {Badge} from "@repraze/kernelkit/components/badge";
import {Button} from "@repraze/kernelkit/components/button";
import {Callout} from "@repraze/kernelkit/components/callout";
import {
    PageHeader,
    PageHeaderActions,
    PageHeaderDescription,
    PageHeaderEyebrow,
    PageHeaderTitle,
} from "@repraze/kernelkit/components/page-header";
import {Link} from "@tanstack/react-router";
import {CATEGORIES, REPO_URL, testReportUrl} from "@termicolor/build";
import {BadgeCheckIcon, ExternalLinkIcon, FlaskConicalIcon} from "lucide-react";

import {Markdown} from "@/components/markdown";
import type {RegistryEntry} from "@/lib/registry";

type AvailableEntry = Extract<RegistryEntry, {status: "available"}>;

/** Breadcrumb, title, description and links shared by every port page (the suite's PageHeader). */
export function PortHeader({entry}: {entry: AvailableEntry}) {
    return (
        <PageHeader>
            <PageHeaderEyebrow>
                <nav
                    className="text-muted-foreground flex items-center gap-1 font-mono text-xs"
                    aria-label="Breadcrumb"
                >
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
            </PageHeaderEyebrow>
            <div className="flex flex-wrap items-center gap-3">
                <PageHeaderTitle>{entry.name}</PageHeaderTitle>
                <Badge variant="outline">{CATEGORIES[entry.category]}</Badge>
                <TestingBadge entry={entry} />
            </div>
            <PageHeaderDescription>{entry.description}</PageHeaderDescription>
            <PageHeaderActions>
                <Button variant="outline" size="sm" render={<a href={entry.source} />}>
                    Source <ExternalLinkIcon />
                </Button>
                {entry.homepage && (
                    <Button variant="ghost" size="sm" render={<a href={entry.homepage} />}>
                        {new URL(entry.homepage).hostname} <ExternalLinkIcon />
                    </Button>
                )}
            </PageHeaderActions>
        </PageHeader>
    );
}

/** The registry entry's install notes. */
export function PortInstall({entry}: {entry: AvailableEntry}) {
    return (
        <section id="install" className="flex scroll-mt-24 flex-col gap-3">
            <h2 className="font-heading text-xl font-semibold">Install</h2>
            <Markdown source={entry.install} />
        </section>
    );
}

/** Whether someone checked the port in the real app (TESTING.md). */
export function TestingBadge({entry}: {entry: AvailableEntry}) {
    return entry.verified ? (
        <Badge variant="outline" color="success" data-testid="testing-badge">
            <BadgeCheckIcon data-icon="inline-start" /> verified
        </Badge>
    ) : (
        <Badge variant="outline" color="warning" data-testid="testing-badge">
            <FlaskConicalIcon data-icon="inline-start" /> needs testing
        </Badge>
    );
}

const TESTING_GUIDE = `${REPO_URL}/blob/main/TESTING.md`;

/** Verified status, or a call to test the port and report back with a screenshot. */
export function PortTesting({entry}: {entry: AvailableEntry}) {
    const {verified} = entry;
    return (
        <section id="testing" className="scroll-mt-24">
            {verified ? (
                <Callout color="success" variant="outline" icon={<BadgeCheckIcon />} title="Verified">
                    <p>
                        Checked in {entry.name} on {verified.date}
                        {verified.issue ? (
                            <>
                                {" "}
                                (<a href={`${REPO_URL}/issues/${verified.issue}`}>test report</a>)
                            </>
                        ) : null}
                        . Something looks off in your version? <a href={testReportUrl(entry)}>Send a test report</a>.
                    </p>
                </Callout>
            ) : (
                <Callout color="warning" variant="outline" icon={<FlaskConicalIcon />} title="Needs testing">
                    <p>
                        This port is generated from the app's documented theme format, but nobody has checked it in{" "}
                        {entry.name} yet. If you use it, a screenshot helps a lot: install it, open the{" "}
                        <a href={`${REPO_URL}/tree/main/testing`}>sample files</a>, and{" "}
                        <a href={testReportUrl(entry)}>send a test report</a>.
                    </p>
                    <p>
                        Keep personal data out of screenshots, and follow the <a href={TESTING_GUIDE}>testing guide</a>{" "}
                        for content and size.
                    </p>
                </Callout>
            )}
        </section>
    );
}
