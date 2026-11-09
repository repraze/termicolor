import {Toc, TocItem, TocList, TocTitle, useTocActive} from "@repraze/kernelkit/components/toc";

export interface TocSection {
    id: string;
    title: string;
}

/** "On this page" for a SiteAside, as on the kernelkit docs: one item per section, the visible one current. */
export function PageToc({sections}: {sections: TocSection[]}) {
    const active = useTocActive(sections.map((s) => s.id));
    if (sections.length < 2) {
        return null;
    }
    return (
        <Toc>
            <TocTitle>On this page</TocTitle>
            <TocList>
                {sections.map((s) => (
                    <TocItem key={s.id} href={`#${s.id}`} active={s.id === active}>
                        {s.title}
                    </TocItem>
                ))}
            </TocList>
        </Toc>
    );
}
