/// <reference path="../typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require("lodash");
var ParserScope = require("./parser-scope");
var eval_scope_1 = require("./eval-scope");
var utils_1 = require("./utils");
var LessEvaluator = (function (_super) {
    __extends(LessEvaluator, _super);
    function LessEvaluator() {
        _super.call(this, "less");
    }
    LessEvaluator.prototype.evalProgram = function (node) {
        var _this = this;
        // do core evaluation to perform all necessary validations
        this.getCore().evalProgram(node);
        var value = node.statements.length > 1
            ? _.map(node.statements, function (st) { return (st.evaluate(_this) + ";"); }).join("\n")
            : node.statements[0].evaluate(this);
        return value;
    };
    LessEvaluator.prototype.evalStatement = function (node) {
        var value = node.expr.evaluate(this);
        return value;
    };
    LessEvaluator.prototype.evalParentheses = function (node) {
        var value = "(" + node.expr.evaluate(this) + ")";
        return value;
    };
    LessEvaluator.prototype.evalNumberLiteral = function (node) {
        var n = this.getCore().evalNumberLiteral(node);
        var value = n % 1 === 0 ? n : n.toFixed(8).replace(/0+$/, "");
        return value;
    };
    LessEvaluator.prototype.evalPercent = function (node) {
        var value = node.value.evaluate(this) + "%";
        return value;
    };
    LessEvaluator.prototype.evalArrayLiteral = function (node) {
        var _this = this;
        var value = _.map(node.value, function (expr) { return expr.evaluate(_this); }).join(" ");
        return value;
    };
    LessEvaluator.prototype.evalArrayElement = function (node) {
        var indexStr;
        if (node.index instanceof ParserScope.NumberLiteralExpr) {
            var index = this.getCore().evalNumberLiteral(node.index);
            indexStr = String(index + 1);
        }
        else
            indexStr = node.index.evaluate(this) + " + 1";
        var value = "extract(" + node.array.evaluate(this) + ", " + indexStr + ")";
        return value;
    };
    LessEvaluator.prototype.evalColorNameLiteral = function (node) {
        var value = node.value;
        return value;
    };
    LessEvaluator.prototype.evalColorHexLiteral = function (node) {
        var value = (!node.value.match(/^#/) ? "#" : "") + node.value;
        return value;
    };
    LessEvaluator.prototype.evalColorByNumber = function (node) {
        utils_1.throwError("defining color by number is not supported by LESS", node.$loc);
    };
    LessEvaluator.prototype.evalColorByTemperature = function (node) {
        utils_1.throwError("defining color by temperature is not supported by LESS", node.$loc);
    };
    LessEvaluator.prototype.evalColorByWavelength = function (node) {
        utils_1.throwError("defining color by wavelength is not supported by LESS", node.$loc);
    };
    LessEvaluator.prototype.evalColorBySpaceParams = function (node) {
        var _this = this;
        var params = _.map(node.params, function (expr) { return expr.evaluate(_this); });
        var alpha = params.length > (node.space === "cmyk" ? 4 : 3);
        var value = void 0;
        switch (node.space) {
            case "argb":
                value = node.space + "(" + params.join(", ") + ")";
                break;
            case "rgb":
            case "hsl":
            case "hsv":
                value = (node.space + (alpha ? "a" : "")) + "(" + params.join(", ") + ")";
                break;
            default: this.unspColorSpace(node.space, node.$loc);
        }
        return value;
    };
    LessEvaluator.prototype.evalRandomColor = function (node) {
        //return "~`(function(){for(var i=0,c='#',m=Math;i<6;i++)c+='0123456789ABCDEF'[m.floor(m.random()*16)];return c;})()`";
        return "~\"#`(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)`\"";
    };
    LessEvaluator.prototype.evalScale = function (node) { this.unspColorScale(node.$loc); };
    LessEvaluator.prototype.evalBezier = function (node) { this.unspColorScale(node.$loc); };
    LessEvaluator.prototype.evalCubehelix = function (node) { this.unspColorScale(node.$loc); };
    LessEvaluator.prototype.evalBrewerConst = function (node) {
        var coreValue = this.getCore().evalBrewerConst(node);
        var value = _.map(coreValue, function (c) { return c.hex(); }).join(" ");
        return value;
    };
    LessEvaluator.prototype.evalUnaryMinus = function (node) {
        var value = "-" + node.value.evaluate(this);
        return value;
    };
    LessEvaluator.prototype.evalColorInverse = function (node) {
        var value = "(#fff - " + node.value.evaluate(this) + ")";
        return value;
    };
    LessEvaluator.prototype.evalCorrectLightness = function (node) {
        this.unspColorScale(node.$loc);
    };
    LessEvaluator.prototype.evalNumbersAddition = function (node) { return this.arithmeticOp(node); };
    LessEvaluator.prototype.evalNumbersSubtraction = function (node) { return this.arithmeticOp(node); };
    LessEvaluator.prototype.evalNumbersMultiplication = function (node) { return this.arithmeticOp(node); };
    LessEvaluator.prototype.evalNumbersDivision = function (node) { return this.arithmeticOp(node); };
    LessEvaluator.prototype.evalColorAndNumberAddition = function (node) { return this.arithmeticOp(node); };
    LessEvaluator.prototype.evalColorAndNumberSubtraction = function (node) { return this.arithmeticOp(node); };
    LessEvaluator.prototype.evalColorAndNumberMultiplication = function (node) { return this.arithmeticOp(node); };
    LessEvaluator.prototype.evalColorAndNumberDivision = function (node) { return this.arithmeticOp(node); };
    LessEvaluator.prototype.evalNumberPower = function (node) {
        var left = node.left.evaluate(this);
        var right = node.right.evaluate(this);
        var value = "pow(" + left + ", " + right + ")";
        return value;
    };
    LessEvaluator.prototype.evalColorsContrast = function (node) {
        utils_1.throwError("calculating numeric contrast value is not supported by LESS", node.$loc);
    };
    LessEvaluator.prototype.evalColorsMix = function (node) {
        var params = [
            node.left.evaluate(this),
            node.right.evaluate(this)
        ];
        var ratioExpr = (node.options || {}).ratio;
        if (ratioExpr)
            params.push(this.toPercentage(ratioExpr));
        var mode = (node.options || {}).mode;
        if (mode && mode !== "rgb")
            utils_1.throwError("LESS supports mixing colors only in RGB color space", node.$loc);
        var func = "mix";
        var leftColorStr = node.left.evaluate(this.getCore()).hex("rgba").toLowerCase();
        if (leftColorStr === "#ffffffff") {
            params.shift();
            func = "tint";
        }
        else if (leftColorStr === "#000000ff") {
            params.shift();
            func = "shade";
        }
        var value = func + "(" + params.join(", ") + ")";
        return value;
    };
    LessEvaluator.prototype.evalColorsFromScaleProduction = function (node) {
        this.unspColorScale(node.$loc);
    };
    LessEvaluator.prototype.evalColorDesaturate = function (node) { return this.funcOp(node.left, node.right, "desaturate", true, true); };
    LessEvaluator.prototype.evalColorSaturate = function (node) { return this.funcOp(node.left, node.right, "saturate", true, true); };
    LessEvaluator.prototype.evalColorDarken = function (node) { return this.funcOp(node.left, node.right, "darken", true, true); };
    LessEvaluator.prototype.evalColorLighten = function (node) { return this.funcOp(node.left, node.right, "lighten", true, true); };
    LessEvaluator.prototype.evalAddBlend = function (node) { return this.arithmeticOp(node); };
    LessEvaluator.prototype.evalSubtractBlend = function (node) { return this.arithmeticOp(node); };
    LessEvaluator.prototype.evalMultiplyBlend = function (node) { return this.funcOp(node.left, node.right, "multiply"); };
    LessEvaluator.prototype.evalDivideBlend = function (node) { return this.arithmeticOp(node); };
    LessEvaluator.prototype.evalColorBurnBlend = function (node) { return this.unspColorBlend(utils_1.BlendMode.ColorBurn, node.$loc); };
    LessEvaluator.prototype.evalColorDodgeBlend = function (node) { return this.unspColorBlend(utils_1.BlendMode.ColorDodge, node.$loc); };
    LessEvaluator.prototype.evalDarkenBlend = function (node) { return this.unspColorBlend(utils_1.BlendMode.Darken, node.$loc); };
    LessEvaluator.prototype.evalLightenBlend = function (node) { return this.unspColorBlend(utils_1.BlendMode.Lighten, node.$loc); };
    LessEvaluator.prototype.evalScreenBlend = function (node) { return this.funcOp(node.left, node.right, "screen"); };
    LessEvaluator.prototype.evalOverlayBlend = function (node) { return this.funcOp(node.left, node.right, "overlay"); };
    LessEvaluator.prototype.evalHardLightBlend = function (node) { return this.funcOp(node.left, node.right, "hardlight"); };
    LessEvaluator.prototype.evalSoftLightBlend = function (node) { return this.funcOp(node.left, node.right, "softlight"); };
    LessEvaluator.prototype.evalDifferenceBlend = function (node) { return this.funcOp(node.left, node.right, "difference"); };
    LessEvaluator.prototype.evalExclusionBlend = function (node) { return this.funcOp(node.left, node.right, "exclusion"); };
    LessEvaluator.prototype.evalNegateBlend = function (node) { return this.funcOp(node.left, node.right, "negation"); };
    LessEvaluator.prototype.evalManageColorNumber = function (node) {
        utils_1.throwError("defining color by number is not supported by LESS", node.$loc);
    };
    LessEvaluator.prototype.evalManageColorTemperature = function (node) {
        utils_1.throwError("defining color by temperature is not supported by LESS", node.$loc);
    };
    LessEvaluator.prototype.evalManageColorLuminance = function (node) {
        var res = void 0;
        if (node.value === void 0)
            res = "luma(" + node.obj.evaluate(this) + ")";
        else
            utils_1.throwError("setting luminance is not supported by LESS", node.$loc);
        return res;
    };
    LessEvaluator.prototype.evalManageColorAlpha = function (node) {
        var res = void 0;
        if (node.value === void 0)
            res = "alpha(" + node.obj.evaluate(this) + ")";
        else {
            if (node.operator === "+")
                res = this.funcOp(node.obj, node.value, "fadein", true);
            else if (node.operator === "-")
                res = this.funcOp(node.obj, node.value, "fadeout", true);
            else if (!node.operator)
                res = this.funcOp(node.obj, node.value, "fade", true);
            else
                utils_1.throwError("assignment operator '" + node.operator + "'= for alpha channel is not supported by LESS", node.$loc);
        }
        return res;
    };
    LessEvaluator.prototype.evalManageColorCompRgbR = function (node) { return this.getColorCompOp(node, "rgb", "red"); };
    LessEvaluator.prototype.evalManageColorCompRgbG = function (node) { return this.getColorCompOp(node, "rgb", "green"); };
    LessEvaluator.prototype.evalManageColorCompRgbB = function (node) { return this.getColorCompOp(node, "rgb", "blue"); };
    LessEvaluator.prototype.evalManageColorCompCmykC = function (node) { this.unspColorSpace("cmyk", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompCmykM = function (node) { this.unspColorSpace("cmyk", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompCmykY = function (node) { this.unspColorSpace("cmyk", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompCmykK = function (node) { this.unspColorSpace("cmyk", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompHslH = function (node) { return this.getColorCompOp(node, "hsl", "hue"); };
    LessEvaluator.prototype.evalManageColorCompHslS = function (node) { return this.getColorCompOp(node, "hsl", "saturation"); };
    LessEvaluator.prototype.evalManageColorCompHslL = function (node) { return this.getColorCompOp(node, "hsl", "lightness"); };
    LessEvaluator.prototype.evalManageColorCompHsvH = function (node) { return this.getColorCompOp(node, "hsv", "hsvhue"); };
    LessEvaluator.prototype.evalManageColorCompHsvS = function (node) { return this.getColorCompOp(node, "hsv", "hsvsaturation"); };
    LessEvaluator.prototype.evalManageColorCompHsvV = function (node) { return this.getColorCompOp(node, "hsv", "hsvvalue"); };
    LessEvaluator.prototype.evalManageColorCompHsiH = function (node) { this.unspColorSpace("hsi", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompHsiS = function (node) { this.unspColorSpace("hsi", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompHsiI = function (node) { this.unspColorSpace("hsi", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompLabL = function (node) { this.unspColorSpace("lab", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompLabA = function (node) { this.unspColorSpace("lab", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompLabB = function (node) { this.unspColorSpace("lab", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompLchL = function (node) { this.unspColorSpace("lch", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompLchC = function (node) { this.unspColorSpace("lch", node.$loc); };
    LessEvaluator.prototype.evalManageColorCompLchH = function (node) { this.unspColorSpace("lch", node.$loc); };
    LessEvaluator.prototype.evalSetColorScalePadding = function (node) { this.unspColorScale(node.$loc); };
    LessEvaluator.prototype.evalSetScaleDomain = function (node) { this.unspColorScale(node.$loc); };
    LessEvaluator.prototype.evalSetCubehelixStart = function (node) { this.unspColorScale(node.$loc); };
    LessEvaluator.prototype.evalSetCubehelixRotations = function (node) { this.unspColorScale(node.$loc); };
    LessEvaluator.prototype.evalSetCubehelixHue = function (node) { this.unspColorScale(node.$loc); };
    LessEvaluator.prototype.evalSetCubehelixGamma = function (node) { this.unspColorScale(node.$loc); };
    LessEvaluator.prototype.evalSetCubehelixLightness = function (node) { this.unspColorScale(node.$loc); };
    LessEvaluator.prototype.evalGetVar = function (node) {
        var value = "@" + node.name.replace(/^\$/, "");
        return value;
    };
    LessEvaluator.prototype.evalSetVar = function (node) {
        var value = "@" + node.name.replace(/^\$/, "") + ": " + node.value.evaluate(this);
        return value;
    };
    LessEvaluator.prototype.arithmeticOp = function (node) {
        var left = node.left.evaluate(this);
        var right = node.right.evaluate(this);
        var value = left + " " + node.operator + " " + right;
        return value;
    };
    LessEvaluator.prototype.toPercentage = function (node) {
        var value = node.evaluate(this);
        var res;
        if (node instanceof ParserScope.PercentExpr)
            res = value;
        else if (node instanceof ParserScope.NumberLiteralExpr)
            res = this.getCore().evalNumberLiteral(node) * 100 + "%";
        else
            res = "percentage(" + value + ")";
        return res;
    };
    LessEvaluator.prototype.funcOp = function (nodeLeft, nodeRight, func, rightIsPercentage, relative) {
        if (rightIsPercentage === void 0) { rightIsPercentage = false; }
        if (relative === void 0) { relative = false; }
        var params = [
            nodeLeft.evaluate(this),
            rightIsPercentage ? this.toPercentage(nodeRight) : nodeRight.evaluate(this)
        ];
        if (relative)
            params.push("relative");
        var value = func + "(" + params.join(", ") + ")";
        return value;
    };
    LessEvaluator.prototype.getColorCompOp = function (node, space, func) {
        if (node.value === void 0) {
            var res = func + "(" + node.obj.evaluate(this) + ")";
            return res;
        }
        else
            utils_1.throwError("setting components in " + space.toUpperCase() + " color space is not supported by LESS", node.$loc);
    };
    LessEvaluator.prototype.unspColorScale = function (loc) {
        utils_1.throwError("color scales are not supported by LESS", loc);
    };
    LessEvaluator.prototype.unspColorSpace = function (space, loc) {
        utils_1.throwError("color space '" + space.toUpperCase() + "' is not supported by LESS", loc);
    };
    LessEvaluator.prototype.unspColorBlend = function (mode, loc) {
        utils_1.throwError("'" + utils_1.BlendMode[mode] + "' blending function is not supported by LESS", loc);
    };
    return LessEvaluator;
})(eval_scope_1.Evaluator);
exports.LessEvaluator = LessEvaluator;
//# sourceMappingURL=less-evaluator.js.map