import * as Chroma from "chroma-js"

export declare namespace Nodes {
    export class LocPos {
        ln: number
        col: number
        i: number

        constructor(ln: number, col: number, i: number)

        toString(): string
    }

    export class Loc {
        start: LocPos
        end: LocPos

        constructor(loc)

        toString(): string
    }

    export abstract class Node {
        $type: string
        $loc: Loc

        constructor($type: string, $loc: Loc)

        getDto(withLoc?: boolean)
        evaluate(e: Evaluators.EvaluatorBase)
    }

    export class Program extends Node {
        statements: Statement[]

        constructor(statements: Statement[], $loc?)

        getDto(withLoc?: boolean)
    }

    export class Statement extends Node {
        expr: Expr

        constructor(expr: Expr, $loc?)

        getDto(withLoc?: boolean)
    }

    export abstract class Expr extends Node {
        constructor($type: string, $loc?)
    }

    export class ParenthesesExpr extends Expr {
        expr: Expr

        constructor(expr: Expr, $loc?)
    }

    export class NumberLiteralExpr extends Expr {
        value: string

        constructor(value: string, $loc?)
    }

    export class PercentExpr extends Expr {
        value: NumberLiteralExpr

        constructor(value: NumberLiteralExpr, $loc?)
    }

    export class ArrayLiteralExpr extends Expr {
        value: Expr[]

        constructor(value: Expr[], $loc?)
    }

    export class ColorNameLiteralExpr extends Expr {
        value: string

        constructor(value: string, $loc?)
    }

    export class ColorHexLiteralExpr extends Expr {
        value: string

        constructor(value: string, $loc?)
    }

    export class ColorByNumberExpr extends Expr {
        value: Expr

        constructor(value: Expr, $loc?)
    }

    export class ColorByTemperatureExpr extends Expr {
        value: Expr

        constructor(value: Expr, $loc?)
    }

    export class ColorByWavelengthExpr extends Expr {
        value: Expr

        constructor(value: Expr, $loc?)
    }

    export class ColorBySpaceParams extends Expr {
        space: string
        params: Expr[]

        constructor(space: string, params: Expr[], $loc?)
    }

    export class RandomColorExpr extends Expr {
        constructor($loc?)
    }

    export class ScaleExpr extends Expr {
        colors: Expr | Expr[]
        domain: Expr[]
        mode: string

        constructor(colors: Expr | Expr[], domain?: Expr[], mode?: string, $loc?)
    }

    export class BezierExpr extends Expr {
        colors: Expr

        constructor(colors: Expr, $loc?)
    }

    export class CubehelixExpr extends Expr {
        constructor($loc?)
    }

    export class BrewerConstExpr extends Expr {
        name: string

        constructor(name: string, $loc?)
    }

    export abstract class ParamExpr extends Expr {
        obj: Expr
        name: string
        value: Expr
        operator: string

        constructor($type: string, obj: Expr, name: string, value?: Expr, operator?: string, $loc?)
    }

    export class GetParamExpr extends ParamExpr {
        constructor(obj: Expr, name: string, $loc?)
    }

    export class SetParamExpr extends ParamExpr {
        constructor(obj: Expr, name: string, value?: Expr, operator?: string, $loc?)
    }

    export abstract class OperationExpr extends Expr {
        operator: string
        options

        constructor($type: string, operator: string, options, $loc?)
    }

    export class UnaryExpr extends OperationExpr {
        value: Expr
        operator: string
        options

        constructor(value: Expr, operator: string, options, $loc?)
    }

    export class BinaryExpr extends OperationExpr {
        left: Expr
        right: Expr
        operator: string
        options

        constructor(left: Expr, right: Expr, operator: string, options, $loc?)
    }

    export class GetVarExpr extends Expr {
        name: string

        constructor(name: string, $loc?)
    }

    export class SetVarExpr extends Expr {
        name: string
        value: Expr

        constructor(name: string, value: Expr, $loc?)
    }
}

export declare namespace Evaluators {
    export abstract class EvaluatorBase {
        $type: string

        constructor($type: string)

