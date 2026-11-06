import {readFileSync} from "node:fs";
import {join} from "node:path";

import {DEFAULT_ACCENT} from "@termicolor/palette";
import {describe, expect, it} from "vitest";

import {buildablePorts, buildPort, usesAccent} from "./port-build";

const PORTS = join(import.meta.dirname, "../../../../ports");

describe("in-browser port builds", () => {
    it("covers every port but wallpapers", () => {
        expect(buildablePorts).toContain("vscode");
        expect(buildablePorts).toContain("kitty");
        expect(buildablePorts).not.toContain("wallpapers");
    });

    it.each(buildablePorts)("%s with the default accent matches the committed dist", async (id) => {
        for (const file of await buildPort(id, DEFAULT_ACCENT)) {
            expect(file.contents).toBe(readFileSync(join(PORTS, id, "dist", file.path), "utf8"));
        }
    });

    it("an accent change reaches accent-driven ports", async () => {
        expect(await usesAccent("vscode")).toBe(true);
        const red = await buildPort("kitty", "red");
        const pink = await buildPort("kitty", "pink");
        expect(red.map((f) => f.path)).toEqual(pink.map((f) => f.path));
        expect(red[0]!.contents).not.toBe(pink[0]!.contents);
    });
});
