/// <reference path="../typings/tsd.d.ts" />

var _ = require("lodash") as _.LoDashStatic;
import * as chroma from "chroma-js";
import * as ParserScope from "./parser-scope";

import { ValueType, BlendMode,
    throwError, getType, forceType, forceNumInRange, forceRange, cloneValue,
    colorFromWavelength, getColorSpaceParamsValidRanges, cmyToCmykArray,
    inverseColor, blendColors, colorArithmeticOp } from "./utils";

export interface ColorScaleParam {
    name: string;
    value?;
}

export class ColorScale {
    constructor(
        public name: string,
        public params?: ColorScaleParam[],
        public scaleParams?: ColorScaleParam[]
    ) {
        this.name = name.toLowerCase();
        this.params = params || [];
        this.scaleParams = scaleParams || [];
    }

    toString() {
        return `<colorScale.${this.name}>`;
    }

    clone() {
        let obj = new ColorScale(this.name, this.params.slice(0), this.scaleParams.slice(0));
        return obj;
    }

    private getParamValue(params: ColorScaleParam[], name: string) {
        for (let i = 0; i < params.length; i++)
            if (params[i].name === name)
                return params[i].value;
    }

    private applyParams(fn, params: ColorScaleParam[]) {
        for (let i = 0; i < params.length; i++)
            if (params[i].name !== "colors")
                fn = fn[params[i].name](params[i].value);
    }

    getFn() {
        let colors = this.getParamValue(this.scaleParams, "colors");
        let ctor = chroma[this.name];
        let fn = colors ? ctor(colors) : ctor();

        this.applyParams(fn, this.params);

        if (this.name !== "scale")
            fn = fn.scale();

        this.applyParams(fn, this.scaleParams);

        return fn;
    }
}

export interface IParamDef {
    re?: RegExp;
    manage?(node: ParserScope.ParamExpr);
    get?(node: ParserScope.ParamExpr);
    set?(node: ParserScope.ParamExpr);
    setRel?(node: ParserScope.ParamExpr);
}

export abstract class Evaluator {
    constructor(public $type: string) {
        this.$type = `evaluator.${this.$type}`;
    }

    protected _core: CoreEvaluator;

    protected getCore() {
        return this._core
            || (this._core = new CoreEvaluator());
    }

    abstract evalProgram(node: ParserScope.Program);

    abstract evalStatement(node: ParserScope.Statement);

    abstract evalParentheses(node: ParserScope.ParenthesesExpr);

    abstract evalNumberLiteral(node: ParserScope.NumberLiteralExpr);

    abstract evalPercent(node: ParserScope.PercentExpr);

    abstract evalArrayLiteral(node: ParserScope.ArrayLiteralExpr);

    abstract evalArrayElement(node: ParserScope.ParamExpr);

    abstract evalColorNameLiteral(node: ParserScope.ColorNameLiteralExpr);
    abstract evalColorHexLiteral(node: ParserScope.ColorHexLiteralExpr);
    abstract evalColorByNumber(node: ParserScope.ColorByNumberExpr);
    abstract evalColorByTemperature(node: ParserScope.ColorByTemperatureExpr);
    abstract evalColorByWavelength(node: ParserScope.ColorByWavelengthExpr);
    abstract evalColorBySpaceParams(node: ParserScope.ColorBySpaceParams);
    abstract evalRandomColor(node: ParserScope.RandomColorExpr);

    abstract evalScale(node: ParserScope.ScaleExpr);
    abstract evalBezier(node: ParserScope.BezierExpr);
    abstract evalCubehelix(node: ParserScope.CubehelixExpr);

    abstract evalBrewerConst(node: ParserScope.BrewerConstExpr);

    evalParam(node: ParserScope.ParamExpr) {
        let obj = node.obj.evaluate(this.getCore());
        let objType = getType(obj);
        let defs: IParamDef[] = [];

        switch (objType) {
            case ValueType.Color:      defs = this.getColorParamDefs(); break;
            case ValueType.ColorScale: defs = this.getColorScaleParamDefs((obj as ColorScale).name); break;
        }

        if (!defs.length && (objType & ValueType.Array))
            defs.push({
                re: /^\d+$/i,
                get: node => this.evalArrayElement(node)
            });

        let result = this.manageParam(node, defs);
        return result;
    }

    abstract evalManageColorNumber(node: ParserScope.ParamExpr);
    abstract evalManageColorTemperature(node: ParserScope.ParamExpr);
    abstract evalManageColorLuminance(node: ParserScope.ParamExpr);
    abstract evalManageColorAlpha(node: ParserScope.ParamExpr);

    abstract evalManageColorCompRgbR(node: ParserScope.ParamExpr);
    abstract evalManageColorCompRgbG(node: ParserScope.ParamExpr);
    abstract evalManageColorCompRgbB(node: ParserScope.ParamExpr);

