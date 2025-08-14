import * as Chroma from 'chroma-js';

export declare namespace Nodes {
  export class LocPos {
    ln: number;
    col: number;
    i: number;

    constructor(ln: number, col: number, i: number);

    toString(): string;
  }

  export class Loc {
    start: LocPos;
    end: LocPos;

    constructor(loc: {
      first_line: number;
      first_column: number;
      last_line: number;
      last_column: number;
      range: [number, number];
    });

    toString(): string;
  }

  export abstract class Node {
    $type: string;
    $loc: Loc;

    constructor($type: string, $loc: Loc);

    getDto(withLoc?: boolean): object;
    evaluate(e: EvaluatorBase);
  }

  export class Program extends Node {
    statements: Statement[];

    constructor(statements: Statement[], $loc?: Loc);

    getDto(withLoc?: boolean): object;
  }

  export class Statement extends Node {
    expr: Expr;

    constructor(expr: Expr, $loc?: Loc);

    getDto(withLoc?: boolean): object;
  }

  export abstract class Expr extends Node {
    constructor($type: string, $loc?: Loc);
  }

  export class ParenthesesExpr extends Expr {
    expr: Expr;

    constructor(expr: Expr, $loc?: Loc);
  }

  export class NumberLiteralExpr extends Expr {
    value: string;

    constructor(value: string, $loc?: Loc);
  }

  export class PercentExpr extends Expr {
    value: NumberLiteralExpr;

    constructor(value: NumberLiteralExpr, $loc?: Loc);
  }

  export class ArrayLiteralExpr extends Expr {
    value: Expr[];

    constructor(value: Expr[], $loc?: Loc);
  }

  export class ColorNameLiteralExpr extends Expr {
    value: string;

    constructor(value: string, $loc?: Loc);
  }

  export class ColorHexLiteralExpr extends Expr {
    value: string;

    constructor(value: string, $loc?: Loc);
  }

  export class ColorByNumberExpr extends Expr {
    value: Expr;

    constructor(value: Expr, $loc?: Loc);
  }

  export class ColorByTemperatureExpr extends Expr {
    value: Expr;

    constructor(value: Expr, $loc?: Loc);
  }

  export class ColorByWavelengthExpr extends Expr {
    value: Expr;

    constructor(value: Expr, $loc?: Loc);
  }

  export class ColorBySpaceParams extends Expr {
    space: string;
    params: Expr[];

    constructor(space: string, params: Expr[], $loc?: Loc);
  }

  export class RandomColorExpr extends Expr {
    constructor($loc?: Loc);
  }

  export class ScaleExpr extends Expr {
    colors: Expr | Expr[];
    domain: Expr[];
    mode: string;

    constructor(
      colors: Expr | Expr[],
      domain?: Expr[],
      mode?: string,
      $loc?: Loc
    );
  }

  export class BezierExpr extends Expr {
    colors: Expr;

    constructor(colors: Expr, $loc?: Loc);
  }

  export class CubehelixExpr extends Expr {
    constructor($loc?: Loc);
  }

  export class BrewerConstExpr extends Expr {
    name: string;

    constructor(name: string, $loc?: Loc);
  }

  export abstract class ParamExpr extends Expr {
    obj: Expr;
    name: string;
    value: Expr;
    operator: string;

    constructor(
      $type: string,
      obj: Expr,
      name: string,
      value?: Expr,
      operator?: string,
      $loc?: Loc
    );
  }

  export class GetParamExpr extends ParamExpr {
    constructor(obj: Expr, name: string, $loc?: Loc);
  }

  export class SetParamExpr extends ParamExpr {
    constructor(
      obj: Expr,
      name: string,
      value?: Expr,
      operator?: string,
      $loc?: Loc
    );
  }

  export abstract class OperationExpr extends Expr {
    operator: string;
    options;

    constructor($type: string, operator: string, options, $loc?: Loc);
  }

  export class UnaryExpr extends OperationExpr {
    value: Expr;
    operator: string;
    options;

    constructor(value: Expr, operator: string, options, $loc?: Loc);
  }

  export class BinaryExpr extends OperationExpr {
    left: Expr;
    right: Expr;
    operator: string;
    options;

    constructor(left: Expr, right: Expr, operator: string, options, $loc?: Loc);
  }

  export class GetVarExpr extends Expr {
    name: string;

    constructor(name: string, $loc?: Loc);
  }

  export class SetVarExpr extends Expr {
    name: string;
    value: Expr;

    constructor(name: string, value: Expr, $loc?: Loc);
  }
}