        evalProgram(node: Nodes.Program)
        evalStatement(node: Nodes.Statement)
        evalParentheses(node: Nodes.ParenthesesExpr)
        evalNumberLiteral(node: Nodes.NumberLiteralExpr)
        evalPercent(node: Nodes.PercentExpr)
        evalArrayLiteral(node: Nodes.ArrayLiteralExpr)
        evalArrayElement(node: Nodes.ParamExpr)
        evalColorNameLiteral(node: Nodes.ColorNameLiteralExpr)
        evalColorHexLiteral(node: Nodes.ColorHexLiteralExpr)
        evalColorByNumber(node: Nodes.ColorByNumberExpr)
        evalColorByTemperature(node: Nodes.ColorByTemperatureExpr)
        evalColorByWavelength(node: Nodes.ColorByWavelengthExpr)
        evalColorBySpaceParams(node: Nodes.ColorBySpaceParams)
        evalRandomColor(node: Nodes.RandomColorExpr)
        evalScale(node: Nodes.ScaleExpr)
        evalBezier(node: Nodes.BezierExpr)
        evalCubehelix(node: Nodes.CubehelixExpr)
        evalBrewerConst(node: Nodes.BrewerConstExpr)
        evalParam(node: Nodes.ParamExpr)
        evalManageColorNumber(node: Nodes.ParamExpr)
        evalManageColorTemperature(node: Nodes.ParamExpr)
        evalManageColorLuminance(node: Nodes.ParamExpr)
        evalManageColorAlpha(node: Nodes.ParamExpr)
        evalManageColorCompRgbR(node: Nodes.ParamExpr)
        evalManageColorCompRgbG(node: Nodes.ParamExpr)
        evalManageColorCompRgbB(node: Nodes.ParamExpr)
        evalManageColorCompCmykC(node: Nodes.ParamExpr)
        evalManageColorCompCmykM(node: Nodes.ParamExpr)
        evalManageColorCompCmykY(node: Nodes.ParamExpr)
        evalManageColorCompCmykK(node: Nodes.ParamExpr)
        evalManageColorCompHslH(node: Nodes.ParamExpr)
        evalManageColorCompHslS(node: Nodes.ParamExpr)
        evalManageColorCompHslL(node: Nodes.ParamExpr)
        evalManageColorCompHsvH(node: Nodes.ParamExpr)
        evalManageColorCompHsvS(node: Nodes.ParamExpr)
        evalManageColorCompHsvV(node: Nodes.ParamExpr)
        evalManageColorCompHsiH(node: Nodes.ParamExpr)
        evalManageColorCompHsiS(node: Nodes.ParamExpr)
        evalManageColorCompHsiI(node: Nodes.ParamExpr)
        evalManageColorCompLabL(node: Nodes.ParamExpr)
        evalManageColorCompLabA(node: Nodes.ParamExpr)
        evalManageColorCompLabB(node: Nodes.ParamExpr)
        evalManageColorCompLchL(node: Nodes.ParamExpr)
        evalManageColorCompLchC(node: Nodes.ParamExpr)
        evalManageColorCompLchH(node: Nodes.ParamExpr)
        evalSetColorScalePadding(node: Nodes.ParamExpr)
        evalSetScaleDomain(node: Nodes.ParamExpr)
        evalSetCubehelixStart(node: Nodes.ParamExpr)
        evalSetCubehelixRotations(node: Nodes.ParamExpr)
        evalSetCubehelixHue(node: Nodes.ParamExpr)
        evalSetCubehelixGamma(node: Nodes.ParamExpr)
        evalSetCubehelixLightness(node: Nodes.ParamExpr)
        evalUnaryOperation(node: Nodes.UnaryExpr)
        evalUnaryMinus(node: Nodes.UnaryExpr)
        evalColorInverse(node: Nodes.UnaryExpr)
        evalCorrectLightness(node: Nodes.UnaryExpr)
        evalBinaryOperation(node: Nodes.BinaryExpr)
        evalNumbersAddition(node: Nodes.BinaryExpr)
        evalNumbersSubtraction(node: Nodes.BinaryExpr)
        evalNumbersMultiplication(node: Nodes.BinaryExpr)
        evalNumbersDivision(node: Nodes.BinaryExpr)
        evalColorAndNumberAddition(node: Nodes.BinaryExpr)
        evalColorAndNumberSubtraction(node: Nodes.BinaryExpr)
        evalColorAndNumberMultiplication(node: Nodes.BinaryExpr)
        evalColorAndNumberDivision(node: Nodes.BinaryExpr)
        evalNumberPower(node: Nodes.BinaryExpr)
        evalColorsContrast(node: Nodes.BinaryExpr)
        evalColorsMix(node: Nodes.BinaryExpr)
        evalColorsFromScaleProduction(node: Nodes.BinaryExpr)
        evalColorDesaturate(node: Nodes.BinaryExpr)
        evalColorSaturate(node: Nodes.BinaryExpr)
        evalColorDarken(node: Nodes.BinaryExpr)
        evalColorLighten(node: Nodes.BinaryExpr)
        evalAddBlend(node: Nodes.BinaryExpr)
        evalSubtractBlend(node: Nodes.BinaryExpr)
        evalMultiplyBlend(node: Nodes.BinaryExpr)
        evalDivideBlend(node: Nodes.BinaryExpr)
        evalColorBurnBlend(node: Nodes.BinaryExpr)
        evalColorDodgeBlend(node: Nodes.BinaryExpr)
        evalDarkenBlend(node: Nodes.BinaryExpr)
        evalLightenBlend(node: Nodes.BinaryExpr)
        evalScreenBlend(node: Nodes.BinaryExpr)
        evalOverlayBlend(node: Nodes.BinaryExpr)
        evalHardLightBlend(node: Nodes.BinaryExpr)
        evalSoftLightBlend(node: Nodes.BinaryExpr)
        evalDifferenceBlend(node: Nodes.BinaryExpr)
        evalExclusionBlend(node: Nodes.BinaryExpr)
        evalNegateBlend(node: Nodes.BinaryExpr)
        evalGetVar(node: Nodes.GetVarExpr)
        evalSetVar(node: Nodes.SetVarExpr)
    }

