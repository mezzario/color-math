/// <reference path="../typings/tsd.d.ts" />

var _ = require("lodash") as _.LoDashStatic;
import { throwError, isColor, formatColor } from "./utils";
import { ColorScale, Evaluator } from "./eval-scope";

export class LocPos {
    constructor(public ln: number, public col: number, public i: number) {
    }

    toString() {
        return `${this.ln}:${this.col},${this.i}`;
    }
}

export class Loc {
    start: LocPos;
    end: LocPos;

    constructor(loc) {
        this.start = new LocPos(loc.first_line, loc.first_column, loc.range[0]);
        this.end = new LocPos(loc.last_line, loc.last_column, loc.range[1]);
    }

    toString() {
        return `${this.start}..${this.end}`;
    }
}

export abstract class Node {
    protected $eval;

    constructor(public $type: string, public $loc: Loc) {
        if ($loc)
            this.$loc = $loc instanceof Loc ? $loc : new Loc($loc);
    }

    getDto(withLoc = true) {
        let clone: (value) => any;

        let transform = o => {
            if (o instanceof Node)
                return (<Node>o).getDto(withLoc);
            else if (o instanceof Loc)
                return this.$loc.toString();
            else if (isColor(o))
                return formatColor(o);
            else if (o instanceof ColorScale)
                return String(o);
        };

        clone = value => _.cloneDeep(value, o => o !== this ? transform(o) : void 0);

        let dto = <Node>clone(this);

        if (!withLoc)
            delete dto.$loc;

        return <any>dto;
    }

    evaluate(e: Evaluator) {
        //if (this.$eval === void 0) {
            let value = this.evaluateInternal(e);
            if (value == null)
                throwError(`evaluation of '${this.$type}' is not supported by '${e.$type}'`, this.$loc);

            this.$eval = value;
        //}

        return this.$eval;
    }

    protected abstract evaluateInternal(evaluator: Evaluator);
}

export class Program extends Node {
    constructor(public statements: Statement[], $loc?) {
        super("program", $loc);
    }

    getDto(withLoc = true) {
        let dto = <Program>super.getDto(withLoc);
        delete dto.$eval;
        return <any>dto;
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalProgram(this);
    }
}

export class Statement extends Node {
    constructor(public expr: Expr, $loc?) {
        super("statement", $loc);
    }

    getDto(withLoc = true) {
        let dto = <Statement>super.getDto(withLoc);
        delete dto.$eval;
        return <any>dto;
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalStatement(this);
    }
}

export abstract class Expr extends Node {
    constructor($type: string, $loc?) {
        super(`expr.${$type}`, $loc);
    }
}

export class ParenthesesExpr extends Expr {
    constructor(public expr: Expr, $loc?) {
        super("parentheses", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalParentheses(this);
    }
}

export class NumberLiteralExpr extends Expr {
    constructor(public value: string, $loc?) {
        super("numberLiteral", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalNumberLiteral(this);
    }
}

export class PercentExpr extends Expr {
    constructor(public value: NumberLiteralExpr, $loc?) {
        super("percent", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalPercent(this);
    }
}

export class ArrayLiteralExpr extends Expr {
    constructor(public value: Expr[], $loc?) {
        super("arrayLiteral", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalArrayLiteral(this);
    }
}

export class ColorNameLiteralExpr extends Expr {
    constructor(public value: string, $loc?) {
        super("colorNameLiteral", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalColorNameLiteral(this);
    }
}

export class ColorHexLiteralExpr extends Expr {
    constructor(public value: string, $loc?) {
        super("colorHexLiteral", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalColorHexLiteral(this);
    }
}

export class ColorByNumberExpr extends Expr {
    constructor(public value: Expr, $loc?) {
        super("colorByNumber", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalColorByNumber(this);
    }
}

export class ColorByTemperatureExpr extends Expr {
    constructor(public value: Expr, $loc?) {
        super("colorByTemperature", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalColorByTemperature(this);
    }
}

export class ColorByWavelengthExpr extends Expr {
    constructor(public value: Expr, $loc?) {
        super("colorByWavelength", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalColorByWavelength(this);
    }
}

export class ColorBySpaceParams extends Expr {
    constructor(public space: string, public params: Expr[], $loc?) {
        super("colorBySpaceParams", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalColorBySpaceParams(this);
    }
}

export class RandomColorExpr extends Expr {
    constructor($loc?) {
        super("randomColor", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalRandomColor(this);
    }
}

export class ScaleExpr extends Expr {
    constructor(
        public colors: Expr | Expr[],
        public domain?: Expr[],
        public mode?: string,
        $loc?
    ) {
        super("scale", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalScale(this);
    }
}

export class BezierExpr extends Expr {
    constructor(public colors: Expr, $loc?) {
        super("bezier", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalBezier(this);
    }
}

export class CubehelixExpr extends Expr {
    constructor($loc?) {
        super("cubehelix", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalCubehelix(this);
    }
}

export class BrewerConstExpr extends Expr {
    constructor(public name: string, $loc?) {
        super("brewerConst", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalBrewerConst(this);
    }
}

export abstract class ParamExpr extends Expr {
    constructor(
        $type: string,
        public obj: Expr,
        public name: string,
        public value?: Expr,
        public operator?: string,
        $loc?
    ) {
        super($type, $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalParam(this);
    }
}

export class GetParamExpr extends ParamExpr {
    constructor(obj: Expr, name: string, $loc?) {
        super("getParam", obj, name, void 0, void 0, $loc);
    }
}

export class SetParamExpr extends ParamExpr {
    constructor(obj: Expr, name: string, value?: Expr, operator?: string, $loc?) {
        super("setParam", obj, name, value, operator, $loc);
    }
}

export abstract class OperationExpr extends Expr {
    constructor(
        $type: string,
        public operator: string,
        public options,
        $loc?
    ) {
        super(`operation.${$type}`, $loc);
    }
}

export class UnaryExpr extends OperationExpr {
    constructor(
        public value: Expr,
        public operator: string,
        public options,
        $loc?
    ) {
        super("unary", operator, options, $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalUnaryOperation(this);
    }
}

export class BinaryExpr extends OperationExpr {
    constructor(
        public left: Expr,
        public right: Expr,
        public operator: string,
        public options,
        $loc?
    ) {
        super("binary", operator, options, $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalBinaryOperation(this);
    }
}

export class GetVarExpr extends Expr {
    constructor(public name: string, $loc?) {
        super("getVar", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalGetVar(this);
    }
}

export class SetVarExpr extends Expr {
    constructor(public name: string, public value: Expr, $loc?) {
        super("setVar", $loc);
    }

    protected evaluateInternal(e: Evaluator) {
        return e.evalSetVar(this);
    }
}