export declare abstract class EvaluatorBase {
  $type: string;

  constructor($type: string);

  evalProgram(node: Nodes.Program);
  evalStatement(node: Nodes.Statement);
  evalParentheses(node: Nodes.ParenthesesExpr);
  evalNumberLiteral(node: Nodes.NumberLiteralExpr): number | string;
  evalPercent(node: Nodes.PercentExpr): number | string;
  evalArrayLiteral(node: Nodes.ArrayLiteralExpr): any[];
  evalArrayElement(node: Nodes.ParamExpr);
  evalColorNameLiteral(node: Nodes.ColorNameLiteralExpr): Chroma.Color | string;
  evalColorHexLiteral(node: Nodes.ColorHexLiteralExpr): Chroma.Color | string;
  evalColorByNumber(node: Nodes.ColorByNumberExpr): Chroma.Color;
  evalColorByTemperature(node: Nodes.ColorByTemperatureExpr): Chroma.Color;
  evalColorByWavelength(node: Nodes.ColorByWavelengthExpr): Chroma.Color;
  evalColorBySpaceParams(node: Nodes.ColorBySpaceParams): Chroma.Color;
  evalRandomColor(node: Nodes.RandomColorExpr): Chroma.Color;
  evalScale(node: Nodes.ScaleExpr): ColorScale | void;
  evalBezier(node: Nodes.BezierExpr): ColorScale | void;
  evalCubehelix(node: Nodes.CubehelixExpr): ColorScale | void;
  evalBrewerConst(node: Nodes.BrewerConstExpr): Chroma.Color[];
  evalParam(node: Nodes.ParamExpr);
  evalManageColorNumber(node: Nodes.ParamExpr): number;
  evalManageColorTemperature(node: Nodes.ParamExpr): number;
  evalManageColorLuminance(node: Nodes.ParamExpr): number;
  evalManageColorAlpha(node: Nodes.ParamExpr): number;
  evalManageColorCompRgbR(node: Nodes.ParamExpr): number;
  evalManageColorCompRgbG(node: Nodes.ParamExpr): number;
  evalManageColorCompRgbB(node: Nodes.ParamExpr): number;
  evalManageColorCompCmykC(node: Nodes.ParamExpr): number;
  evalManageColorCompCmykM(node: Nodes.ParamExpr): number;
  evalManageColorCompCmykY(node: Nodes.ParamExpr): number;
  evalManageColorCompCmykK(node: Nodes.ParamExpr): number;
  evalManageColorCompHslH(node: Nodes.ParamExpr): number;
  evalManageColorCompHslS(node: Nodes.ParamExpr): number;
  evalManageColorCompHslL(node: Nodes.ParamExpr): number;
  evalManageColorCompHsvH(node: Nodes.ParamExpr): number;
  evalManageColorCompHsvS(node: Nodes.ParamExpr): number;
  evalManageColorCompHsvV(node: Nodes.ParamExpr): number;
  evalManageColorCompHsiH(node: Nodes.ParamExpr): number;
  evalManageColorCompHsiS(node: Nodes.ParamExpr): number;
  evalManageColorCompHsiI(node: Nodes.ParamExpr): number;
  evalManageColorCompLabL(node: Nodes.ParamExpr): number;
  evalManageColorCompLabA(node: Nodes.ParamExpr): number;
  evalManageColorCompLabB(node: Nodes.ParamExpr): number;
  evalManageColorCompLchL(node: Nodes.ParamExpr): number;
  evalManageColorCompLchC(node: Nodes.ParamExpr): number;
  evalManageColorCompLchH(node: Nodes.ParamExpr): number;
  evalSetColorScalePadding(node: Nodes.ParamExpr): void;
  evalSetScaleDomain(node: Nodes.ParamExpr): void;
  evalSetCubehelixStart(node: Nodes.ParamExpr): void;
  evalSetCubehelixRotations(node: Nodes.ParamExpr): void;
  evalSetCubehelixHue(node: Nodes.ParamExpr): void;
  evalSetCubehelixGamma(node: Nodes.ParamExpr): void;
  evalSetCubehelixLightness(node: Nodes.ParamExpr): void;
  evalUnaryOperation(node: Nodes.UnaryExpr);
  evalUnaryMinus(node: Nodes.UnaryExpr): number;
  evalColorInverse(node: Nodes.UnaryExpr): Chroma.Color;
  evalCorrectLightness(node: Nodes.UnaryExpr): Chroma.Color;
  evalBinaryOperation(node: Nodes.BinaryExpr);
  evalNumbersAddition(node: Nodes.BinaryExpr): number;
  evalNumbersSubtraction(node: Nodes.BinaryExpr): number;
  evalNumbersMultiplication(node: Nodes.BinaryExpr): number;
  evalNumbersDivision(node: Nodes.BinaryExpr): number;
  evalColorAndNumberAddition(node: Nodes.BinaryExpr): Chroma.Color;
  evalColorAndNumberSubtraction(node: Nodes.BinaryExpr): Chroma.Color;
  evalColorAndNumberMultiplication(node: Nodes.BinaryExpr): Chroma.Color;
  evalColorAndNumberDivision(node: Nodes.BinaryExpr): Chroma.Color;
  evalNumberPower(node: Nodes.BinaryExpr): number;
  evalColorsContrast(node: Nodes.BinaryExpr): number;
  evalColorsMix(node: Nodes.BinaryExpr): Chroma.Color;
  evalColorsFromScaleProduction(node: Nodes.BinaryExpr): Chroma.Color;
  evalColorDesaturate(node: Nodes.BinaryExpr): Chroma.Color;
  evalColorSaturate(node: Nodes.BinaryExpr): Chroma.Color;
  evalColorDarken(node: Nodes.BinaryExpr): Chroma.Color;
  evalColorLighten(node: Nodes.BinaryExpr): Chroma.Color;
  evalAddBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalSubtractBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalMultiplyBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalDivideBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalColorBurnBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalColorDodgeBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalDarkenBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalLightenBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalScreenBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalOverlayBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalHardLightBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalSoftLightBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalDifferenceBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalExclusionBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalNegateBlend(node: Nodes.BinaryExpr): Chroma.Color;
  evalGetVar(node: Nodes.GetVarExpr);
  evalSetVar(node: Nodes.SetVarExpr): string | void;
}

