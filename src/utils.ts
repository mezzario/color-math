/// <reference path="../typings/tsd.d.ts" />

var _ = require("lodash") as _.LoDashStatic;
import * as chroma from "chroma-js";
import { ColorScale } from "./eval-scope";

export enum ValueType {
    Number      =  1 << 0,
    Color       =  1 << 1,
    ColorScale  =  1 << 2,
    Array       =  1 << 3,
    NumberArray = (1 << 4) | Array,
    ColorArray  = (1 << 5) | Array,
}

export enum BlendMode {
    None,
    Replace,

    Add,
    ColorBurn,
    ColorDodge,
    Darken,
    Difference,
    Divide,
    Exclusion,
    HardLight,
    Lighten,
    LinearBurn,
    LinearDodge,
    Multiply,
    Negate,
    Overlay,
    Screen,
    SoftLight,
    Subtract,
}

var getColorBlender = (() => {
    let bs: { [n: number]: (bg: number, fg: number) => number; } = {};

    bs[BlendMode.None]        = (a, b) => a;
    bs[BlendMode.Replace]     = (a, b) => b;

    bs[BlendMode.Add]         = (a, b) => Math.min(a + b, 255);
    bs[BlendMode.ColorBurn]   = (a, b) => b <= 0 ? 0 : Math.max(255 - (255 - a) * 255 / b, 0);
    bs[BlendMode.ColorDodge]  = (a, b) => b >= 255 ? 255 : Math.min(a * 255 / (255 - b), 255);
    bs[BlendMode.Darken]      = (a, b) => Math.min(a, b);
    bs[BlendMode.Difference]  = (a, b) => Math.abs(a - b);
    bs[BlendMode.Divide]      = (a, b) => Math.min((a / 255) / (b / 255) * 255, 255);
    bs[BlendMode.Exclusion]   = (a, b) => 255 - (((255 - a) * (255 - b) / 255) + (a * b / 255));
    bs[BlendMode.HardLight]   = (a, b) => b < 128 ? (2 * a * b) / 255 : 255 - ((2 * (255 - a) * (255 - b)) / 255);
    bs[BlendMode.Lighten]     = (a, b) => Math.max(a, b);
    bs[BlendMode.LinearBurn]  = (a, b) => Math.max(0, a + b - 255);
    bs[BlendMode.LinearDodge] = (a, b) => Math.min(a + b, 255);
    bs[BlendMode.Multiply]    = (a, b) => a * b / 255;
    bs[BlendMode.Negate]      = (a, b) => 255 - Math.abs(255 - a - b);
    bs[BlendMode.Overlay]     = (a, b) => a < 128 ? (2 * a * b / 255) : (255 - (2 * (255 - a) * (255 - b) / 255));
    bs[BlendMode.Screen]      = (a, b) => 255 - ((255 - a) * (255 - b)) / 255;
    bs[BlendMode.SoftLight]   = (a, b) => a < 128 ? (((b >> 1) + 64) * a * (2 / 255)) : (255 - (191 - (b >> 1)) * (255 - a) * (2 / 255));
    bs[BlendMode.Subtract]    = (a, b) => Math.max(a - b, 0);

    return (mode: BlendMode) => bs[mode];
})();

export function blendColors(bg: Chroma.Color, fg: Chroma.Color, mode: BlendMode) {
    let blender = getColorBlender(mode);
    let bgComps = bg.rgba();
    let fgComps = fg.rgba();
    let resComps = [void 0, void 0, void 0, fgComps[3] + bgComps[3] * (1 - fgComps[3])];

    for (let i = 0; i < 3; i++) {
        let c1 = bgComps[i] / 255;
        let c2 = fgComps[i] / 255;
        let c = blender(bgComps[i], fgComps[i]) / 255;

        if (resComps[3])
            c = (fgComps[3] * c2 + bgComps[3] * (c1 - fgComps[3] * (c1 + c2 - c))) / resComps[3];

        resComps[i] = c * 255;
    }

    let color = chroma(resComps);
    return color;
}

