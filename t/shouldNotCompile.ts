import { IntelliPath } from "..";

type T = {
    nested: {
        string: string;
        number: number;
        bigint: bigint;
        boolean: boolean;
        symbol: symbol;
        null: null;
        undefined: undefined;
        function: () => void;
        any: any;
        unknown: unknown;
        never: never;
        union: string | { oui: "oui" };
        array: Array<{
            one: 1;
            two: 2;
            three: [{ another: "one" }];
        }>;
    };
    recursion: {
        next: T["recursion"];
        stop: any;
    };
};

declare function get<P extends string>(p: IntelliPath<T, P>): void;

get("test");
get(" ");
get("nested.hello");
get("nested.array.0x10");
get("nested.array.0.three.0x10");
get("nested.array.0.four");

// `length` is a valid property of string, but it’s not proposed in the
// autocompletion
// get("nested.string.length");