export declare class CoreEvaluator extends EvaluatorBase {
  static get instance(): CoreEvaluator;
}

export declare class LessEvaluator extends EvaluatorBase {}

export interface ColorScaleParam {
  name: string;
  value?;
}

export declare class ColorScale {
  name: string;
  params: ColorScaleParam[];
  scaleParams: ColorScaleParam[];

  constructor(
    name: string,
    params?: ColorScaleParam[],
    scaleParams?: ColorScaleParam[]
  );

  toString(): string;
  clone(): ColorScale;
  getFn();
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
  Subtract,
}

export declare enum ValueType {
  Number,
  Color,
  ColorScale,
  Array,
  NumberArray,
  ColorArray,
}

export declare namespace Utils {
  export function blendColors(
    bg: Chroma.Color,
    fg: Chroma.Color,
    mode: BlendMode
  ): Chroma.Color;
  export function cmyToCmykArray(values: number[]): number[];
  export function cmyToCmykArray(c: number, m: number, y: number): number[];
  export function cmyToCmyk(c: number, m: number, y: number): Chroma.Color;
  export function inverseColor(color: Chroma.Color): Chroma.Color;
  export function colorArithmeticOp(
    color: Chroma.Color,
    n: number,
    op: string
  ): Chroma.Color;
  export function colorArithmeticOp(
    n: number,
    color: Chroma.Color,
    op: string
  ): Chroma.Color;
  export function roundColorComps(
    color: Chroma.Color,
    space?: string
  ): Chroma.Color;
  export function getColorSpaceParamsValidRanges(space: string): number[][];
  export function isColor(value): boolean;
  export function formatColor(
    color: Chroma.Color,
    appendName?: boolean
  ): string;
  export function colorFromWavelength(wl: number): Chroma.Color;
  export function throwError(error: string, loc?: Loc): void;
  export function getType(value): ValueType;
  export function forceType(value, type: ValueType | ValueType[], loc?: Loc);
  export function forceRange(value, loc?: Loc): number[];
  export function cloneValue(value);
  export function forceNumInRange(
    value: number,
    range: number[],
    loc?: Loc
  ): number;
  export function forceNumInRange(
    value: number,
    min: number,
    max: number,
    loc?: Loc
  ): number;
  export function getObjKey(obj: object, value): string | undefined;
}

export interface EvaluateOptions {
  evaluator?: EvaluatorBase;
  withAst?: boolean;
  astWithLocs?: boolean;
}

export interface EvaluateResult {
  withAst?: boolean;
  astWithLocs?: boolean;
  expr: string;
  program: Nodes.Program;
  result;
  resultStr: string;
  astStr: string;
  error: string;
}

export declare function evaluate(
  expr: string,
  options?: EvaluateOptions
): EvaluateResult;
