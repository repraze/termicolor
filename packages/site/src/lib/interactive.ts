/**
 * Clickable surfaces (DESIGN.md §6, "Clickable surfaces"): the container is a Tailwind group and,
 * on hover or keyboard focus, gets an accent border, an accent title and a moving/appearing
 * affordance icon. The cursor alone never signals "this is clickable".
 */
export const clickable = {
    /** the card / row container */
    surface:
        "group/click transition-colors hover:border-primary focus-within:border-primary has-[:focus-visible]:border-primary",
    /** its title or name */
    title: "transition-colors group-hover/click:text-primary group-focus-within/click:text-primary",
    /** an arrow that nudges toward where the click goes */
    arrow: "transition-transform group-hover/click:translate-x-1 group-focus-within/click:translate-x-1",
    /** an icon/label that appears on hover (preview, copy) */
    reveal: "opacity-0 transition-opacity group-hover/click:opacity-100 group-focus-within/click:opacity-100",
} as const;
