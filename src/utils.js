/// <reference path="../typings/tsd.d.ts" />
"use strict";
var _ = require("lodash");
var chroma = require("chroma-js");
var eval_scope_1 = require("./eval-scope");
(function (ValueType) {
    ValueType[ValueType["Number"] = 1] = "Number";
    ValueType[ValueType["Color"] = 2] = "Color";
    ValueType[ValueType["ColorScale"] = 4] = "ColorScale";
    ValueType[ValueType["Array"] = 8] = "Array";
    ValueType[ValueType["NumberArray"] = 24] = "NumberArray";
    ValueType[ValueType["ColorArray"] = 40] = "ColorArray";
})(exports.ValueType || (exports.ValueType = {}));
var ValueType = exports.ValueType;
(function (BlendMode) {
    BlendMode[BlendMode["None"] = 0] = "None";
    BlendMode[BlendMode["Replace"] = 1] = "Replace";
    BlendMode[BlendMode["Add"] = 2] = "Add";
    BlendMode[BlendMode["ColorBurn"] = 3] = "ColorBurn";
    BlendMode[BlendMode["ColorDodge"] = 4] = "ColorDodge";
    BlendMode[BlendMode["Darken"] = 5] = "Darken";
    BlendMode[BlendMode["Difference"] = 6] = "Difference";
    BlendMode[BlendMode["Divide"] = 7] = "Divide";
    BlendMode[BlendMode["Exclusion"] = 8] = "Exclusion";
    BlendMode[BlendMode["HardLight"] = 9] = "HardLight";
    BlendMode[BlendMode["Lighten"] = 10] = "Lighten";
    BlendMode[BlendMode["LinearBurn"] = 11] = "LinearBurn";
    BlendMode[BlendMode["LinearDodge"] = 12] = "LinearDodge";
    BlendMode[BlendMode["Multiply"] = 13] = "Multiply";
    BlendMode[BlendMode["Negate"] = 14] = "Negate";
    BlendMode[BlendMode["Overlay"] = 15] = "Overlay";
    BlendMode[BlendMode["Screen"] = 16] = "Screen";
    BlendMode[BlendMode["SoftLight"] = 17] = "SoftLight";
    BlendMode[BlendMode["Subtract"] = 18] = "Subtract";
})(exports.BlendMode || (exports.BlendMode = {}));
var BlendMode = exports.BlendMode;
var getColorBlender = (function () {
    var bs = {};
    bs[BlendMode.None] = function (a, b) { return a; };
    bs[BlendMode.Replace] = function (a, b) { return b; };
    bs[BlendMode.Add] = function (a, b) { return Math.min(a + b, 255); };
    bs[BlendMode.ColorBurn] = function (a, b) { return b <= 0 ? 0 : Math.max(255 - (255 - a) * 255 / b, 0); };
    bs[BlendMode.ColorDodge] = function (a, b) { return b >= 255 ? 255 : Math.min(a * 255 / (255 - b), 255); };
    bs[BlendMode.Darken] = function (a, b) { return Math.min(a, b); };
    bs[BlendMode.Difference] = function (a, b) { return Math.abs(a - b); };
    bs[BlendMode.Divide] = function (a, b) { return Math.min((a / 255) / (b / 255) * 255, 255); };
    bs[BlendMode.Exclusion] = function (a, b) { return 255 - (((255 - a) * (255 - b) / 255) + (a * b / 255)); };
    bs[BlendMode.HardLight] = function (a, b) { return b < 128 ? (2 * a * b) / 255 : 255 - ((2 * (255 - a) * (255 - b)) / 255); };
    bs[BlendMode.Lighten] = function (a, b) { return Math.max(a, b); };
    bs[BlendMode.LinearBurn] = function (a, b) { return Math.max(0, a + b - 255); };
    bs[BlendMode.LinearDodge] = function (a, b) { return Math.min(a + b, 255); };
    bs[BlendMode.Multiply] = function (a, b) { return a * b / 255; };
    bs[BlendMode.Negate] = function (a, b) { return 255 - Math.abs(255 - a - b); };
    bs[BlendMode.Overlay] = function (a, b) { return a < 128 ? (2 * a * b / 255) : (255 - (2 * (255 - a) * (255 - b) / 255)); };
    bs[BlendMode.Screen] = function (a, b) { return 255 - ((255 - a) * (255 - b)) / 255; };
    bs[BlendMode.SoftLight] = function (a, b) { return a < 128 ? (((b >> 1) + 64) * a * (2 / 255)) : (255 - (191 - (b >> 1)) * (255 - a) * (2 / 255)); };
    bs[BlendMode.Subtract] = function (a, b) { return Math.max(a - b, 0); };
    return function (mode) { return bs[mode]; };
})();
function blendColors(bg, fg, mode) {
    var blender = getColorBlender(mode);
    var bgComps = bg.rgba();
    var fgComps = fg.rgba();
    var resComps = [void 0, void 0, void 0, fgComps[3] + bgComps[3] * (1 - fgComps[3])];
    for (var i = 0; i < 3; i++) {
        var c1 = bgComps[i] / 255;
        var c2 = fgComps[i] / 255;
        var c = blender(bgComps[i], fgComps[i]) / 255;
        if (resComps[3])
            c = (fgComps[3] * c2 + bgComps[3] * (c1 - fgComps[3] * (c1 + c2 - c))) / resComps[3];
        resComps[i] = c * 255;
    }
    var color = chroma(resComps);
    return color;
}
exports.blendColors = blendColors;
function cmyToCmykArray(valuesOrC, m, y) {
    var k = 1;
    var c;
    if (!_.isArray(valuesOrC))
        c = valuesOrC;
    else
        c = valuesOrC[0], m = valuesOrC[1], y = valuesOrC[2];
    if (c < k)
        k = c;
    if (m < k)
        k = m;
    if (y < k)
        k = y;
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
exports.cmyToCmykArray = cmyToCmykArray;
function cmyToCmyk(c, m, y) {
    var values = cmyToCmykArray(c, m, y);
    var color = chroma(values, "cmyk");
    return color;
}
exports.cmyToCmyk = cmyToCmyk;
function inverseColor(color) {
    var color2 = cloneValue(color);
    color2.set("rgb.r", 255 - color.get("rgb.r"));
    color2.set("rgb.g", 255 - color.get("rgb.g"));
    color2.set("rgb.b", 255 - color.get("rgb.b"));
    return color2;
}
exports.inverseColor = inverseColor;
function colorArithmeticOp(value1, value2, op) {
    var color;
    var n;
    if (isColor(value1))
        _a = [value1, value2], color = _a[0], n = _a[1];
    else
        _b = [value1, value2], n = _b[0], color = _b[1];
    color = cloneValue(color);
    color.set("rgb.r", op + n);
    color.set("rgb.g", op + n);
    color.set("rgb.b", op + n);
    return color;
    var _a, _b;
}
exports.colorArithmeticOp = colorArithmeticOp;
function roundColorComps(color, space) {
    if (space === void 0) { space = "rgb"; }
    var ranges = getColorSpaceParamsValidRanges(space);
    var comps = color.get(space);
    for (var i = 0; i < ranges.length; i++)
        if (ranges[i][1] - ranges[i][0] > 2)
            comps[i] = Math.round(comps[i]);
    var res = chroma(comps, space);
    res.alpha(color.alpha());
    return res;
}
exports.roundColorComps = roundColorComps;
function getColorSpaceParamsValidRanges(space) {
    switch (space) {
        case "rgb": return [[0, 255], [0, 255], [0, 255]];
        case "cmy": return [[0, 1], [0, 1], [0, 1]];
        case "cmyk": return [[0, 1], [0, 1], [0, 1], [0, 1]];
        case "hsl": return [[0, 360], [0, 1], [0, 1]];
        case "hsv": return [[0, 360], [0, 1], [0, 1]];
        case "hsi": return [[0, 360], [0, 1], [0, 1]];
        case "lab": return [[0, 100], [-128, 127], [-128, 127]];
        case "lch": return [[0, 100], [0, 140], [0, 360]];
        case "hcl": return [[0, 360], [0, 140], [0, 100]];
        default:
            throw new SyntaxError("unknown namespace: " + space.toUpperCase() + ".");
    }
}
exports.getColorSpaceParamsValidRanges = getColorSpaceParamsValidRanges;
function isColor(value) {
    return value
        && _.isArray(value._rgb)
        && value._rgb.length === 4;
}
exports.isColor = isColor;
function formatColor(color, appendName) {
    if (appendName === void 0) { appendName = false; }
    color = roundColorComps(color);
    var hex = color.hex();
    var hex8 = color.hex("rgba");
    var alpha = color.alpha();
    var name = color.name();
    var s = alpha === 1 || isNaN(alpha) ? hex : hex8;
    if (appendName && name !== hex)
        s += " (" + name + ")";
    return s;
}
exports.formatColor = formatColor;
function colorFromWavelength(wl) {
    var r = 0;
    var g = 0;
    var b = 0;
    var a = 1;
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
    var color = chroma([r, g, b, a], "gl");
    return color;
}
exports.colorFromWavelength = colorFromWavelength;
function throwError(error, loc) {
    var locStr = loc ? " (" + loc + ")" : "";
    throw "Error" + locStr + ": " + error + ".";
}
exports.throwError = throwError;
function getType(value) {
    if (typeof value === "number")
        return ValueType.Number;
    else if (isColor(value))
        return ValueType.Color;
    else if (_.isArray(value)) {
        if (value.length) {
            if (_.every(value, function (v) { return getType(v) === ValueType.Number; }))
                return ValueType.NumberArray;
            else if (_.every(value, function (v) { return getType(v) === ValueType.Color; }))
                return ValueType.ColorArray;
        }
        return ValueType.Array;
    }
    else if (value instanceof eval_scope_1.ColorScale)
        return ValueType.ColorScale;
}
exports.getType = getType;
function forceType(value, type, loc) {
    var valueType = getType(value);
    var types = (_.isArray(type) ? type : [type]);
    if (!_.any(types, function (t) { return (t & valueType) === t; })) {
        var strs = _.map(types, function (t) {
            switch (t) {
                case ValueType.Number: return "a number";
                case ValueType.Color: return "a color";
                case ValueType.ColorScale: return "a color scale";
                case ValueType.Array: return "an array";
                case ValueType.NumberArray: return "a number array";
                case ValueType.ColorArray: return "a color array";
                default: throw "invalid value type";
            }
        });
        var msg = strs[0];
        if (strs.length > 1)
            msg = strs.slice(0, -1).join(", ") + " or " + strs.slice(-1);
        throwError("value is not " + msg, loc);
    }
    return value;
}
exports.forceType = forceType;
function forceRange(value, loc) {
    if (getType(value) !== ValueType.NumberArray || value.length !== 2)
        throwError("operand is not valid numeric range", loc);
    return value;
}
exports.forceRange = forceRange;
function cloneValue(value) {
    var type = getType(value);
    switch (type) {
        case ValueType.Color: return chroma(value.rgba());
        case ValueType.ColorScale: return value.clone();
        case ValueType.Array:
        case ValueType.NumberArray:
        case ValueType.ColorArray: return _.map(value, function (v) { return cloneValue(v); });
        default: return value;
    }
}
exports.cloneValue = cloneValue;
function forceNumInRange(value, minOrRange, maxOrLoc, loc) {
    var min = _.isArray(minOrRange) ? minOrRange[0] : minOrRange;
    var max = _.isArray(minOrRange) ? minOrRange[1] : maxOrLoc;
    loc = _.isArray(minOrRange) ? maxOrLoc : loc;
    var n = forceType(value, ValueType.Number, loc);
    if (n < min || n > max)
        throwError("number in a range [" + min + ".." + max + "] is expected, you provided: " + n, loc);
    return n;
}
exports.forceNumInRange = forceNumInRange;
//# sourceMappingURL=utils.js.map