    abstract evalManageColorCompCmykC(node: ParserScope.ParamExpr);
    abstract evalManageColorCompCmykM(node: ParserScope.ParamExpr);
    abstract evalManageColorCompCmykY(node: ParserScope.ParamExpr);
    abstract evalManageColorCompCmykK(node: ParserScope.ParamExpr);

    abstract evalManageColorCompHslH(node: ParserScope.ParamExpr);
    abstract evalManageColorCompHslS(node: ParserScope.ParamExpr);
    abstract evalManageColorCompHslL(node: ParserScope.ParamExpr);

    abstract evalManageColorCompHsvH(node: ParserScope.ParamExpr);
    abstract evalManageColorCompHsvS(node: ParserScope.ParamExpr);
    abstract evalManageColorCompHsvV(node: ParserScope.ParamExpr);

    abstract evalManageColorCompHsiH(node: ParserScope.ParamExpr);
    abstract evalManageColorCompHsiS(node: ParserScope.ParamExpr);
    abstract evalManageColorCompHsiI(node: ParserScope.ParamExpr);

    abstract evalManageColorCompLabL(node: ParserScope.ParamExpr);
    abstract evalManageColorCompLabA(node: ParserScope.ParamExpr);
    abstract evalManageColorCompLabB(node: ParserScope.ParamExpr);

    abstract evalManageColorCompLchL(node: ParserScope.ParamExpr);
    abstract evalManageColorCompLchC(node: ParserScope.ParamExpr);
    abstract evalManageColorCompLchH(node: ParserScope.ParamExpr);

    abstract evalSetColorScalePadding(node: ParserScope.ParamExpr);
    abstract evalSetScaleDomain(node: ParserScope.ParamExpr);
    abstract evalSetCubehelixStart(node: ParserScope.ParamExpr);
    abstract evalSetCubehelixRotations(node: ParserScope.ParamExpr);
    abstract evalSetCubehelixHue(node: ParserScope.ParamExpr);
    abstract evalSetCubehelixGamma(node: ParserScope.ParamExpr);
    abstract evalSetCubehelixLightness(node: ParserScope.ParamExpr);

    evalUnaryOperation(node: ParserScope.UnaryExpr): any {
        switch (node.operator) {
            case "-": return this.evalUnaryMinus(node);
            case "~": return this.evalColorInverse(node);
            case "+": return this.evalCorrectLightness(node);
            default: throw `invalid operator: ${node.operator}`;
        }
    }

    abstract evalUnaryMinus(node: ParserScope.UnaryExpr);

    abstract evalColorInverse(node: ParserScope.UnaryExpr);

    abstract evalCorrectLightness(node: ParserScope.UnaryExpr);

    evalBinaryOperation(node: ParserScope.BinaryExpr): any {
        let left = node.left.evaluate(this.getCore());
        let right = node.right.evaluate(this.getCore());

        let isNumbers = _.all([left, right], v => getType(v) === ValueType.Number);
        let isColors = _.all([left, right], v => getType(v) === ValueType.Color);
        let isColorAndNumber = getType(left) === ValueType.Color && getType(right) === ValueType.Number;
        let isNumberAndColor = getType(left) === ValueType.Number && getType(right) === ValueType.Color;

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
                if (getType(left) === ValueType.ColorScale && getType(right) === ValueType.Number)
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


            default: throwError(`invalid operator '${node.operator}'`);
        }

