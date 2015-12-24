/// <reference path="../typings/tsd.d.ts" />

import * as _ from "lodash";
import * as ParserScope from "./parser-scope";
import { Evaluator } from "./eval-scope";
import { BlendMode, throwError } from "./utils";

export class LessEvaluator extends Evaluator {
    constructor() {
        super("less");
    }

    evalProgram(node: ParserScope.Program) {
        // do core evaluation to perform all necessary validations
        this.getCore().evalProgram(node);

        let value = node.statements.length > 1
            ? _.map(node.statements, st => `${st.evaluate(this)};`).join("\n")
            : node.statements[0].evaluate(this);

        return value;
    }

    evalStatement(node: ParserScope.Statement) {
        let value = node.expr.evaluate(this);
        return value;
    }

    evalParentheses(node: ParserScope.ParenthesesExpr) {
        let value = `(${node.expr.evaluate(this)})`;
        return value;
    }

    evalNumberLiteral(node: ParserScope.NumberLiteralExpr) {
        let n = this.getCore().evalNumberLiteral(node);
        let value = n % 1 === 0 ? n : n.toFixed(8).replace(/0+$/, "");
        return value;
    }

    evalPercent(node: ParserScope.PercentExpr) {
        let value = `${node.value.evaluate(this)}%`;
        return value;
    }

    evalArrayLiteral(node: ParserScope.ArrayLiteralExpr) {
        let value = _.map(node.value, expr => expr.evaluate(this)).join(" ");
        return value;
    }

    evalArrayElement(node: ParserScope.ArrayElementExpr) {
        let indexStr: string;

        if (node.index instanceof ParserScope.NumberLiteralExpr) {
            let index = this.getCore().evalNumberLiteral(<ParserScope.NumberLiteralExpr>node.index);
            indexStr = String(index + 1);
        }
        else
            indexStr = `${node.index.evaluate(this) } + 1`;

        let value = `extract(${node.array.evaluate(this)}, ${indexStr})`;
        return value;
    }

    evalColorNameLiteral(node: ParserScope.ColorNameLiteralExpr) {
        let value = node.value;
        return value;
    }

