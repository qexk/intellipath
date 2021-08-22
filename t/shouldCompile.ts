import { IntelliPath } from "..";

// this might be broken, but it works for unions at least
declare function same<T, U>(
    a: [U] extends [T] ? 0 : never,
    b: [T] extends [U] ? 0 : never,
): void;

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

type root = IntelliPath<T, "">;
same<root, "" | "nested" | "recursion">(0, 0);

type nested = IntelliPath<T, "nested">;
same<nested, "nested" | "nested.string" | "nested.number" | "nested.bigint" | "nested.boolean" | "nested.symbol" | "nested.null" | "nested.undefined" | "nested.function" | "nested.any" | "nested.unknown" | "nested.never" | "nested.union" | "nested.array">(0, 0);

type nestedString = IntelliPath<T, "nested.string">;
same<nestedString, "nested.string">(0, 0);

type nestedNumber = IntelliPath<T, "nested.number">;
same<nestedNumber, "nested.number">(0, 0);

type nestedBigint = IntelliPath<T, "nested.bigint">;
same<nestedBigint, "nested.bigint">(0, 0);

type nestedBoolean = IntelliPath<T, "nested.boolean">;
same<nestedBoolean, "nested.boolean">(0, 0);

type nestedSymbol = IntelliPath<T, "nested.symbol">;
same<nestedSymbol, "nested.symbol">(0, 0);

type nestedNull = IntelliPath<T, "nested.null">;
same<nestedNull, "nested.null">(0, 0);

type nestedUndefined = IntelliPath<T, "nested.undefined">;
same<nestedUndefined, "nested.undefined">(0, 0);

type nestedFunction = IntelliPath<T, "nested.function">;
same<nestedFunction, "nested.function">(0, 0);

type nestedAny = IntelliPath<T, "nested.any">;
same<nestedAny, "nested.any" | "nested.any.<any>">(0, 0);

type nestedUnknown = IntelliPath<T, "nested.unknown">;
same<nestedUnknown, "nested.unknown">(0, 0);

type nestedNever = IntelliPath<T, "nested.never">;
same<nestedNever, never>(0, 0);

type nestedUnion = IntelliPath<T, "nested.union">;
same<nestedUnion, "nested.union" | "nested.union.oui">(0, 0);

type nestedArray = IntelliPath<T, "nested.array">;
same<nestedArray, "nested.array" | "nested.array.<index>">(0, 0);

type nestedArray0 = IntelliPath<T, "nested.array.0">;
same<nestedArray0, "nested.array.0" | "nested.array.0.one" | "nested.array.0.two" | "nested.array.0.three">(0, 0);

type nestedArray0Two = IntelliPath<T, "nested.array.0.two">;
same<nestedArray0Two, "nested.array.0.two">(0, 0);

type nestedArray0Three = IntelliPath<T, "nested.array.0.three">;
same<nestedArray0Three, "nested.array.0.three" | "nested.array.0.three.<index>">(0, 0);

type nestedArray0Three12 = IntelliPath<T, "nested.array.0.three.12">;
same<nestedArray0Three12, "nested.array.0.three.12" | "nested.array.0.three.12.another">(0, 0);

type s = IntelliPath<T, "recursion">;
same<s, "recursion" | "recursion.next" | "recursion.stop">(0, 0);

// This is the current max recursion allowed
type maxRecursion = IntelliPath<T, "recursion.next.next.next.next.next.next.next.next.stop">;
same<maxRecursion, "recursion.next.next.next.next.next.next.next.next.stop" | "recursion.next.next.next.next.next.next.next.next.stop.<any>">(0, 0);