export function cmyToCmykArray(values: number[]);
export function cmyToCmykArray(c: number, m: number, y: number);
export function cmyToCmykArray(valuesOrC: any, m?: number, y?: number) {
    let k = 1;
    let c: number;

    if (!_.isArray(valuesOrC))
        c = valuesOrC;
    else
        [c, m, y] = valuesOrC;

    if (c < k) k = c;
    if (m < k) k = m;
    if (y < k) k = y;

    if (k === 1) {
        c = 0;
        m = 0;
        y = 0;
    }
    else {
        c = (c - k) / (1 - k);
        m = (m - k) / (1 - k);
        y = (y - k) / (1 - k);
    }

    return [c, m, y, k];
}

export function cmyToCmyk(c: number, m: number, y: number) {
    let values = cmyToCmykArray(c, m, y);
    let color = chroma(values, "cmyk");

    return color;
}

export function inverseColor(color: Chroma.Color) {
    let color2 = cloneValue(color);

    color2.set("rgb.r", 255 - <number>color.get("rgb.r"));
    color2.set("rgb.g", 255 - <number>color.get("rgb.g"));
    color2.set("rgb.b", 255 - <number>color.get("rgb.b"));

    return color2;
}

export function colorArithmeticOp(color: Chroma.Color, n:     number,       op: string): Chroma.Color;
export function colorArithmeticOp(n:     number,       color: Chroma.Color, op: string): Chroma.Color;
export function colorArithmeticOp(value1,              value2,              op: string) {
    let color: Chroma.Color;
    let n: number;

    if (isColor(value1))
        [color, n] = [value1, value2];
    else
        [n, color] = [value1, value2];

    color = cloneValue(color);

    color.set("rgb.r", op + n);
    color.set("rgb.g", op + n);
    color.set("rgb.b", op + n);

    return color;
}

export function roundColorComps(color: Chroma.Color, space = "rgb") {
    let ranges = getColorSpaceParamsValidRanges(space);
    let comps = <number[]>color.get(space);

    for (let i = 0; i < ranges.length; i++)
        if (ranges[i][1] - ranges[i][0] > 2)
            comps[i] = Math.round(comps[i]);

    let res = chroma(comps, space);
    res.alpha(color.alpha());

    return res;
}

export function getColorSpaceParamsValidRanges(space: string) {
    switch (space) {
        case "rgb":  return [[0, 255], [   0, 255], [   0, 255]        ];
        case "cmy":  return [[0,   1], [   0,   1], [   0,   1]        ];
        case "cmyk": return [[0,   1], [   0,   1], [   0,   1], [0, 1]];
        case "hsl":  return [[0, 360], [   0,   1], [   0,   1]        ];
        case "hsv":  return [[0, 360], [   0,   1], [   0,   1]        ];
        case "hsi":  return [[0, 360], [   0,   1], [   0,   1]        ];
        case "lab":  return [[0, 100], [-128, 127], [-128, 127]        ];
        case "lch":  return [[0, 100], [   0, 140], [   0, 360]        ];
        case "hcl":  return [[0, 360], [   0, 140], [   0, 100]        ];

        default:
            throw new SyntaxError(`unknown namespace: ${space.toUpperCase()}.`);
    }
}

export function isColor(value) {
    return value
        && _.isArray(value._rgb)
        && value._rgb.length === 4;
}

export function formatColor(color: Chroma.Color, appendName = false) {
    color = roundColorComps(color);

    let hex = color.hex();
    let hex8 = color.hex("rgba");
    let alpha = color.alpha();
    let name = color.name();
    let s = alpha === 1 || isNaN(alpha) ? hex : hex8;

    if (appendName && name !== hex)
        s += ` (${name})`;

    return s;
}

