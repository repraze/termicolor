import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {oneOf, stored} from "./stored";

const isColor = oneOf(["red", "purple", "pink"]);

describe("stored preference", () => {
    let data: Map<string, string>;
    const target = new EventTarget();

    beforeEach(() => {
        data = new Map();
        vi.stubGlobal("localStorage", {
            getItem: (k: string) => data.get(k) ?? null,
            setItem: (k: string, v: string) => void data.set(k, v),
        });
        vi.stubGlobal("window", target);
    });
    afterEach(() => vi.unstubAllGlobals());

    it("reads the default without writing it", () => {
        const s = stored("k", "purple", isColor);
        expect(s.get()).toBe("purple");
        expect(data.has("k")).toBe(false);
    });

    it("persists a choice as JSON and notifies subscribers", () => {
        const s = stored("k", "purple", isColor);
        const onChange = vi.fn();
        s.subscribe(onChange);
        s.set("pink");
        expect(data.get("k")).toBe('"pink"');
        expect(s.get()).toBe("pink");
        expect(onChange).toHaveBeenCalledOnce();
    });

    it("returns a stable value between changes (useSyncExternalStore requirement)", () => {
        data.set("k", '"red"');
        const s = stored("k", "purple", isColor);
        expect(s.get()).toBe(s.get());
    });

    it("falls back to the default on invalid or corrupt values", () => {
        const s = stored("k", "purple", isColor);
        data.set("k", '"teal"');
        expect(s.get()).toBe("purple");
        data.set("k", "{oops");
        expect(s.get()).toBe("purple");
    });

    it("follows other tabs through the storage event", () => {
        const s = stored("k", "purple", isColor);
        const onChange = vi.fn();
        const off = s.subscribe(onChange);
        data.set("k", '"pink"');
        target.dispatchEvent(Object.assign(new Event("storage"), {key: "k"}));
        expect(onChange).toHaveBeenCalledOnce();
        expect(s.get()).toBe("pink");
        off();
        target.dispatchEvent(Object.assign(new Event("storage"), {key: "k"}));
        expect(onChange).toHaveBeenCalledOnce();
    });

    it("keeps the choice in memory when storage is blocked", () => {
        vi.stubGlobal("localStorage", {
            getItem: () => {
                throw new Error("blocked");
            },
            setItem: () => {
                throw new Error("blocked");
            },
        });
        const s = stored("k", "purple", isColor);
        s.set("red");
        expect(s.get()).toBe("red");
    });
});