    evalColorHexLiteral(node: ParserScope.ColorHexLiteralExpr) {
        let value = (!node.value.match(/^#/) ? "#" : "") + node.value;
        return value;
    }

    evalColorByNumber(node: ParserScope.ColorByNumberExpr) {
        throwError("defining color by number is not supported by LESS", node.$loc);
    }

    evalColorByTemperature(node: ParserScope.ColorByTemperatureExpr) {
        throwError("defining color by temperature is not supported by LESS", node.$loc);
    }

    evalColorByWavelength(node: ParserScope.ColorByWavelengthExpr) {
        throwError("defining color by wavelength is not supported by LESS", node.$loc);
    }

    evalColorBySpaceParams(node: ParserScope.ColorBySpaceParams) {
        let params = _.map(node.params, expr => expr.evaluate(this));
        let alpha = params.length > (node.space === "cmyk" ? 4 : 3);
        let value = void 0;

        switch (node.space) {
            case "argb": value = `${node.space}(${params.join(", ")})`; break;

            case "rgb":
            case "hsl":
            case "hsv": value = `${node.space + (alpha ? "a" : "")}(${params.join(", ")})`; break;

            default: this.unspColorSpace(node.space, node.$loc);
        }

        return value;
    }

    evalRandomColor(node: ParserScope.RandomColorExpr) {
        //return "~`(function(){for(var i=0,c='#',m=Math;i<6;i++)c+='0123456789ABCDEF'[m.floor(m.random()*16)];return c;})()`";
        return "~\"#`(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)`\"";
    }

    evalScale(node: ParserScope.ScaleExpr)         { this.unspColorScale(node.$loc); }
    evalBezier(node: ParserScope.BezierExpr)       { this.unspColorScale(node.$loc); }
    evalCubehelix(node: ParserScope.CubehelixExpr) { this.unspColorScale(node.$loc); }

    evalBrewerConst(node: ParserScope.BrewerConstExpr) {
        let coreValue = this.getCore().evalBrewerConst(node);
        let value = _.map(coreValue, (c: Chroma.Color) => c.hex()).join(" ");
        return value;
    }

    evalUnaryMinus(node: ParserScope.UnaryExpr) {
        let value = `-${node.value.evaluate(this)}`;
        return value;
    }

    evalColorInverse(node: ParserScope.UnaryExpr) {
        let value = `(#fff - ${node.value.evaluate(this)})`;
        return value;
    }

    evalCorrectLightness(node: ParserScope.UnaryExpr) {
        this.unspColorScale(node.$loc);
    }

    evalNumbersAddition(node: ParserScope.BinaryExpr)       { return this.arithmeticOp(node); }
    evalNumbersSubtraction(node: ParserScope.BinaryExpr)    { return this.arithmeticOp(node); }
    evalNumbersMultiplication(node: ParserScope.BinaryExpr) { return this.arithmeticOp(node); }
    evalNumbersDivision(node: ParserScope.BinaryExpr)       { return this.arithmeticOp(node); }

    evalColorAndNumberAddition(node: ParserScope.BinaryExpr)       { return this.arithmeticOp(node); }
    evalColorAndNumberSubtraction(node: ParserScope.BinaryExpr)    { return this.arithmeticOp(node); }
    evalColorAndNumberMultiplication(node: ParserScope.BinaryExpr) { return this.arithmeticOp(node); }
    evalColorAndNumberDivision(node: ParserScope.BinaryExpr)       { return this.arithmeticOp(node); }

    evalNumberPower(node: ParserScope.BinaryExpr) {
        let left = node.left.evaluate(this);
        let right = node.right.evaluate(this);
        let value = `pow(${left}, ${right})`;
        return value;
    }

    evalColorsContrast(node: ParserScope.BinaryExpr) {
        throwError("calculating numeric contrast value is not supported by LESS", node.$loc);
    }

    evalColorsMix(node: ParserScope.BinaryExpr) {
        let params = <string[]>[
            node.left.evaluate(this),
            node.right.evaluate(this)
        ];

        let ratioExpr = <ParserScope.Expr>(node.options || {}).ratio;
        if (ratioExpr)
            params.push(this.toPercentage(ratioExpr));

        let mode = <string>(node.options || {}).mode;
        if (mode && mode !== "rgb")
            throwError("LESS supports mixing colors only in RGB color space", node.$loc);

        let func = "mix";
        let leftColorStr = (<Chroma.Color>node.left.evaluate(this.getCore())).hex("rgba").toLowerCase();

        if (leftColorStr === "#ffffffff") {
            params.shift();
            func = "tint";
        }
        else if (leftColorStr === "#000000ff") {
            params.shift();
            func = "shade";
        }

        let value = `${func}(${params.join(", ")})`;

        return value;
    }

    evalColorsFromScaleProduction(node: ParserScope.BinaryExpr) {
        this.unspColorScale(node.$loc);
    }

    evalColorDesaturate(node: ParserScope.BinaryExpr) { return this.funcOp(node.left, node.right, "desaturate", true, true); }
    evalColorSaturate(node: ParserScope.BinaryExpr)   { return this.funcOp(node.left, node.right, "saturate", true, true); }
    evalColorDarken(node: ParserScope.BinaryExpr)     { return this.funcOp(node.left, node.right, "darken", true, true); }
    evalColorLighten(node: ParserScope.BinaryExpr)    { return this.funcOp(node.left, node.right, "lighten", true, true); }

    evalAddBlend(node: ParserScope.BinaryExpr)        { return this.arithmeticOp(node); }
    evalSubtractBlend(node: ParserScope.BinaryExpr)   { return this.arithmeticOp(node); }
    evalMultiplyBlend(node: ParserScope.BinaryExpr)   { return this.funcOp(node.left, node.right, "multiply"); }
    evalDivideBlend(node: ParserScope.BinaryExpr)     { return this.arithmeticOp(node); }
    evalColorBurnBlend(node: ParserScope.BinaryExpr)  { return this.unspColorBlend(BlendMode.ColorBurn, node.$loc); }
    evalColorDodgeBlend(node: ParserScope.BinaryExpr) { return this.unspColorBlend(BlendMode.ColorDodge, node.$loc); }
    evalDarkenBlend(node: ParserScope.BinaryExpr)     { return this.unspColorBlend(BlendMode.Darken, node.$loc); }
    evalLightenBlend(node: ParserScope.BinaryExpr)    { return this.unspColorBlend(BlendMode.Lighten, node.$loc); }
    evalScreenBlend(node: ParserScope.BinaryExpr)     { return this.funcOp(node.left, node.right, "screen"); }
    evalOverlayBlend(node: ParserScope.BinaryExpr)    { return this.funcOp(node.left, node.right, "overlay"); }
    evalHardLightBlend(node: ParserScope.BinaryExpr)  { return this.funcOp(node.left, node.right, "hardlight"); }
    evalSoftLightBlend(node: ParserScope.BinaryExpr)  { return this.funcOp(node.left, node.right, "softlight"); }
    evalDifferenceBlend(node: ParserScope.BinaryExpr) { return this.funcOp(node.left, node.right, "difference"); }
    evalExclusionBlend(node: ParserScope.BinaryExpr)  { return this.funcOp(node.left, node.right, "exclusion"); }
    evalNegateBlend(node: ParserScope.BinaryExpr)     { return this.funcOp(node.left, node.right, "negation"); }

    evalManageColorNumber(node: ParserScope.ParamExpr) {
        throwError("defining color by number is not supported by LESS", node.$loc);
    }

    evalManageColorTemperature(node: ParserScope.ParamExpr) {
        throwError("defining color by temperature is not supported by LESS", node.$loc);
    }

    evalManageColorLuminance(node: ParserScope.ParamExpr) {
        let res: string = void 0;

        if (node.value === void 0)
            res = `luma(${node.obj.evaluate(this)})`;
        else
            throwError(`setting luminance is not supported by LESS`, node.$loc);

        return res;
    }

    evalManageColorAlpha(node: ParserScope.ParamExpr) {
        let res: string = void 0;

        if (node.value === void 0)
            res = `alpha(${node.obj.evaluate(this)})`;
        else {
            if (node.operator === "+")
                res = this.funcOp(node.obj, node.value, "fadein", true);
            else if (node.operator === "-")
                res = this.funcOp(node.obj, node.value, "fadeout", true);
            else if (!node.operator)
                res = this.funcOp(node.obj, node.value, "fade", true);
            else
                throwError(`assignment operator '${node.operator}=' for alpha channel is not supported by LESS`, node.$loc);
        }

        return res;
    }

    evalManageColorCompRgbR(node: ParserScope.ParamExpr)  { return this.getColorCompOp(node, "rgb", "red"); }
    evalManageColorCompRgbG(node: ParserScope.ParamExpr)  { return this.getColorCompOp(node, "rgb", "green"); }
    evalManageColorCompRgbB(node: ParserScope.ParamExpr)  { return this.getColorCompOp(node, "rgb", "blue"); }

    evalManageColorCompCmykC(node: ParserScope.ParamExpr) { this.unspColorSpace("cmyk", node.$loc); }
    evalManageColorCompCmykM(node: ParserScope.ParamExpr) { this.unspColorSpace("cmyk", node.$loc); }
    evalManageColorCompCmykY(node: ParserScope.ParamExpr) { this.unspColorSpace("cmyk", node.$loc); }
    evalManageColorCompCmykK(node: ParserScope.ParamExpr) { this.unspColorSpace("cmyk", node.$loc); }

    evalManageColorCompHslH(node: ParserScope.ParamExpr)  { return this.getColorCompOp(node, "hsl", "hue"); }
    evalManageColorCompHslS(node: ParserScope.ParamExpr)  { return this.getColorCompOp(node, "hsl", "saturation"); }
    evalManageColorCompHslL(node: ParserScope.ParamExpr)  { return this.getColorCompOp(node, "hsl", "lightness"); }

    evalManageColorCompHsvH(node: ParserScope.ParamExpr)  { return this.getColorCompOp(node, "hsv", "hsvhue"); }
    evalManageColorCompHsvS(node: ParserScope.ParamExpr)  { return this.getColorCompOp(node, "hsv", "hsvsaturation"); }
    evalManageColorCompHsvV(node: ParserScope.ParamExpr)  { return this.getColorCompOp(node, "hsv", "hsvvalue"); }

    evalManageColorCompHsiH(node: ParserScope.ParamExpr)  { this.unspColorSpace("hsi", node.$loc); }
    evalManageColorCompHsiS(node: ParserScope.ParamExpr)  { this.unspColorSpace("hsi", node.$loc); }
    evalManageColorCompHsiI(node: ParserScope.ParamExpr)  { this.unspColorSpace("hsi", node.$loc); }

    evalManageColorCompLabL(node: ParserScope.ParamExpr)  { this.unspColorSpace("lab", node.$loc); }
    evalManageColorCompLabA(node: ParserScope.ParamExpr)  { this.unspColorSpace("lab", node.$loc); }
    evalManageColorCompLabB(node: ParserScope.ParamExpr)  { this.unspColorSpace("lab", node.$loc); }

    evalManageColorCompLchL(node: ParserScope.ParamExpr)  { this.unspColorSpace("lch", node.$loc); }
    evalManageColorCompLchC(node: ParserScope.ParamExpr)  { this.unspColorSpace("lch", node.$loc); }
    evalManageColorCompLchH(node: ParserScope.ParamExpr)  { this.unspColorSpace("lch", node.$loc); }

    evalSetColorScalePadding(node: ParserScope.ParamExpr)  { this.unspColorScale(node.$loc); }
    evalSetScaleDomain(node: ParserScope.ParamExpr)        { this.unspColorScale(node.$loc); }
    evalSetCubehelixStart(node: ParserScope.ParamExpr)     { this.unspColorScale(node.$loc); }
    evalSetCubehelixRotations(node: ParserScope.ParamExpr) { this.unspColorScale(node.$loc); }
    evalSetCubehelixHue(node: ParserScope.ParamExpr)       { this.unspColorScale(node.$loc); }
    evalSetCubehelixGamma(node: ParserScope.ParamExpr)     { this.unspColorScale(node.$loc); }
    evalSetCubehelixLightness(node: ParserScope.ParamExpr) { this.unspColorScale(node.$loc); }

    evalGetVar(node: ParserScope.GetVarExpr) {
        let value = `@${node.name.replace(/^\$/, "")}`;
        return value;
    }

    evalSetVar(node: ParserScope.SetVarExpr) {
        let value = `@${node.name.replace(/^\$/, "")}: ${node.value.evaluate(this)}`;
        return value;
    }

    protected arithmeticOp(node: ParserScope.BinaryExpr) {
        let left = node.left.evaluate(this);
        let right = node.right.evaluate(this);
        let value = `${left} ${node.operator} ${right}`;
        return value;
    }

    protected toPercentage(node: ParserScope.Node) {
        let value = node.evaluate(this);
        let res: string;

        if (node instanceof ParserScope.PercentExpr)
            res = value;
        else if (node instanceof ParserScope.NumberLiteralExpr)
            res = this.getCore().evalNumberLiteral(node) * 100 + "%";
        else
            res = `percentage(${value})`;

        return res;
    }

    protected funcOp(
        nodeLeft: ParserScope.Node,
        nodeRight: ParserScope.Node,
        func: string,
        rightIsPercentage = false,
        relative = false
    ) {
        let params = <string[]>[
            nodeLeft.evaluate(this),
            rightIsPercentage ? this.toPercentage(nodeRight) : nodeRight.evaluate(this)
        ];

        if (relative)
            params.push("relative");

        let value = `${func}(${params.join(", ")})`;
        return value;
    }

    protected getColorCompOp(node: ParserScope.ParamExpr, space: string, func: string) {
        if (node.value === void 0) {
            let res = `${func}(${node.obj.evaluate(this)})`;
            return res;
        }
        else
            throwError(`setting components in ${space.toUpperCase()} color space is not supported by LESS`, node.$loc);
    }

    private unspColorScale(loc: ParserScope.Loc) {
        throwError("color scales are not supported by LESS", loc);
    }

    private unspColorSpace(space: string, loc: ParserScope.Loc) {
        throwError(`color space '${space.toUpperCase() }' is not supported by LESS`, loc);
    }

    private unspColorBlend(mode: BlendMode, loc: ParserScope.Loc) {
        throwError(`'${BlendMode[mode]}' blending function is not supported by LESS`, loc);
    }
}