export function colorFromWavelength(wl: number) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1;

    if (wl >= 380 && wl < 440) {
        r = -1 * (wl - 440) / (440 - 380);
        g = 0;
        b = 1;
    }
    else if (wl >= 440 && wl < 490) {
        r = 0;
        g = (wl - 440) / (490 - 440);
        b = 1;
    }
    else if (wl >= 490 && wl < 510) {
        r = 0;
        g = 1;
        b = -1 * (wl - 510) / (510 - 490);
    }
    else if (wl >= 510 && wl < 580) {
        r = (wl - 510) / (580 - 510);
        g = 1;
        b = 0;
    }
    else if (wl >= 580 && wl < 645) {
        r = 1;
        g = -1 * (wl - 645) / (645 - 580);
        b = 0.0;
    }
    else if (wl >= 645 && wl <= 780) {
        r = 1;
        g = 0;
        b = 0;
    }

    if (wl > 780 || wl < 380)
        a = 0;
    else if (wl > 700)
        a = (780 - wl) / (780 - 700);
    else if (wl < 420)
        a = (wl - 380) / (420 - 380);

    let color = chroma([r, g, b, a], "gl");

    return color;
}

export function throwError(error: string, loc?) {
    let locStr = loc ? ` (${loc})` : "";

    throw `Error${locStr}: ${error}.`;
}

export function getType(value) {
    if (typeof value === "number")
        return ValueType.Number;
    else if (isColor(value))
        return ValueType.Color;
    else if (_.isArray(value)) {
        if (value.length) {
            if (_.every(value, v => getType(v) === ValueType.Number))
                return ValueType.NumberArray;
            else if (_.every(value, v => getType(v) === ValueType.Color))
                return ValueType.ColorArray;
        }

        return ValueType.Array;
    }
    else if (value instanceof ColorScale)
        return ValueType.ColorScale;
}

export function forceType(value, type: ValueType | ValueType[], loc?) {
    let valueType = getType(value);
    let types = <ValueType[]>(_.isArray(type) ? type : [type]);

    if (!_.any(types, t => (t & valueType) === t)) {
        let strs = _.map(types, t => {
            switch (t) {
                case ValueType.Number:      return "a number";
                case ValueType.Color:       return "a color";
                case ValueType.ColorScale:  return "a color scale";
                case ValueType.Array:       return "an array";
                case ValueType.NumberArray: return "a number array";
                case ValueType.ColorArray:  return "a color array";
                default:                    throw "invalid value type";
            }
        });

        let msg = strs[0];
        if (strs.length > 1)
            msg = strs.slice(0, -1).join(", ") + " or " + strs.slice(-1);

        throwError(`value is not ${msg}`, loc);
    }

    return value;
}

export function forceRange(value, loc?) {
    if (getType(value) !== ValueType.NumberArray || (<number[]>value).length !== 2)
        throwError("operand is not valid numeric range", loc);
}

export function cloneValue(value) {
    let type = getType(value);

    switch (type) {
        case ValueType.Color:       return chroma((<Chroma.Color>value).rgba());
        case ValueType.ColorScale:  return (<ColorScale>value).clone();

        case ValueType.Array:
        case ValueType.NumberArray:
        case ValueType.ColorArray:  return _.map(value, v => cloneValue(v));

        default:                    return value;
    }
}

export function forceNumInRange(value, range: number[], loc?): number;
export function forceNumInRange(value, min: number, max: number, loc?): number;
export function forceNumInRange(value, minOrRange, maxOrLoc?, loc?) {
    let min = _.isArray(minOrRange) ? minOrRange[0] : minOrRange;
    let max = _.isArray(minOrRange) ? minOrRange[1] : maxOrLoc;
    loc = _.isArray(minOrRange) ? maxOrLoc : loc;
    let n = forceType(value, ValueType.Number, loc);

    if (n < min || n > max)
        throwError(`number in a range [${min}..${max}] is expected, you provided: ${n}`, loc);

    return n;
}