        throwError(`${ValueType[getType(left)]} and ${ValueType[getType(right)]}`
            + ` is invalid operand types or sequence for operator '${node.operator}'`, node.$loc);
    }

    abstract evalNumbersAddition(node: ParserScope.BinaryExpr);
    abstract evalNumbersSubtraction(node: ParserScope.BinaryExpr);
    abstract evalNumbersMultiplication(node: ParserScope.BinaryExpr);
    abstract evalNumbersDivision(node: ParserScope.BinaryExpr);

    abstract evalColorAndNumberAddition(node: ParserScope.BinaryExpr);
    abstract evalColorAndNumberSubtraction(node: ParserScope.BinaryExpr);
    abstract evalColorAndNumberMultiplication(node: ParserScope.BinaryExpr);
    abstract evalColorAndNumberDivision(node: ParserScope.BinaryExpr);

    abstract evalNumberPower(node: ParserScope.BinaryExpr);

    abstract evalColorsContrast(node: ParserScope.BinaryExpr);

    abstract evalColorsMix(node: ParserScope.BinaryExpr);

    abstract evalColorsFromScaleProduction(node: ParserScope.BinaryExpr);

    abstract evalColorDesaturate(node: ParserScope.BinaryExpr);
    abstract evalColorSaturate(node: ParserScope.BinaryExpr);

    abstract evalColorDarken(node: ParserScope.BinaryExpr);
    abstract evalColorLighten(node: ParserScope.BinaryExpr);

    abstract evalAddBlend(node: ParserScope.BinaryExpr);
    abstract evalSubtractBlend(node: ParserScope.BinaryExpr);
    abstract evalMultiplyBlend(node: ParserScope.BinaryExpr);
    abstract evalDivideBlend(node: ParserScope.BinaryExpr);
    abstract evalColorBurnBlend(node: ParserScope.BinaryExpr);
    abstract evalColorDodgeBlend(node: ParserScope.BinaryExpr);
    abstract evalDarkenBlend(node: ParserScope.BinaryExpr);
    abstract evalLightenBlend(node: ParserScope.BinaryExpr);
    abstract evalScreenBlend(node: ParserScope.BinaryExpr);
    abstract evalOverlayBlend(node: ParserScope.BinaryExpr);
    abstract evalHardLightBlend(node: ParserScope.BinaryExpr);
    abstract evalSoftLightBlend(node: ParserScope.BinaryExpr);
    abstract evalDifferenceBlend(node: ParserScope.BinaryExpr);
    abstract evalExclusionBlend(node: ParserScope.BinaryExpr);
    abstract evalNegateBlend(node: ParserScope.BinaryExpr);

    abstract evalGetVar(node: ParserScope.GetVarExpr);
    abstract evalSetVar(node: ParserScope.SetVarExpr);

    protected getNumberArithmeticFunc(operator: string) {
        if (!_.contains(["+", "-", "*", "/"], operator))
            throwError(`invalid arithmetic operator provided: '${operator}'`);

        return <(a: number, b: number) => number>eval(`(function(a, b) { return a ${operator} b; })`);
    }

    protected manageParam(node: ParserScope.ParamExpr, defs: IParamDef[]) {
        let opName = (() => {
            if (node.value === void 0) return "get";
            else if (!node.operator)   return "set";
            else                       return "relative set";
        })();

        for (let i = 0; i < defs.length; i++) {
            let def = defs[i];

            if (node.name.match(def.re)) {
                let method = def.manage;

                if (!method) {
                    method = node.value === void 0 ? def.get : def.set;

                    if (node.operator)
                        method = def.setRel;
                }

                if (method) {
                    let result = method.call(def, node);
                    if (result === void 0)
                        throwError(`operation '${opName}' for parameter '${node.name}' is not supported by '${this.$type}'`, node.$loc);

                    return result;
                }
                else
                    throwError(`operation '${opName}' is not supported for parameter '${node.name}'`, node.$loc);

                break;
            }
        }

        throwError(`unknown parameter name '${node.name}'`, node.$loc);
    }

    protected getColorParamDefs() {
        return <IParamDef[]>[
            {
                re: /^(number|num|n)$/i,
                manage: node => this.evalManageColorNumber(node)
            }, {
                re: /^(temperature|temp|t)$/i,
                manage: node => this.evalManageColorTemperature(node)
            }, {
                re: /^((rgb|cmyk|hsl|hsv|hsi|lab|lch|hcl)\.)?(luminance|lum)$/i,
                manage: node => {
                    if (node.value === void 0 && node.name.match(/\./))
                        throwError("color space should not be specified when retrieving luminance", node.$loc);

                    return this.evalManageColorLuminance(node);
                }
            }, {
                re: /^(alpha|a)$/i,
                manage: node => this.evalManageColorAlpha(node)
            }, {
                re: /^(rgb\.)?(red|r)$/i,
                manage: node => this.evalManageColorCompRgbR(node)
            }, {
                re: /^(rgb\.)?(green|g)$/i,
                manage: node => this.evalManageColorCompRgbG(node)
            }, {
                re: /^(rgb\.)?(blue|b)$/i,
                manage: node => this.evalManageColorCompRgbB(node)
            }, {
                re: /^(cmyk\.)?(cyan|c)$/i,
                manage: node => this.evalManageColorCompCmykC(node)
            }, {
                re: /^(cmyk\.)?(magenta|mag|m)$/i,
                manage: node => this.evalManageColorCompCmykM(node)
            }, {
                re: /^(cmyk\.)?(yellow|yel|y)$/i,
                manage: node => this.evalManageColorCompCmykY(node)
            }, {
                re: /^(cmyk\.)?(key|k)$/i,
                manage: node => this.evalManageColorCompCmykK(node)
            }, {
                re: /^((hsl|hsv|hsi|lch|hcl)\.)?(hue|h)$/i,
                manage: node => node.name.match(/hsv/i) ? this.evalManageColorCompHsvH(node)
                             : (node.name.match(/hsi/i) ? this.evalManageColorCompHsiH(node)
                         : (node.name.match(/lch|hcl/i) ? this.evalManageColorCompLchH(node)
                                                        : this.evalManageColorCompHslH(node)))
            }, {
                re: /^((hsl|hsv|hsi)\.)?(saturation|sat|s)$/i,
                manage: node => node.name.match(/hsv/i) ? this.evalManageColorCompHsvS(node)
                             : (node.name.match(/hsi/i) ? this.evalManageColorCompHsiS(node)
                                                        : this.evalManageColorCompHslS(node))
            }, {
                re: /^((hsl|lab|lch|hcl)\.)?(lightness|ltns|lt|l)$/i,
                manage: node => node.name.match(/lab/i) ? this.evalManageColorCompLabL(node)
                         : (node.name.match(/lch|hcl/i) ? this.evalManageColorCompLchL(node)
                                                        : this.evalManageColorCompHslL(node))
            }, {
                re: /^(hsv\.)?(value|val|v)$/i,
                manage: node => this.evalManageColorCompHsvV(node)
            }, {
                re: /^(hsi\.)?(intensity|int|i)$/i,
                manage: node => this.evalManageColorCompHsiI(node)
            }, {
                re: /^lab\.a$/i,
                manage: node => this.evalManageColorCompLabA(node)
            }, {
                re: /^lab\.b$/i,
                manage: node => this.evalManageColorCompLabB(node)
            }, {
                re: /^((((lch|hcl)\.)?(chroma|chr|ch))|lch\.c|hcl\.c)$/i,
                manage: node => this.evalManageColorCompLchC(node)
            }
        ];
    }

    protected getColorScaleParamDefs(scaleName: string) {
        let defs = <IParamDef[]>[{
            re: /^(padding|pad|p)$/i,
            set: node => this.evalSetColorScalePadding(node)
        }];

        if (scaleName === "scale")
            defs.push.apply(defs, <IParamDef[]>[{
                re: /^(domain|dom|d)$/i,
                set: node => this.evalSetScaleDomain(node)
            }]);

        if (scaleName === "cubehelix")
            defs.push.apply(defs, <IParamDef[]>[{
                re: /^(start|s)$/i,
                set: node => this.evalSetCubehelixStart(node)
            }, {
                re: /^(rotations|rot|r)$/i,
                set: node => this.evalSetCubehelixRotations(node)
            }, {
                re: /^(hue|h)$/i,
                set: node => this.evalSetCubehelixHue(node)
            }, {
                re: /^(gamma|g)$/i,
                set: node => this.evalSetCubehelixGamma(node)
            }, {
                re: /^(lightness|lt|l)$/i,
                set: node => this.evalSetCubehelixLightness(node)
            }]);

        return defs;
    }

    protected unwrapParens(node: ParserScope.Expr) {
        while (node instanceof ParserScope.ParenthesesExpr)
            node = (node as ParserScope.ParenthesesExpr).expr;

        return node;
    }
}

