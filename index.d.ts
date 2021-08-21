/*
    intellipath utility package for TypeScript.
    Copyright (C) 2021  Contributors as noted in the AUTHORS.md file.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

type Digits = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type IsNumberImpl<S extends string> =
    S extends ""
        ? true
        : S extends `${infer _Hd}${infer _Tl}`
            ? _Hd extends Digits
                ? IsNumberImpl<_Tl>
                : false
            : false
;

/**
 * IsNumber returns `true` if {@link S} contains only decimal digits, `false`
 * otherwise.
 *
 * **WARNING**: strings with a leading `0` could be interpreted as octal numbers
 * at runtime!
 */
type IsNumber<S extends string> = S extends "" ? false : IsNumberImpl<S>;

/**
 * Split a string {@link S} separated by dots `.` into a tuple.
 * The tuple {@link _Acc} contains the elements in order.
 */
type Split<S extends string, _Acc extends string[] = []> =
    S extends `${infer _Hd}.${infer _Tl}`
        ? Split<_Tl, [..._Acc, _Hd]>
        : [..._Acc, S]
;

/**
 * SafeDot expands to {@link S}, followed by a dot `.` if {@link S} isn’t empty.
 */
type SafeDot<S extends string> = S extends "" ? "" : `${S}.`;

/**
 * ExistingPath walks through {@link T} using the path specified in
 * {@link _Path}. It stops when in can’t continue, either because {@link _Path}
 * is empty or because the next element is not a valid key of {@link T}.
 *
 * In every case it returns the subtype it stopped at, with the verified path
 * leading to it.
 *
 * {@link _Valid} is used during the recursion to build the verified path.
 */
type ExistingPath<T, _Path extends string[], _Valid extends string = ""> =
    _Path extends [infer _Hd, ...infer _Tl]
        ? _Tl extends string[]
            ? T extends (infer U)[]
                ? IsNumber<_Hd & string> extends true
                    ? ExistingPath<U, _Tl, `${SafeDot<_Valid>}${_Hd & string}`>
                    : [T, _Valid]
                : _Hd extends keyof T
                    ? ExistingPath<T[_Hd], _Tl, `${SafeDot<_Valid>}${_Hd & string}`>
                    : [T, _Valid]
            : [T, _Valid]
        : [T, _Valid]
;

/**
 * SafeKeyof analyzes the type of {@link T} and expands to:
 * - `keyof T & string` if it is an object
 * - `"<index>"` if it is an array
 * - `""` else
 */
type SafeKeyof<T> =
    T extends any[]
        ? "<index>"
        : T extends Record<any, any>
            ? keyof T & string
            : ""
;

/**
 * GenerateValidPaths queries the current state of the path using the result of
 * {@link ExistingPath}. It then expands to the cross product of:
 * - the last known valid path (which might be `""`);
 * - a dot `.`;
 * - the keys as returned by {@link SafeKeyof}&lt;{@link T}&gt;.
 *
 * If {@link SafeKeyof}&lt;{@link T}&gt; returns `""`, then only the last
 * known valid path is returned.
 */
type GenerateValidPaths<T, _Path extends string[]> =
    ExistingPath<T, _Path> extends [infer _CurrentT, infer _ValidPath]
        ? SafeKeyof<_CurrentT> extends infer _Keys
            ? _Keys extends ""
                ? _ValidPath
                : | _ValidPath
                  | `${SafeDot<_ValidPath & string>}${_Keys & string}`
            : never
        : never
;

/**
 * AutocompleteHelper forces the TypeScript language service to reevaluate
 * {@link _GenerateValidPathsResult} each time {@link _Path} is updated.
 */
type AutocompleteHelper<_Path, _GenerateValidPathsResult> =
    _Path extends _GenerateValidPathsResult
        ? _Path | _GenerateValidPathsResult
        : _GenerateValidPathsResult
;

/**
 * IntelliPath is a utility type that provides gradual autotyping and
 * autocompletion for strings representing object paths. It takes a type
 * {@link T} and a path {@link _Path}, and returns a string union representing:
 * - the current valid path ({@link _Path} or the longest valid substring);
 * - the paths of all its children, if any.
 *
 * If an array index is encountered, IntelliPath will accept any decimal number
 * and it will return the string `"<index>"` as part of its completion.
 *
 * **Example**:
 *
 * Given a `type T = { a: { b: number; c: string[] }; d: string }`:
 * - `IntelliPath<T, "">` ⇒ `"" | "a" | "d"`;
 * - `IntelliPath<T, "a">` ⇒ `"a" | "a.b" | "a.c"`;
 * - `IntelliPath<T, "a.doesnotexist">` ⇒ `"a" | "a.b" | "a.c"`;
 * - `IntelliPath<T, "a.c">` ⇒ `"a.c" | "a.c.<index>"`;
 * - `IntelliPath<T, "a.c.10">` ⇒ `"a.c.10"`;
 *
 * **VSCode autocompletion Example**:
 * ```ts
 * import { IntelliPath } from "intellipath";
 *
 * type Test = {
 *     nested: {
 *         result?: unknown;
 *         error?: {
 *             description: string;
 *             code: number;
 *         };
 *     };
 *     array: { one: 1; two: 2; three: 3 }[];
 * };
 *
 * function get<P extends string>(path: IntelliPath<Test, P>) {}
 *
 * get("")
 * //   ^ Place your cursor here and ^Space
 * ```
 */
type IntelliPath<T, _Path extends string> =
    AutocompleteHelper<_Path, GenerateValidPaths<T, Split<_Path>>>
;

declare namespace DefaultExport {
    export {
        IsNumber,
        Split,
        SafeDot,
        ExistingPath,
        SafeKeyof,
        GenerateValidPaths,
        AutocompleteHelper,
    }
}

export {
    DefaultExport as default,
    IntelliPath,
};
