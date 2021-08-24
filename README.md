<div align="center">

# IntelliPath

IntelliSense-like autocompletion features for string literals in TypeScript

<img src="https://user-images.githubusercontent.com/3847189/130576520-dc04008c-49e7-411d-8593-af0ceb16661f.gif" width="400" />

<p>

[![Latest Stable Version](https://img.shields.io/npm/v/intellipath.svg)](https://www.npmjs.com/package/intellipath)
[![TypeScript >= 4.1.0](https://img.shields.io/npm/dependency-version/intellipath/peer/typescript)](https://www.npmjs.com/package/intellipath)
[![Install size](https://badgen.net/packagephobia/install/intellipath)](https://www.npmjs.com/package/intellipath)
[![David](https://img.shields.io/david/aksamyt/intellipath)](https://www.npmjs.com/package/intellipath)
[![License](https://img.shields.io/npm/l/intellipath.svg)](https://www.gnu.org/licenses/)

</p>
</div>

***

## Features

- Check if a string can be used as a path for an instance of a type
- Provide an easy-to-use generic type for your libraries
- (Ab)use your IDE’s autocompletion to provide the best developer experience
- Gradual typing means less resource usage
- Does not compute every single path on every keystroke
- Use numeric indices to access array elements
- Compatible with weird types like `any`

## Installation

```sh
# NPM
npm i -D intellipath

# Yarn
yarn add --dev intellipath
```

## Usage

This module has one named export, `IntelliPath`.
All the internal types are documented and exported as the default export object if you wish to use them.

By itself, `IntelliPath` is not that useful:
```ts
import { IntelliPath } from "intellipath";

type T = {
    a: {
        b: number;
        c: string[];
    };
    d: string;
};

type a = IntelliPath<T, "">;       // a = "" | "a" | "d"
type b = IntelliPath<T, "a">;      // b = "a" | "a.b" | "a.c"
type c = IntelliPath<T, "a.c.hi">; // c = "a.c" | "a.c.<index>"
```

Its true utility shines when you create a “feedback loop” between its string type argument, a function type parameter, and a function parameter:
```ts
import { IntelliPath } from "intellipath";

type Test = {
    nested: {
        result?: unknown;
        error?: {
            description: string;
            code: number;
        };
    };
    array: { one: 1; two: 2; three: 3 }[];
};

function get<P extends string>(path: IntelliPath<Test, P>) {}

get("")
//   ^ Place your cursor here and ^Space
```
Paste this code in a .ts file in your project and try out the autocompletion!

### Caveats

- Autocompletion is a bit finnicky, it works best when the string you’re trying to autocomplete is terminated.
  ```ts
  get("
  //   ^ Trying to autocomplete this will do weird things
  ```
- TypeScript’s recursion limit for the path seems to be at around 10 children.

## How does it work?

For a type `T` and a path `P`, the algorithm is:
1. Split P as in `P.split(".")`, assign it to `P`
2. Let `Valid` be `""` and `CurrentT` be `T`
3. - If `P` is empty, return `[CurrentT, Valid]`
   - Else let `Hd` be the head of `P` as in `P.shift()`
     - If `Hd` is a valid key of `CurrentT`
       - Assign `T[Hd]` to `CurrentT`
       - Join `Hd` to the end of `Valid`, with a `"."` if `Valid` is not empty
       - Goto 3.
     - Else return `[CurrentT, Valid]`
4. Let `Keys` be the keys of the object `CurrentT`
5. Return the union of `Valid` and `Valid × Keys`

The returned union contains the original `P` if it is a valid path.

[`AutocompleteHelper`](https://github.com/Aksamyt/intellipath/blob/aad32f51ecd04a5d1fcc7d7c65d9fade09f3e972/index.d.ts#L127) is a no-op that forces the IntelliSense engine to reevaluate both of its operands. This is the black magic that provides dot notation-like autocompletion when you press <kbd>.</kbd> on your keyboard.

### Equivalent value version

Since metaprogramming in TypeScript is a pure functional language, it is easy to rewrite it for values instead of types. The following code block may be easier to understand than the original .d.ts file.

<details>
    <summary>IntelliPath rewritten in JS</summary>

```js
const Digits = "0123456789";
function IsNumberImpl(S) {
    if (S === "") {
        return true;
    }
    const m = S.match(/^(.)(.*)$/);
    if (m) {
        const [, _Hd, _Tl] = m;
        if (Digits.includes(_Hd)) {
            return IsNumberImpl(_Tl);
        }
        return false;
    }
    return false;
}
const IsNumber = S => S === "" ? false : IsNumberImpl(S);

function Split(S, _Acc = []) {
    const m = S.match(/^(.*?)\.(.*)$/);
    if (m) {
        const [, _Hd, _Tl] = m;
        return Split(_Tl, [..._Acc, _Hd]);
    }
    return [..._Acc, S];
}

const SafeDot = S => S === "" ? "" : `${S}.`;

function ExistingPath(T, _Path, _Valid = "") {
    const [_Hd, ..._Tl] = _Path;
    if (_Hd !== undefined) {
        if (Array.isArray(T)) {
            if (IsNumber(_Hd) === true) {
                return ExistingPath(T[0], _Tl, `${SafeDot(_Valid)}${_Hd}`);
            }
            return [T, _Valid];
        }
        if (Object.keys(T).includes(_Hd)) {
            return ExistingPath(T[_Hd], _Tl, `${SafeDot(_Valid)}${_Hd}`);
        }
       return [T, _Valid];
    }
    return [T, _Valid];
}

function SafeKeyof(T) {
    if (Array.isArray(T)) {
        return "<index>";
    }
    if (typeof T === "object") {
        return Object.keys(T);
    }
    return "";
}

function GenerateValidPaths(T, _Path) {
    const [_CurrentT, _ValidPath] = ExistingPath(T, _Path);
    const _Keys = SafeKeyof(_CurrentT);
    if (_Keys === "") {
        return [_ValidPath];
    }
    return [
        _ValidPath,
        ...[_Keys].flat().map(k => `${SafeDot(_ValidPath)}${k}`),
    ];
}

function IntelliPath(T, _Path) {
    return GenerateValidPaths(T, Split(_Path)).filter(v => v !== "");
}
```
</details>

You can copy-paste this code in any modern REPL (like your browser) to get the same behaviour as the type version:
```js
> const T = {
    a: {
        b: 12,
        c: ["a", "b"],
    },
    d: "string",
};
undefined
> IntelliPath(T, "")
[ "a", "d" ]
> IntelliPath(T, "a")
[ "a", "a.b", "a.c" ]
> IntelliPath(T, "a.c.hi")
[ "a.c", "a.c.<index>" ]
```

## Contributing

Don’t hesitate to open an issue or a PR if you’d want more features, or if you see that something’s missing (even if it’s a typo).

There is no format for issues or commit messages. Just try to stay within the 60 character limits for commit titles, and write them in an imperative sentence.

### Testing

Tests are in the `t/` folder. If Perl isn’t installed on your system, you can open the .ts files there and check if there are compilation errors in your IDE.