enum VarOp {
    Store,
    Retrieve,
    Delete,
}

export class CoreEvaluator extends Evaluator {
    constructor() {
        super("core");
    }

    protected getCore() {
        return this;
    }

    evalProgram(node: ParserScope.Program) {
        let values = _.map(node.statements, st => st.evaluate(this));
        let value = values[values.length - 1];

        this.manageVar(VarOp.Store, "$", value);

        return value;
    }

    evalStatement(node: ParserScope.Statement) {
        let value = node.expr.evaluate(this);
        return value;
    }

    evalParentheses(node: ParserScope.ParenthesesExpr) {
        let value = node.expr.evaluate(this);
        value = cloneValue(value);
        return value;
    }

    evalNumberLiteral(node: ParserScope.NumberLiteralExpr) {
        let octal = node.value.replace(/^0o/, "");
        let value = octal !== node.value ? parseInt(octal, 8) : Number(node.value);
        return value;
    }

    evalPercent(node: ParserScope.PercentExpr) {
        let value = forceNumInRange(node.value.evaluate(this), -100, 100, node.value.$loc);
        let n = value / 100.0;
        return n;
    }

    evalArrayLiteral(node: ParserScope.ArrayLiteralExpr) {
        let value = _.map(node.value, expr => expr.evaluate(this));
        return value;
    }

    evalArrayElement(node: ParserScope.ParamExpr) {
        let array = forceType(node.obj.evaluate(this), ValueType.Array, node.obj.$loc);
        let index = forceNumInRange(+node.name, 0, array.length - 1, node.$loc);
        let value = array[index];
        return value;
    }

    evalColorNameLiteral(node: ParserScope.ColorNameLiteralExpr) {
        let value = chroma(node.value);
        return value;
    }

    evalColorHexLiteral(node: ParserScope.ColorHexLiteralExpr) {
        let value = chroma(node.value);
        return value;
    }

    evalColorByNumber(node: ParserScope.ColorByNumberExpr) {
        let n = forceNumInRange(node.value.evaluate(this), 0, 0xffffff, node.value.$loc);
        let value = chroma(n);
        return value;
    }