    export class CoreEvaluator extends EvaluatorBase {
    }

    export class LessEvaluator extends EvaluatorBase {
    }
}

export interface ColorScaleParam {
    name: string
    value?
}

export declare class ColorScale {
    name: string
    params: ColorScaleParam[]
    scaleParams: ColorScaleParam[]

    constructor(name: string, params?: ColorScaleParam[], scaleParams?: ColorScaleParam[])

    toString(): string
    clone(): ColorScale
    getFn()
}

export declare enum BlendMode {
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
    Subtract
}

export declare enum ValueType {
    Number,
    Color,
    ColorScale,
    Array,
    NumberArray,
    ColorArray
}

export declare namespace Utils {
    export function blendColors(bg: Chroma.Color, fg: Chroma.Color, mode: BlendMode): Chroma.Color
    export function cmyToCmykArray(values: number[])
    export function cmyToCmykArray(c: number, m: number, y: number)
    export function cmyToCmyk(c: number, m: number, y: number): Chroma.Color
    export function inverseColor(color: Chroma.Color)
    export function colorArithmeticOp(color: Chroma.Color, n: number, op: string): Chroma.Color
    export function colorArithmeticOp(n: number, color: Chroma.Color, op: string): Chroma.Color
    export function roundColorComps(color: Chroma.Color, space?: string): Chroma.Color
    export function getColorSpaceParamsValidRanges(space: string): number[][]
    export function isColor(value): boolean
    export function formatColor(color: Chroma.Color, appendName?: boolean): string
    export function colorFromWavelength(wl: number): Chroma.Color
    export function throwError(error: string, loc?): void
    export function getType(value): ValueType
    export function forceType(value, type: ValueType | ValueType[], loc?)
    export function forceRange(value, loc?)
    export function cloneValue(value)
    export function forceNumInRange(value, range: number[], loc?): number
    export function forceNumInRange(value, min: number, max: number, loc?): number
    export function getObjKey(obj, value)
}

export interface EvaluateOptions {
    evaluator?: Evaluators.EvaluatorBase
    withAst?: boolean
    astWithLocs?: boolean
}

export interface EvaluateResult {
    withAst?: boolean
    astWithLocs?: boolean
    expr: string
    program: Nodes.Program
    result
    resultStr: string
    astStr: string
    error: string
}

export declare function evaluate(expr: string, options?: EvaluateOptions): EvaluateResult
