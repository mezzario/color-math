/// <reference path="../typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require("lodash");
var chroma = require("chroma-js");
var utils_1 = require("./utils");
var ColorScale = (function () {
    function ColorScale(name, params, scaleParams) {
        this.name = name;
        this.params = params;
        this.scaleParams = scaleParams;
        this.name = name.toLowerCase();
        this.params = params || [];
        this.scaleParams = scaleParams || [];
    }
    ColorScale.prototype.toString = function () {
        return "<colorScale." + this.name + ">";
    };
    ColorScale.prototype.clone = function () {
        var obj = new ColorScale(this.name, this.params.slice(0), this.scaleParams.slice(0));
        return obj;
    };
    ColorScale.prototype.getParamValue = function (params, name) {
        for (var i = 0; i < params.length; i++)
            if (params[i].name === name)
                return params[i].value;
    };
    ColorScale.prototype.applyParams = function (fn, params) {
        for (var i = 0; i < params.length; i++)
            if (params[i].name !== "colors")
                fn = fn[params[i].name](params[i].value);
    };
    ColorScale.prototype.getFn = function () {
        var colors = this.getParamValue(this.scaleParams, "colors");
        var bezierColorsMax = 5;
        if (this.name === "bezier" && colors.length > bezierColorsMax)
            throw "bezier interpolate only supports up to " + bezierColorsMax + " colors, you provided: " + colors.length;
        var ctor = chroma[this.name];
        var fn = colors ? ctor(colors) : ctor();
        this.applyParams(fn, this.params);
        if (this.name !== "scale")
            fn = fn.scale();
        this.applyParams(fn, this.scaleParams);
        return fn;
    };
    return ColorScale;
})();
exports.ColorScale = ColorScale;
var Evaluator = (function () {
    function Evaluator($type) {
        this.$type = $type;
        this.$type = "evaluator." + this.$type;
    }
    Evaluator.prototype.getCore = function () {
        return this._core
            || (this._core = new CoreEvaluator());
    };
    Evaluator.prototype.evalParam = function (node) {
        var obj = node.obj.evaluate(this.getCore());
        var objType = utils_1.getType(obj);
        var defs = [];
        switch (objType) {
            case utils_1.ValueType.Color:
                defs = this.getColorParamDefs();
                break;
            case utils_1.ValueType.ColorScale:
                defs = this.getColorScaleParamDefs(obj.name);
                break;
        }
        var result = this.manageParam(node, defs);
        return result;
    };
    Evaluator.prototype.evalUnaryOperation = function (node) {
        switch (node.operator) {
            case "-": return this.evalUnaryMinus(node);
            case "~": return this.evalColorInverse(node);
            case "+": return this.evalCorrectLightness(node);
            default: throw "invalid operator: " + node.operator;
        }
    };
    Evaluator.prototype.evalBinaryOperation = function (node) {
        var left = node.left.evaluate(this.getCore());
        var right = node.right.evaluate(this.getCore());
        var isNumbers = _.all([left, right], function (v) { return utils_1.getType(v) === utils_1.ValueType.Number; });
        var isColors = _.all([left, right], function (v) { return utils_1.getType(v) === utils_1.ValueType.Color; });
        var isColorAndNumber = utils_1.getType(left) === utils_1.ValueType.Color && utils_1.getType(right) === utils_1.ValueType.Number;
        var isNumberAndColor = utils_1.getType(left) === utils_1.ValueType.Number && utils_1.getType(right) === utils_1.ValueType.Color;
        switch (node.operator) {
            case "+":
                if (isNumbers)
                    return this.evalNumbersAddition(node);
                else if (isColors)
                    return this.evalAddBlend(node);
                else if (isColorAndNumber || isNumberAndColor)
                    return this.evalColorAndNumberAddition(node);
                else
                    break;
            case "-":
                if (isNumbers)
                    return this.evalNumbersSubtraction(node);
                else if (isColors)
                    return this.evalSubtractBlend(node);
                else if (isColorAndNumber)
                    return this.evalColorAndNumberSubtraction(node);
                else
                    break;
            case "*":
                if (isNumbers)
                    return this.evalNumbersMultiplication(node);
                else if (isColors)
                    return this.evalMultiplyBlend(node);
                else if (isColorAndNumber || isNumberAndColor)
                    return this.evalColorAndNumberMultiplication(node);
                else
                    break;
            case "/":
                if (isNumbers)
                    return this.evalNumbersDivision(node);
                else if (isColors)
                    return this.evalDivideBlend(node);
                else if (isColorAndNumber)
                    return this.evalColorAndNumberDivision(node);
                else
                    break;
            case "^":
                if (isNumbers)
                    return this.evalNumberPower(node);
                else
                    break;
            case "%%":
                if (isColors)
                    return this.evalColorsContrast(node);
                else
                    break;
            case "|":
                if (isColors)
                    return this.evalColorsMix(node);
                else
                    break;
            case "->":
                if (utils_1.getType(left) === utils_1.ValueType.ColorScale && utils_1.getType(right) === utils_1.ValueType.Number)
                    return this.evalColorsFromScaleProduction(node);
                else
                    break;
            case "<<":
                if (isColorAndNumber)
                    return this.evalColorDesaturate(node);
                else if (isColors)
                    return this.evalColorBurnBlend(node);
                else
                    break;
            case ">>":
                if (isColorAndNumber)
                    return this.evalColorSaturate(node);
                else if (isColors)
                    return this.evalColorDodgeBlend(node);
                else
                    break;
            case "<<<":
                if (isColorAndNumber)
                    return this.evalColorDarken(node);
                else if (isColors)
                    return this.evalDarkenBlend(node);
                else
                    break;
            case ">>>":
                if (isColorAndNumber)
                    return this.evalColorLighten(node);
                else if (isColors)
                    return this.evalLightenBlend(node);
                else
                    break;
            case "!*":
                if (isColors)
                    return this.evalScreenBlend(node);
                else
                    break;
            case "**":
                if (isColors)
                    return this.evalOverlayBlend(node);
                else
                    break;
            case "<*":
                if (isColors)
                    return this.evalHardLightBlend(node);
                else
                    break;
            case "*>":
                if (isColors)
                    return this.evalSoftLightBlend(node);
                else
                    break;
            case "^*":
                if (isColors)
                    return this.evalDifferenceBlend(node);
                else
                    break;
            case "^^":
                if (isColors)
                    return this.evalExclusionBlend(node);
                else
                    break;
            case "!^":
                if (isColors)
                    return this.evalNegateBlend(node);
                else
                    break;
            default: utils_1.throwError("invalid operator '" + node.operator + "'");
        }
        utils_1.throwError((utils_1.ValueType[utils_1.getType(left)] + " and " + utils_1.ValueType[utils_1.getType(right)])
            + (" is invalid operand types or sequence for operator '" + node.operator + "'"), node.$loc);
    };
    Evaluator.prototype.getNumberArithmeticFunc = function (operator) {
        if (!_.contains(["+", "-", "*", "/"], operator))
            utils_1.throwError("invalid arithmetic operator provided: '" + operator + "'");
        return eval("(function(a, b) { return a " + operator + " b; })");
    };
    Evaluator.prototype.manageParam = function (node, defs) {
        var opName = (function () {
            if (node.value === void 0)
                return "get";
            else if (!node.operator)
                return "set";
            else
                return "relative set";
        })();
        for (var i = 0; i < defs.length; i++) {
            var def = defs[i];
            if (node.name.match(def.re)) {
                var method = def.manage;
                if (!method) {
                    method = node.value === void 0 ? def.get : def.set;
                    if (node.operator)
                        method = def.setRel;
                }
                if (method) {
                    var result = method.call(def, node);
                    if (result === void 0)
                        utils_1.throwError("operation '" + opName + "' for parameter '" + node.name + "' is not supported by '" + this.$type + "'", node.$loc);
                    return result;
                }
                else
                    utils_1.throwError("operation '" + opName + "' is not supported for parameter '" + node.name + "'", node.$loc);
                break;
            }
        }
        utils_1.throwError("unknown parameter name '" + node.name + "'", node.$loc);
    };
    Evaluator.prototype.getColorParamDefs = function () {
        var _this = this;
        return [
            {
                re: /^(number|num|n)$/i,
                manage: function (node) { return _this.evalManageColorNumber(node); }
            }, {
                re: /^(temperature|temp|t)$/i,
                manage: function (node) { return _this.evalManageColorTemperature(node); }
            }, {
                re: /^((rgb|cmyk|hsl|hsv|hsi|lab|lch|hcl)\.)?(luminance|lum)$/i,
                manage: function (node) {
                    if (node.value === void 0 && node.name.match(/\./))
                        utils_1.throwError("color space should not be specified when retrieving luminance", node.$loc);
                    return _this.evalManageColorLuminance(node);
                }
            }, {
                re: /^(alpha|a)$/i,
                manage: function (node) { return _this.evalManageColorAlpha(node); }
            }, {
                re: /^(rgb\.)?(red|r)$/i,
                manage: function (node) { return _this.evalManageColorCompRgbR(node); }
            }, {
                re: /^(rgb\.)?(green|g)$/i,
                manage: function (node) { return _this.evalManageColorCompRgbG(node); }
            }, {
                re: /^(rgb\.)?(blue|b)$/i,
                manage: function (node) { return _this.evalManageColorCompRgbB(node); }
            }, {
                re: /^(cmyk\.)?(cyan|c)$/i,
                manage: function (node) { return _this.evalManageColorCompCmykC(node); }
            }, {
                re: /^(cmyk\.)?(magenta|mag|m)$/i,
                manage: function (node) { return _this.evalManageColorCompCmykM(node); }
            }, {
                re: /^(cmyk\.)?(yellow|yel|y)$/i,
                manage: function (node) { return _this.evalManageColorCompCmykY(node); }
            }, {
                re: /^(cmyk\.)?(key|k)$/i,
                manage: function (node) { return _this.evalManageColorCompCmykK(node); }
            }, {
                re: /^((hsl|hsv|hsi|lch|hcl)\.)?(hue|h)$/i,
                manage: function (node) { return node.name.match(/hsv/i) ? _this.evalManageColorCompHsvH(node)
                    : (node.name.match(/hsi/i) ? _this.evalManageColorCompHsiH(node)
                        : (node.name.match(/lch|hcl/i) ? _this.evalManageColorCompLchH(node)
                            : _this.evalManageColorCompHslH(node))); }
            }, {
                re: /^((hsl|hsv|hsi)\.)?(saturation|sat|s)$/i,
                manage: function (node) { return node.name.match(/hsv/i) ? _this.evalManageColorCompHsvS(node)
                    : (node.name.match(/hsi/i) ? _this.evalManageColorCompHsiS(node)
                        : _this.evalManageColorCompHslS(node)); }
            }, {
                re: /^((hsl|lab|lch|hcl)\.)?(lightness|ltns|lt|l)$/i,
                manage: function (node) { return node.name.match(/lab/i) ? _this.evalManageColorCompLabL(node)
                    : (node.name.match(/lch|hcl/i) ? _this.evalManageColorCompLchL(node)
                        : _this.evalManageColorCompHslL(node)); }
            }, {
                re: /^(hsv\.)?(value|val|v)$/i,
                manage: function (node) { return _this.evalManageColorCompHsvV(node); }
            }, {
                re: /^(hsi\.)?(intensity|int|i)$/i,
                manage: function (node) { return _this.evalManageColorCompHsiI(node); }
            }, {
                re: /^((lch|hcl)\.)?(chroma|chr|ch)$/i,
                manage: function (node) { return _this.evalManageColorCompLchC(node); }
            }, {
                re: /^lab\.a$/i,
                manage: function (node) { return _this.evalManageColorCompLabA(node); }
            }, {
                re: /^lab\.b$/i,
                manage: function (node) { return _this.evalManageColorCompLabB(node); }
            }
        ];
    };
    Evaluator.prototype.getColorScaleParamDefs = function (scaleName) {
        var _this = this;
        var defs = [{
                re: /^padding|pad|p$/i,
                set: function (node) { return _this.evalSetColorScalePadding(node); }
            }];
        if (scaleName === "scale")
            defs.push.apply(defs, [{
                    re: /^domain|dom|d$/i,
                    set: function (node) { return _this.evalSetScaleDomain(node); }
                }]);
        if (scaleName === "cubehelix")
            defs.push.apply(defs, [{
                    re: /^start|s$/i,
                    set: function (node) { return _this.evalSetCubehelixStart(node); }
                }, {
                    re: /^rotations|rot|r$/i,
                    set: function (node) { return _this.evalSetCubehelixRotations(node); }
                }, {
                    re: /^hue|h$/i,
                    set: function (node) { return _this.evalSetCubehelixHue(node); }
                }, {
                    re: /^gamma|g$/i,
                    set: function (node) { return _this.evalSetCubehelixGamma(node); }
                }, {
                    re: /^lightness|lt|l$/i,
                    set: function (node) { return _this.evalSetCubehelixLightness(node); }
                }]);
        return defs;
    };
    return Evaluator;
})();
exports.Evaluator = Evaluator;
var VarOp;
(function (VarOp) {
    VarOp[VarOp["Store"] = 0] = "Store";
    VarOp[VarOp["Retrieve"] = 1] = "Retrieve";
    VarOp[VarOp["Delete"] = 2] = "Delete";
})(VarOp || (VarOp = {}));
var CoreEvaluator = (function (_super) {
    __extends(CoreEvaluator, _super);
    function CoreEvaluator() {
        _super.call(this, "core");
        this._varsDict = {};
    }
    CoreEvaluator.prototype.getCore = function () {
        return this;
    };
    CoreEvaluator.prototype.evalProgram = function (node) {
        var _this = this;
        var values = _.map(node.statements, function (st) { return st.evaluate(_this); });
        var value = values[values.length - 1];
        this.manageVar(VarOp.Store, "$", value);
        return value;
    };
    CoreEvaluator.prototype.evalStatement = function (node) {
        var value = node.expr.evaluate(this);
        return value;
    };
    CoreEvaluator.prototype.evalParentheses = function (node) {
        var value = node.expr.evaluate(this);
        value = utils_1.cloneValue(value);
        return value;
    };
    CoreEvaluator.prototype.evalNumberLiteral = function (node) {
        var octal = node.value.replace(/^0o/, "");
        var value = octal !== node.value ? parseInt(octal, 8) : Number(node.value);
        return value;
    };
    CoreEvaluator.prototype.evalPercent = function (node) {
        var value = utils_1.forceNumInRange(node.value.evaluate(this), -100, 100, node.value.$loc);
        var n = value / 100.0;
        return n;
    };
    CoreEvaluator.prototype.evalArrayLiteral = function (node) {
        var _this = this;
        var value = _.map(node.value, function (expr) { return expr.evaluate(_this); });
        return value;
    };
    CoreEvaluator.prototype.evalArrayElement = function (node) {
        var array = node.array.evaluate(this);
        var index = utils_1.forceNumInRange(node.index.evaluate(this), 0, array.length - 1, node.index.$loc);
        var value = array[index];
        return value;
    };
    CoreEvaluator.prototype.evalColorNameLiteral = function (node) {
        var value = chroma(node.value);
        return value;
    };
    CoreEvaluator.prototype.evalColorHexLiteral = function (node) {
        var value = chroma(node.value);
        return value;
    };
    CoreEvaluator.prototype.evalColorByNumber = function (node) {
        var n = utils_1.forceNumInRange(node.value.evaluate(this), 0, 0xffffffff, node.value.$loc);
        var value = chroma(n & 0xffffff);
        if (n > 0xffffff)
            value.alpha((n & 0xff) / 0xff);
        return value;
    };
    CoreEvaluator.prototype.evalColorByTemperature = function (node) {
        var temperature = utils_1.forceNumInRange(node.value.evaluate(this), 0, 200000, node.value.$loc);
        var value = chroma.temperature(temperature);
        return value;
    };
    CoreEvaluator.prototype.evalColorByWavelength = function (node) {
        var wl = utils_1.forceNumInRange(node.value.evaluate(this), 350, 780, node.value.$loc);
        var value = utils_1.colorFromWavelength(wl);
        return value;
    };
    CoreEvaluator.prototype.evalColorBySpaceParams = function (node) {
        var _this = this;
        var space = node.space;
        var paramExprs = node.params.slice(0);
        var params = _.map(node.params, function (expr) { return expr.evaluate(_this); });
        var alphaExpr = null;
        var alpha;
        if (space === "argb") {
            alpha = params.shift();
            alphaExpr = paramExprs.shift();
            space = "rgb";
        }
        else if (params.length > (space === "cmyk" ? 4 : 3)) {
            alpha = params.pop();
            alphaExpr = paramExprs.pop();
        }
        var ranges = utils_1.getColorSpaceParamsValidRanges(space);
        if (params.length !== ranges.length)
            utils_1.throwError("invalid number of params for color space " + node.space.toUpperCase(), node.$loc);
        for (var i = 0; i < params.length; i++)
            utils_1.forceNumInRange(params[i], ranges[i], paramExprs[i].$loc);
        if (space === "cmy") {
            params = utils_1.cmyToCmykArray(params);
            space = "cmyk";
        }
        var value = chroma(params, space);
        if (alpha != null)
            value.alpha(utils_1.forceNumInRange(alpha, 0, 1, alphaExpr.$loc));
        return value;
    };
    CoreEvaluator.prototype.evalRandomColor = function (node) {
        var value = chroma.random();
        return value;
    };
    CoreEvaluator.prototype.evalScale = function (node) {
        var scaleParams = [{ name: "colors", value: utils_1.forceType(node.colors.evaluate(this), utils_1.ValueType.ColorArray, node.colors.$loc) }];
        if (node.domain !== void 0)
            scaleParams.push({ name: "domain", value: utils_1.forceType(node.domain.evaluate(this), utils_1.ValueType.NumberArray, node.domain.$loc) });
        if (node.mode !== void 0)
            scaleParams.push({ name: "mode", value: node.mode });
        var value = new ColorScale("scale", void 0, scaleParams);
        return value;
    };
    CoreEvaluator.prototype.evalBezier = function (node) {
        var scaleParams = [{ name: "colors", value: utils_1.forceType(node.colors.evaluate(this), utils_1.ValueType.ColorArray, node.colors.$loc) }];
        var value = new ColorScale("bezier", void 0, scaleParams);
        return value;
    };
    CoreEvaluator.prototype.evalCubehelix = function (node) {
        var value = new ColorScale("cubehelix");
        return value;
    };
    CoreEvaluator.prototype.evalBrewerConst = function (node) {
        var dict = CoreEvaluator.getBrewerConstsDict();
        var colorStrs = dict[node.name.toLowerCase()];
        var colors = _.map(colorStrs, function (s) { return chroma(s); });
        return colors;
    };
    CoreEvaluator.prototype.evalUnaryMinus = function (node) {
        var value = utils_1.forceType(node.value.evaluate(this), utils_1.ValueType.Number, node.value.$loc);
        return value;
    };
    CoreEvaluator.prototype.evalColorInverse = function (node) {
        var value = utils_1.forceType(node.value.evaluate(this), utils_1.ValueType.Color, node.value.$loc);
        value = utils_1.inverseColor(value);
        return value;
    };
    CoreEvaluator.prototype.evalCorrectLightness = function (node) {
        var value = utils_1.forceType(node.value.evaluate(this), utils_1.ValueType.ColorScale, node.value.$loc);
        value = value.clone();
        value.scaleParams.push({ name: "correctLightness" });
        return value;
    };
    CoreEvaluator.prototype.evalNumbersAddition = function (node) { return this.numbersArithmeticOp(node); };
    CoreEvaluator.prototype.evalNumbersSubtraction = function (node) { return this.numbersArithmeticOp(node); };
    CoreEvaluator.prototype.evalNumbersMultiplication = function (node) { return this.numbersArithmeticOp(node); };
    CoreEvaluator.prototype.evalNumbersDivision = function (node) { return this.numbersArithmeticOp(node); };
    CoreEvaluator.prototype.evalColorAndNumberAddition = function (node) { return this.colorArithmeticOp(node); };
    CoreEvaluator.prototype.evalColorAndNumberSubtraction = function (node) { return this.colorArithmeticOp(node); };
    CoreEvaluator.prototype.evalColorAndNumberMultiplication = function (node) { return this.colorArithmeticOp(node); };
    CoreEvaluator.prototype.evalColorAndNumberDivision = function (node) { return this.colorArithmeticOp(node); };
    CoreEvaluator.prototype.evalNumberPower = function (node) {
        var left = node.left.evaluate(this);
        var right = node.right.evaluate(this);
        var value = Math.pow(left, right);
        return value;
    };
    CoreEvaluator.prototype.evalColorsContrast = function (node) {
        var left = node.left.evaluate(this);
        var right = node.right.evaluate(this);
        var value = chroma.contrast(left, right);
        return value;
    };
    CoreEvaluator.prototype.evalColorsMix = function (node) {
        var left = node.left.evaluate(this);
        var right = node.right.evaluate(this);
        var ratioExpr = (node.options || {}).ratio;
        var ratio = ratioExpr ? utils_1.forceType(ratioExpr.evaluate(this), utils_1.ValueType.Number, ratioExpr.$loc) : void 0;
        var mode = (node.options || {}).mode;
        var value = chroma.mix(left, right, ratio, mode);
        return value;
    };
    CoreEvaluator.prototype.evalColorsFromScaleProduction = function (node) {
        var left = node.left.evaluate(this);
        var right = node.right.evaluate(this);
        var value = _.map(left.getFn().colors(right), function (s) { return chroma(s); });
        return value;
    };
    CoreEvaluator.prototype.evalColorDesaturate = function (node) { return this.adjustColorCompOp(node, "lch.c", false); };
    CoreEvaluator.prototype.evalColorSaturate = function (node) { return this.adjustColorCompOp(node, "lch.c", true); };
    CoreEvaluator.prototype.evalColorDarken = function (node) { return this.adjustColorCompOp(node, "lab.l", false); };
    CoreEvaluator.prototype.evalColorLighten = function (node) { return this.adjustColorCompOp(node, "lab.l", true); };
    CoreEvaluator.prototype.evalAddBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.Add); };
    CoreEvaluator.prototype.evalSubtractBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.Subtract); };
    CoreEvaluator.prototype.evalMultiplyBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.Multiply); };
    CoreEvaluator.prototype.evalDivideBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.Divide); };
    CoreEvaluator.prototype.evalColorBurnBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.ColorBurn); };
    CoreEvaluator.prototype.evalColorDodgeBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.ColorDodge); };
    CoreEvaluator.prototype.evalDarkenBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.Darken); };
    CoreEvaluator.prototype.evalLightenBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.Lighten); };
    CoreEvaluator.prototype.evalScreenBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.Screen); };
    CoreEvaluator.prototype.evalOverlayBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.Overlay); };
    CoreEvaluator.prototype.evalHardLightBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.HardLight); };
    CoreEvaluator.prototype.evalSoftLightBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.SoftLight); };
    CoreEvaluator.prototype.evalDifferenceBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.Difference); };
    CoreEvaluator.prototype.evalExclusionBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.Exclusion); };
    CoreEvaluator.prototype.evalNegateBlend = function (node) { return this.blendColorsOp(node, utils_1.BlendMode.Negate); };
    CoreEvaluator.prototype.evalManageColorNumber = function (node) {
        var curValue = Number("0x" + (node.obj.evaluate(this)).hex().replace(/^#/, ""));
        if (node.value === void 0)
            return curValue;
        else {
            var value = utils_1.forceNumInRange(node.value.evaluate(this), 0, 0xffffff, node.value.$loc);
            if (node.operator)
                value = Math.max(Math.min(this.getNumberArithmeticFunc(node.operator)(curValue, value), 0xffffff), 0);
            var obj = chroma(value);
            return obj;
        }
    };
    CoreEvaluator.prototype.evalManageColorTemperature = function (node) {
        var curValue = node.obj.evaluate(this).temperature();
        if (node.value === void 0)
            return curValue;
        else {
            var value = utils_1.forceType(node.value.evaluate(this), utils_1.ValueType.Number, node.value.$loc);
            if (node.operator)
                value = this.getNumberArithmeticFunc(node.operator)(curValue, value);
            var obj = chroma.temperature(value);
            return obj;
        }
    };
    CoreEvaluator.prototype.evalManageColorLuminance = function (node) {
        var obj = utils_1.cloneValue(node.obj.evaluate(this));
        var curValue = obj.luminance();
        if (node.value === void 0)
            return curValue;
        else {
            var value = utils_1.forceNumInRange(node.value.evaluate(this), 0, 1, node.value.$loc);
            if (node.operator)
                value = this.getNumberArithmeticFunc(node.operator)(curValue, value);
            var space = node.name.match(/^((\w+)\.)?\w+/i)[2] || void 0;
            obj.luminance(value, space);
            return obj;
        }
    };
    CoreEvaluator.prototype.evalManageColorAlpha = function (node) {
        var obj = utils_1.cloneValue(node.obj.evaluate(this));
        var curValue = obj.alpha();
        if (node.value === void 0)
            return curValue;
        else {
            var value = _.contains(["*", "/"], node.operator)
                ? utils_1.forceType(node.value.evaluate(this), utils_1.ValueType.Number, node.value.$loc)
                : utils_1.forceNumInRange(node.value.evaluate(this), 0, 1, node.value.$loc);
            if (node.operator)
                value = this.getNumberArithmeticFunc(node.operator)(curValue, value);
            obj.alpha(value);
            return obj;
        }
    };
    CoreEvaluator.prototype.manageColorCompOp = function (node, comp) {
        var obj = utils_1.cloneValue(node.obj.evaluate(this));
        var curValue = obj.get(comp);
        if (node.value === void 0)
            return curValue;
        else {
            var parts = comp.split(".");
            var ranges = utils_1.getColorSpaceParamsValidRanges(parts[0]);
            var index = parts[0].indexOf(parts[1]);
            var range = ranges[index];
            var value = utils_1.forceNumInRange(node.value.evaluate(this), range, node.value.$loc);
            if (node.operator)
                value = this.getNumberArithmeticFunc(node.operator)(curValue, value);
            obj.set(comp, value);
            return obj;
        }
    };
    CoreEvaluator.prototype.evalManageColorCompRgbR = function (node) { return this.manageColorCompOp(node, "rgb.r"); };
    CoreEvaluator.prototype.evalManageColorCompRgbG = function (node) { return this.manageColorCompOp(node, "rgb.g"); };
    CoreEvaluator.prototype.evalManageColorCompRgbB = function (node) { return this.manageColorCompOp(node, "rgb.b"); };
    CoreEvaluator.prototype.evalManageColorCompCmykC = function (node) { return this.manageColorCompOp(node, "cmyk.c"); };
    CoreEvaluator.prototype.evalManageColorCompCmykM = function (node) { return this.manageColorCompOp(node, "cmyk.m"); };
    CoreEvaluator.prototype.evalManageColorCompCmykY = function (node) { return this.manageColorCompOp(node, "cmyk.y"); };
    CoreEvaluator.prototype.evalManageColorCompCmykK = function (node) { return this.manageColorCompOp(node, "cmyk.k"); };
    CoreEvaluator.prototype.evalManageColorCompHslH = function (node) { return this.manageColorCompOp(node, "hsl.h"); };
    CoreEvaluator.prototype.evalManageColorCompHslS = function (node) { return this.manageColorCompOp(node, "hsl.s"); };
    CoreEvaluator.prototype.evalManageColorCompHslL = function (node) { return this.manageColorCompOp(node, "hsl.l"); };
    CoreEvaluator.prototype.evalManageColorCompHsvH = function (node) { return this.manageColorCompOp(node, "hsv.h"); };
    CoreEvaluator.prototype.evalManageColorCompHsvS = function (node) { return this.manageColorCompOp(node, "hsv.s"); };
    CoreEvaluator.prototype.evalManageColorCompHsvV = function (node) { return this.manageColorCompOp(node, "hsv.v"); };
    CoreEvaluator.prototype.evalManageColorCompHsiH = function (node) { return this.manageColorCompOp(node, "hsi.h"); };
    CoreEvaluator.prototype.evalManageColorCompHsiS = function (node) { return this.manageColorCompOp(node, "hsi.s"); };
    CoreEvaluator.prototype.evalManageColorCompHsiI = function (node) { return this.manageColorCompOp(node, "hsi.i"); };
    CoreEvaluator.prototype.evalManageColorCompLabL = function (node) { return this.manageColorCompOp(node, "lab.l"); };
    CoreEvaluator.prototype.evalManageColorCompLabA = function (node) { return this.manageColorCompOp(node, "lab.a"); };
    CoreEvaluator.prototype.evalManageColorCompLabB = function (node) { return this.manageColorCompOp(node, "lab.b"); };
    CoreEvaluator.prototype.evalManageColorCompLchL = function (node) { return this.manageColorCompOp(node, "lch.l"); };
    CoreEvaluator.prototype.evalManageColorCompLchC = function (node) { return this.manageColorCompOp(node, "lch.c"); };
    CoreEvaluator.prototype.evalManageColorCompLchH = function (node) { return this.manageColorCompOp(node, "lch.h"); };
    CoreEvaluator.prototype.evalSetColorScalePadding = function (node) {
        var value = node.value.evaluate(this);
        value = _.isArray(value)
            ? utils_1.forceRange(value, node.value.$loc)
            : utils_1.forceType(value, utils_1.ValueType.Number, node.value.$loc);
        var obj = this.addColorScaleParam(node, true, "padding", value);
        return obj;
    };
    CoreEvaluator.prototype.evalSetScaleDomain = function (node) {
        var value = utils_1.forceType(node.value.evaluate(this), utils_1.ValueType.NumberArray, node.value.$loc);
        if (value.length < 2)
            utils_1.throwError("'domain' parameter should contain at least two elements");
        var obj = this.addColorScaleParam(node, true, "domain", value);
        return obj;
    };
    CoreEvaluator.prototype.evalSetCubehelixStart = function (node) {
        var value = utils_1.forceNumInRange(node.value.evaluate(this), 0, 360, node.value.$loc);
        var obj = this.addColorScaleParam(node, false, "start", value);
        return obj;
    };
    CoreEvaluator.prototype.evalSetCubehelixRotations = function (node) {
        var value = utils_1.forceType(node.value.evaluate(this), utils_1.ValueType.Number, node.value.$loc);
        var obj = this.addColorScaleParam(node, false, "rotations", value);
        return obj;
    };
    CoreEvaluator.prototype.evalSetCubehelixHue = function (node) {
        var value = node.value.evaluate(this);
        value = _.isArray(value)
            ? utils_1.forceRange(value, node.value.$loc)
            : utils_1.forceType(value, utils_1.ValueType.Number, node.value.$loc);
        var obj = this.addColorScaleParam(node, false, "hue", value);
        return obj;
    };
    CoreEvaluator.prototype.evalSetCubehelixGamma = function (node) {
        var value = utils_1.forceType(node.value.evaluate(this), utils_1.ValueType.Number, node.value.$loc);
        var obj = this.addColorScaleParam(node, false, "gamma", value);
        return obj;
    };
    CoreEvaluator.prototype.evalSetCubehelixLightness = function (node) {
        var value = utils_1.forceRange(node.value.evaluate(this), node.value.$loc);
        var obj = this.addColorScaleParam(node, false, "lightness", value);
        return obj;
    };
    CoreEvaluator.prototype.evalGetVar = function (node) {
        var value = this.manageVar(VarOp.Retrieve, node.name);
        return value;
    };
    CoreEvaluator.prototype.evalSetVar = function (node) {
        var value = node.value.evaluate(this);
        this.manageVar(VarOp.Store, node.name, value);
        return value;
    };
    CoreEvaluator.prototype.manageVar = function (op, name, value) {
        var name2 = name.replace(/^\$/, "").toLowerCase() || "$";
        var dict = this._varsDict;
        switch (op) {
            case VarOp.Store:
                dict[name2] = value;
                if (value === void 0)
                    utils_1.throwError("cannot assign undefined value to variable " + name);
                break;
            case VarOp.Retrieve:
                value = dict[name2];
                if (value === void 0)
                    utils_1.throwError("variable " + name + " is not defined");
                break;
            case VarOp.Delete:
                value = dict[name2];
                delete dict[name2];
                break;
        }
        return value;
    };
    CoreEvaluator.getBrewerConstsDict = function () {
        var dict = this._brewerConstsDict;
        if (!dict) {
            dict = {};
            for (var key in chroma.brewer)
                if (chroma.brewer.hasOwnProperty(key))
                    dict[key.toLowerCase()] = chroma.brewer[key];
            this._brewerConstsDict = dict;
        }
        return dict;
    };
    CoreEvaluator.prototype.numbersArithmeticOp = function (node) {
        var left = node.left.evaluate(this);
        var right = node.right.evaluate(this);
        var value = this.getNumberArithmeticFunc(node.operator)(left, right);
        return value;
    };
    CoreEvaluator.prototype.blendColorsOp = function (node, mode) {
        var left = node.left.evaluate(this);
        var right = node.right.evaluate(this);
        var value = utils_1.blendColors(left, right, mode);
        return value;
    };
    CoreEvaluator.prototype.colorArithmeticOp = function (node) {
        var left = node.left.evaluate(this);
        var right = node.right.evaluate(this);
        var value = utils_1.colorArithmeticOp(left, right, node.operator);
        return value;
    };
    CoreEvaluator.prototype.adjustColorCompOp = function (node, colorComp, add) {
        var left = node.left.evaluate(this);
        var right = utils_1.forceNumInRange(node.right.evaluate(this), 0, 1, node.right.$loc);
        var value = utils_1.cloneValue(left).set(colorComp, "*" + (!add ? (1 - right) : (1 + right)));
        return value;
    };
    CoreEvaluator.prototype.addColorScaleParam = function (node, scaleParams, name, value) {
        var obj = utils_1.cloneValue(node.obj.evaluate(this));
        var params = scaleParams ? obj.scaleParams : obj.params;
        for (var i = 0; i < params.length; i++)
            if (params[i].name === name) {
                params.splice(i, 1);
                break;
            }
        params.push({
            name: name,
            value: value
        });
        return obj;
    };
    return CoreEvaluator;
})(Evaluator);
exports.CoreEvaluator = CoreEvaluator;
//# sourceMappingURL=eval-scope.js.map