    evalColorByTemperature(node: ParserScope.ColorByTemperatureExpr) {
        let temperature = forceNumInRange(node.value.evaluate(this), 0, 200000, node.value.$loc);
        let value = chroma.temperature(temperature);
        return value;
    }

    evalColorByWavelength(node: ParserScope.ColorByWavelengthExpr) {
        let wl = forceNumInRange(node.value.evaluate(this), 350, 780, node.value.$loc);
        let value = colorFromWavelength(wl);
        return value;
    }

    evalColorBySpaceParams(node: ParserScope.ColorBySpaceParams) {
        let space = node.space;
        let paramExprs = node.params.slice(0);
        let params = _.map(node.params, expr => expr.evaluate(this));
        let alphaExpr: ParserScope.Expr = null;
        let alpha: number;

        if (space === "argb") {
            alpha = params.shift();
            alphaExpr = paramExprs.shift();
            space = "rgb";
        }
        else if (params.length > (space === "cmyk" ? 4 : 3)) {
            alpha = params.pop();
            alphaExpr = paramExprs.pop();
        }

        let ranges = getColorSpaceParamsValidRanges(space);

        if (params.length !== ranges.length)
            throwError(`invalid number of params for color space ${node.space.toUpperCase() }`, node.$loc);

        for (let i = 0; i < params.length; i++)
            forceNumInRange(params[i], ranges[i], paramExprs[i].$loc);

        if (space === "cmy") {
            params = cmyToCmykArray(params);
            space = "cmyk";
        }

        let value = chroma(params, space);
        if (alpha != null)
            value.alpha(forceNumInRange(alpha, 0, 1, alphaExpr.$loc));

        return value;
    }

    evalRandomColor(node: ParserScope.RandomColorExpr) {
        let value = chroma.random();
        return value;
    }

    evalScale(node: ParserScope.ScaleExpr) {
        let colors = _.isArray(node.colors)
            ? _.map(node.colors as ParserScope.Expr[], expr => forceType(expr.evaluate(this), ValueType.Color, expr.$loc))
            : forceType((node.colors as ParserScope.Expr).evaluate(this), ValueType.ColorArray, (node.colors as ParserScope.Expr).$loc);

        if (colors && colors.length < 2)
            throwError("two or more colors are required for interpolation");

        let scaleParams = [{ name: "colors", value: colors }];

        if (node.domain !== void 0) {
            let domain = _.map(
                node.domain as ParserScope.Expr[],
                expr => forceType(expr.evaluate(this), ValueType.Number, expr.$loc));

            scaleParams.push({ name: "domain", value: domain });
        }

        if (node.mode !== void 0)
            scaleParams.push({ name: "mode", value: node.mode });

        let value = new ColorScale("scale", void 0, scaleParams);

        return value;
    }

    evalBezier(node: ParserScope.BezierExpr) {
        let colors = forceType(node.colors.evaluate(this), ValueType.ColorArray, node.colors.$loc);
        let colorsMin = 2;
        let colorsMax = 5;
        if (colors.length < colorsMin || colors.length > colorsMax)
            throwError(`bezier interpolate supports from ${colorsMin} to ${colorsMax} colors, you provided: ${colors.length}`);

        let scaleParams = [{ name: "colors", value: colors }];
        let value = new ColorScale("bezier", void 0, scaleParams);
        return value;
    }

    evalCubehelix(node: ParserScope.CubehelixExpr) {
        let value = new ColorScale("cubehelix");
        return value;
    }

    evalBrewerConst(node: ParserScope.BrewerConstExpr) {
        let dict = CoreEvaluator.getBrewerConstsDict();
        let colorStrs = dict[node.name.toLowerCase()];
        let colors = _.map(colorStrs, s => chroma(s));

        return colors;
    }

    evalUnaryMinus(node: ParserScope.UnaryExpr) {
        let value = <number>forceType(node.value.evaluate(this), ValueType.Number, node.value.$loc);
        value = -value;
        return value;
    }

    evalColorInverse(node: ParserScope.UnaryExpr) {
        let value = <Chroma.Color>forceType(node.value.evaluate(this), ValueType.Color, node.value.$loc);
        value = inverseColor(value);
        return value;
    }

    evalCorrectLightness(node: ParserScope.UnaryExpr) {
        let value = <ColorScale>forceType(node.value.evaluate(this), ValueType.ColorScale, node.value.$loc);
        value = value.clone();
        value.scaleParams.push({ name: "correctLightness" });
        return value;
    }

    evalNumbersAddition(node: ParserScope.BinaryExpr)       { return this.numbersArithmeticOp(node); }
    evalNumbersSubtraction(node: ParserScope.BinaryExpr)    { return this.numbersArithmeticOp(node); }
    evalNumbersMultiplication(node: ParserScope.BinaryExpr) { return this.numbersArithmeticOp(node); }
    evalNumbersDivision(node: ParserScope.BinaryExpr)       { return this.numbersArithmeticOp(node); }

