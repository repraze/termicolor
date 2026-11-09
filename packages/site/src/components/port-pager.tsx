import {Pager, PagerLink} from "@repraze/kernelkit/components/pager";
import {useSuspenseQuery} from "@tanstack/react-query";

import {PortLink} from "@/components/port-link";
import {portNeighbors} from "@/components/ports-tree";
import {registryQuery} from "@/lib/registry";

/** Previous / next port in sidebar order, at the foot of a port page (as on the kernelkit docs). */
export function PortPager({portId}: {portId: string}) {
    const {data: registry} = useSuspenseQuery(registryQuery);
    const {prev, next} = portNeighbors(registry, portId);
    return (
        <Pager>
            {prev ? (
                <PagerLink direction="previous" render={<PortLink portId={prev.id} />}>
                    {prev.name}
                </PagerLink>
            ) : null}
            {next ? (
                <PagerLink direction="next" render={<PortLink portId={next.id} />}>
                    {next.name}
                </PagerLink>
            ) : null}
        </Pager>
    );
}
