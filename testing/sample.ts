// Termicolor sample: open this in editors to show the syntax colors.
import {readFile} from "node:fs/promises";

/** A greeting, with a doc comment. */
export interface Greeting {
    readonly name: string;
    times: number;
}

const PATTERN = /^hello,?\s+(\w+)!$/i;
const MAX_TIMES = 3;

export class Greeter<T extends Greeting> {
    #count = 0;

    constructor(private readonly greeting: T) {}

    greet(loud = false): string {
        const {name, times} = this.greeting;
        const text = `Hello, ${name}!\n`.repeat(Math.min(times, MAX_TIMES));
        this.#count += 1;
        return loud ? text.toUpperCase() : text;
    }
}

async function main(): Promise<void> {
    const greeter = new Greeter({name: "world", times: 2});
    console.log(greeter.greet(), PATTERN.test("hello world!"), [1, [2, [3, [4]]]]);
    // TODO: read a name from a file
    const config = await readFile("config.json", "utf8").catch(() => null);
    if (config === null) {
        throw new Error("no config");
    }
}

void main();