    evalColorAndNumberAddition(node: ParserScope.BinaryExpr)       { return this.colorArithmeticOp(node); }
    evalColorAndNumberSubtraction(node: ParserScope.BinaryExpr)    { return this.colorArithmeticOp(node); }
    evalColorAndNumberMultiplication(node: ParserScope.BinaryExpr) { return this.colorArithmeticOp(node); }
    evalColorAndNumberDivision(node: ParserScope.BinaryExpr)       { return this.colorArithmeticOp(node); }

    evalNumberPower(node: ParserScope.BinaryExpr) {
        let left = <number>node.left.evaluate(this);
        let right = <number>node.right.evaluate(this);
        let value = Math.pow(left, right);
        return value;
    }

    evalColorsContrast(node: ParserScope.BinaryExpr) {
        let left = <Chroma.Color>node.left.evaluate(this);
        let right = <Chroma.Color>node.right.evaluate(this);
        let value = chroma.contrast(left, right);
        return value;
    }

    evalColorsMix(node: ParserScope.BinaryExpr) {
        let left = <Chroma.Color>node.left.evaluate(this);
        let right = <Chroma.Color>node.right.evaluate(this);
        let ratioExpr = <ParserScope.Expr>(node.options || {}).ratio;
        let ratio = ratioExpr ? <number>forceType(ratioExpr.evaluate(this), ValueType.Number, ratioExpr.$loc) : void 0;
        let mode = <string>(node.options || {}).mode;
        let value = chroma.mix(left, right, ratio, mode);
        return value;
    }

    evalColorsFromScaleProduction(node: ParserScope.BinaryExpr) {
        let left = <ColorScale>node.left.evaluate(this);
        let right = forceNumInRange(node.right.evaluate(this), 2, 0xffff, node.right.$loc);
        let value = _.map(<string[]>left.getFn().colors(right), s => chroma(s));
        return value;
    }

    evalColorDesaturate(node: ParserScope.BinaryExpr) { return this.adjustColorCompOp(node, "lch.c", false); }
    evalColorSaturate(node: ParserScope.BinaryExpr)   { return this.adjustColorCompOp(node, "lch.c", true); }
    evalColorDarken(node: ParserScope.BinaryExpr)     { return this.adjustColorCompOp(node, "lab.l", false); }
    evalColorLighten(node: ParserScope.BinaryExpr)    { return this.adjustColorCompOp(node, "lab.l", true); }

    evalAddBlend(node: ParserScope.BinaryExpr)        { return this.blendColorsOp(node, BlendMode.Add); }
    evalSubtractBlend(node: ParserScope.BinaryExpr)   { return this.blendColorsOp(node, BlendMode.Subtract); }
    evalMultiplyBlend(node: ParserScope.BinaryExpr)   { return this.blendColorsOp(node, BlendMode.Multiply); }
    evalDivideBlend(node: ParserScope.BinaryExpr)     { return this.blendColorsOp(node, BlendMode.Divide); }
    evalColorBurnBlend(node: ParserScope.BinaryExpr)  { return this.blendColorsOp(node, BlendMode.ColorBurn); }
    evalColorDodgeBlend(node: ParserScope.BinaryExpr) { return this.blendColorsOp(node, BlendMode.ColorDodge); }
    evalDarkenBlend(node: ParserScope.BinaryExpr)     { return this.blendColorsOp(node, BlendMode.Darken); }
    evalLightenBlend(node: ParserScope.BinaryExpr)    { return this.blendColorsOp(node, BlendMode.Lighten); }
    evalScreenBlend(node: ParserScope.BinaryExpr)     { return this.blendColorsOp(node, BlendMode.Screen); }
    evalOverlayBlend(node: ParserScope.BinaryExpr)    { return this.blendColorsOp(node, BlendMode.Overlay); }
    evalHardLightBlend(node: ParserScope.BinaryExpr)  { return this.blendColorsOp(node, BlendMode.HardLight); }
    evalSoftLightBlend(node: ParserScope.BinaryExpr)  { return this.blendColorsOp(node, BlendMode.SoftLight); }
    evalDifferenceBlend(node: ParserScope.BinaryExpr) { return this.blendColorsOp(node, BlendMode.Difference); }
    evalExclusionBlend(node: ParserScope.BinaryExpr)  { return this.blendColorsOp(node, BlendMode.Exclusion); }
    evalNegateBlend(node: ParserScope.BinaryExpr)     { return this.blendColorsOp(node, BlendMode.Negate); }

    evalManageColorNumber(node: ParserScope.ParamExpr) {
        let curObj = <Chroma.Color>node.obj.evaluate(this);
        let curValue = Number(`0x${curObj.hex().replace(/^#/, "")}`);

        if (node.value === void 0) // get
            return <any>curValue;
        else { // set
            let value = forceNumInRange(node.value.evaluate(this), 0, 0xffffff, node.value.$loc);
            if (node.operator) // set rel
                value = Math.max(Math.min(this.getNumberArithmeticFunc(node.operator)(curValue, value), 0xffffff), 0);

            let obj = chroma(value);
            obj.alpha(curObj.alpha());

            return obj;
        }
    }

