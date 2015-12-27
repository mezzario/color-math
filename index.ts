var _ = require("lodash") as _.LoDashStatic;
import * as ParserScope from "./src/parser-scope";
import { ColorScale, Evaluator, CoreEvaluator } from "./src/eval-scope";
import { LessEvaluator } from "./src/less-evaluator";
import * as Utils from "./src/utils";

let getParser = (() => {
    let parser;

    return () => {
        if (!parser) {
            parser = require("./src/parser").parser;
            parser.yy = ParserScope;
        }
        return parser;
    };
})();

export function parse(s: string) {
    let parser = getParser();
    let program = <ParserScope.Program>parser.parse(s);
    return program;
}

export enum EvaluatorType {
    Core,
    Less,
}

var _evaluators: { [key: string]: Evaluator; } = {};

export function getEvaluator(type: EvaluatorType) {
    let typeStr = EvaluatorType[type];
    let evaluator = _evaluators[typeStr];

    if (!evaluator) {
        switch (type) {
            case EvaluatorType.Core: evaluator = new CoreEvaluator(); break;
            case EvaluatorType.Less: evaluator = new LessEvaluator(); break;
            default: throw "invalid evaluator type";
        }
    }

    _evaluators[typeStr] = evaluator;

    return evaluator;
}

export interface EvaluateOptions {
    evalType?: EvaluatorType;
    withAst?: boolean;
    astWithLocs?: boolean;
}

export interface EvaluateResult {
    evalOptions: EvaluateOptions;
    expr: string;
    program: ParserScope.Program;
    result;
    resultStr: string;
    astStr: string;
    error: string;
}

export function evaluate(expr: string, options?: EvaluateOptions) {
    options = _.merge(<EvaluateOptions>{
        evalType: EvaluatorType.Core,
        withAst: false,
        astWithLocs: false
    }, options);

    let program: ParserScope.Program;
    let value;
    let error: Error;

    try {
        program = parse(expr);

        let evaluator = getEvaluator(options.evalType);
        value = program.evaluate(evaluator);
    }
    catch (e) {
        error = e;
    }

    return <EvaluateResult>{
        evalOptions: options,
        expr: expr,
        program: program,
        result: error != null ? null : value,
        resultStr: error != null ? null : formatValue(value),
        astStr: error != null || !options.withAst || !program ? null : JSON.stringify(program.getDto(options.astWithLocs), null, "  "),
        error: error != null ? String(error) : null
    };
}

function formatValue(value) {
    if (Utils.isColor(value))
        return Utils.formatColor(value);
    else if (typeof value === "number") {
        let s = value % 1 === 0 ? String(value) : value.toFixed(4).replace(/0+$/, "");
        return s;
    }
    else if (typeof value === "string")
        return value;
    else if (_.isArray(value)) {
        let s = "[";
        for (let i = 0; i < value.length; i++)
            s += formatValue(value[i]) + (i < value.length - 1 ? ", " : "");
        s += "]";
        return s;
    }
    else if (value instanceof ColorScale)
        return String(value);
    else
        return JSON.stringify(value, null, "  ");
}

export {
    ParserScope,
    ColorScale,
    Evaluator,
    CoreEvaluator,
    LessEvaluator,
    Utils
};