    evalManageColorTemperature(node: ParserScope.ParamExpr) {
        let curValue = (<Chroma.Color>node.obj.evaluate(this)).temperature();

        if (node.value === void 0)
            return <any>curValue;
        else {
            let value = forceType(node.value.evaluate(this), ValueType.Number, node.value.$loc);
            if (node.operator)
                value = this.getNumberArithmeticFunc(node.operator)(curValue, value);

            let obj = chroma.temperature(value);
            return obj;
        }
    }

    evalManageColorLuminance(node: ParserScope.ParamExpr) {
        let obj = <Chroma.Color>cloneValue(node.obj.evaluate(this));
        let curValue = obj.luminance();

        if (node.value === void 0)
            return <any>curValue;
        else {
            let value = forceNumInRange(node.value.evaluate(this), 0, 1, node.value.$loc);
            if (node.operator)
                value = this.getNumberArithmeticFunc(node.operator)(curValue, value);

            let space = node.name.match(/^((\w+)\.)?\w+/i)[2] || void 0;

            obj.luminance(value, space);
            return obj;
        }
    }

    evalManageColorAlpha(node: ParserScope.ParamExpr) {
        let obj = <Chroma.Color>cloneValue(node.obj.evaluate(this));
        let curValue = obj.alpha();

        if (node.value === void 0)
            return <any>curValue;
        else {
            let value = _.contains(["*", "/"], node.operator)
                ? forceType(node.value.evaluate(this), ValueType.Number, node.value.$loc)
                : forceNumInRange(node.value.evaluate(this), 0, 1, node.value.$loc);

            if (node.operator)
                value = this.getNumberArithmeticFunc(node.operator)(curValue, value);

            obj.alpha(value);
            return obj;
        }
    }

    manageColorCompOp(node: ParserScope.ParamExpr, comp: string): any {
        let obj = <Chroma.Color>cloneValue(node.obj.evaluate(this));
        let curValue = <number>obj.get(comp);

        if (node.value === void 0)
            return curValue;
        else {
            let parts = comp.split(".");
            let ranges = getColorSpaceParamsValidRanges(parts[0]);
            let index = parts[0].indexOf(parts[1]);
            let range = ranges[index];
            let value = forceNumInRange(node.value.evaluate(this), range, node.value.$loc);

            if (node.operator)
                value = this.getNumberArithmeticFunc(node.operator)(curValue, value);

            obj.set(comp, value);
            return obj;
        }
    }

    evalManageColorCompRgbR(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "rgb.r"); }
    evalManageColorCompRgbG(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "rgb.g"); }
    evalManageColorCompRgbB(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "rgb.b"); }

    evalManageColorCompCmykC(node: ParserScope.ParamExpr) { return this.manageColorCompOp(node, "cmyk.c"); }
    evalManageColorCompCmykM(node: ParserScope.ParamExpr) { return this.manageColorCompOp(node, "cmyk.m"); }
    evalManageColorCompCmykY(node: ParserScope.ParamExpr) { return this.manageColorCompOp(node, "cmyk.y"); }
    evalManageColorCompCmykK(node: ParserScope.ParamExpr) { return this.manageColorCompOp(node, "cmyk.k"); }

    evalManageColorCompHslH(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "hsl.h"); }
    evalManageColorCompHslS(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "hsl.s"); }
    evalManageColorCompHslL(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "hsl.l"); }

    evalManageColorCompHsvH(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "hsv.h"); }
    evalManageColorCompHsvS(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "hsv.s"); }
    evalManageColorCompHsvV(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "hsv.v"); }

    evalManageColorCompHsiH(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "hsi.h"); }
    evalManageColorCompHsiS(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "hsi.s"); }
    evalManageColorCompHsiI(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "hsi.i"); }

    evalManageColorCompLabL(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "lab.l"); }
    evalManageColorCompLabA(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "lab.a"); }
    evalManageColorCompLabB(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "lab.b"); }

    evalManageColorCompLchL(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "lch.l"); }
    evalManageColorCompLchC(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "lch.c"); }
    evalManageColorCompLchH(node: ParserScope.ParamExpr)  { return this.manageColorCompOp(node, "lch.h"); }

    evalSetColorScalePadding(node: ParserScope.ParamExpr) {
        let value = node.value.evaluate(this);

        value = _.isArray(value)
            ? forceRange(value, node.value.$loc)
            : forceType(value, ValueType.Number, node.value.$loc);

        let obj = this.addColorScaleParam(node, true, "padding", value);
        return obj;
    }

    evalSetScaleDomain(node: ParserScope.ParamExpr) {
        let value = <number[]>forceType(node.value.evaluate(this), ValueType.NumberArray, node.value.$loc);
        if (value.length < 2)
            throwError("'domain' parameter should contain at least two elements");

        let obj = this.addColorScaleParam(node, true, "domain", value);
        return obj;
    }

    evalSetCubehelixStart(node: ParserScope.ParamExpr) {
        let value = forceNumInRange(node.value.evaluate(this), 0, 360, node.value.$loc);
        let obj = this.addColorScaleParam(node, false, "start", value);
        return obj;
    }

    evalSetCubehelixRotations(node: ParserScope.ParamExpr) {
        let value = forceType(node.value.evaluate(this), ValueType.Number, node.value.$loc);
        let obj = this.addColorScaleParam(node, false, "rotations", value);
        return obj;
    }

    evalSetCubehelixHue(node: ParserScope.ParamExpr) {
        let value = node.value.evaluate(this);

        value = _.isArray(value)
            ? forceRange(value, node.value.$loc)
            : forceType(value, ValueType.Number, node.value.$loc);

        let obj = this.addColorScaleParam(node, false, "hue", value);
        return obj;
    }

    evalSetCubehelixGamma(node: ParserScope.ParamExpr) {
        let value = forceType(node.value.evaluate(this), ValueType.Number, node.value.$loc);
        let obj = this.addColorScaleParam(node, false, "gamma", value);
        return obj;
    }

    evalSetCubehelixLightness(node: ParserScope.ParamExpr) {
        let value = forceRange(node.value.evaluate(this), node.value.$loc);
        if (value[0] === value[1])
            throwError("empty 'lightness' range");

        let obj = this.addColorScaleParam(node, false, "lightness", value);
        return obj;
    }

    evalGetVar(node: ParserScope.GetVarExpr) {
        let value = this.manageVar(VarOp.Retrieve, node.name);
        return value;
    }

    evalSetVar(node: ParserScope.SetVarExpr) {
        let value = node.value.evaluate(this);
        this.manageVar(VarOp.Store, node.name, value);
        return value;
    }

    private _varsDict: { [name: string]: any; } = {};

    private manageVar(op: VarOp, name: string, value?) {
        let name2 = name.replace(/^\$/, "").toLowerCase() || "$";
        let dict = this._varsDict;

        switch (op) {
            case VarOp.Store:
                dict[name2] = value;
                if (value === void 0)
                    throwError(`cannot assign undefined value to variable ${name}`);
                break;

            case VarOp.Retrieve:
                value = dict[name2];
                if (value === void 0)
                    throwError(`variable ${name} is not defined`);
                break;

            case VarOp.Delete:
                value = dict[name2];
                delete dict[name2];
                break;
        }

        return value;
    }

    protected static _brewerConstsDict: { [key: string]: string[]; };

    protected static getBrewerConstsDict() {
        let dict = this._brewerConstsDict;

        if (!dict) {
            dict = {};

            for (let key in chroma.brewer)
                if (chroma.brewer.hasOwnProperty(key))
                    dict[key.toLowerCase()] = chroma.brewer[key];

            this._brewerConstsDict = dict;
        }

        return dict;
    }

    private numbersArithmeticOp(node: ParserScope.BinaryExpr) {
        let left = <number>node.left.evaluate(this);
        let right = <number>node.right.evaluate(this);
        let value = this.getNumberArithmeticFunc(node.operator)(left, right);
        return value;
    }

    private blendColorsOp(node: ParserScope.BinaryExpr, mode: BlendMode) {
        let left = <Chroma.Color>node.left.evaluate(this);
        let right = <Chroma.Color>node.right.evaluate(this);
        let value = blendColors(left, right, mode);
        return value;
    }

    private colorArithmeticOp(node: ParserScope.BinaryExpr) {
        let left = node.left.evaluate(this);
        let right = node.right.evaluate(this);
        let value = colorArithmeticOp(left, right, node.operator);
        return value;
    }

    private adjustColorCompOp(node: ParserScope.BinaryExpr, colorComp: string, add: boolean) {
        let left = <Chroma.Color>node.left.evaluate(this);
        let right = forceNumInRange(node.right.evaluate(this), 0, 1, node.right.$loc);
        let value = cloneValue(left).set(colorComp, `*${!add ? (1 - right) : (1 + right) }`);
        return value;
    }

    private addColorScaleParam(node: ParserScope.ParamExpr, scaleParams: boolean, name: string, value?) {
        let obj = <ColorScale>cloneValue(node.obj.evaluate(this));
        let params = scaleParams ? obj.scaleParams : obj.params;

        for (let i = 0; i < params.length; i++)
            if (params[i].name === name) {
                params.splice(i, 1);
                break;
            }

        params.push({
            name: name,
            value: value
        });

        return obj;
    }
}
