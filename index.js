var _ = require("lodash");
var ParserScope = require("./src/parser-scope");
exports.ParserScope = ParserScope;
var eval_scope_1 = require("./src/eval-scope");
exports.ColorScale = eval_scope_1.ColorScale;
exports.Evaluator = eval_scope_1.Evaluator;
exports.CoreEvaluator = eval_scope_1.CoreEvaluator;
var less_evaluator_1 = require("./src/less-evaluator");
exports.LessEvaluator = less_evaluator_1.LessEvaluator;
var Utils = require("./src/utils");
exports.Utils = Utils;
var getParser = (function () {
    var parser;
    return function () {
        if (!parser) {
            parser = require("./src/parser").parser;
            parser.yy = ParserScope;
        }
        return parser;
    };
})();
function parse(s) {
    var parser = getParser();
    var program = parser.parse(s);
    return program;
}
exports.parse = parse;
(function (EvaluatorType) {
    EvaluatorType[EvaluatorType["Core"] = 0] = "Core";
    EvaluatorType[EvaluatorType["Less"] = 1] = "Less";
})(exports.EvaluatorType || (exports.EvaluatorType = {}));
var EvaluatorType = exports.EvaluatorType;
var _evaluators = {};
function getEvaluator(type) {
    var typeStr = EvaluatorType[type];
    var evaluator = _evaluators[typeStr];
    if (!evaluator) {
        switch (type) {
            case EvaluatorType.Core:
                evaluator = new eval_scope_1.CoreEvaluator();
                break;
            case EvaluatorType.Less:
                evaluator = new less_evaluator_1.LessEvaluator();
                break;
            default: throw "invalid evaluator type";
        }
    }
    _evaluators[typeStr] = evaluator;
    return evaluator;
}
exports.getEvaluator = getEvaluator;
function evaluate(expr, options) {
    options = _.merge({
        evalType: EvaluatorType.Core,
        withAst: false,
        astWithLocs: false
    }, options);
    var program;
    var value;
    var error;
    try {
        program = parse(expr);
        var evaluator = getEvaluator(options.evalType);
        value = program.evaluate(evaluator);
    }
    catch (e) {
        error = e;
    }
    return {
        expr: expr,
        program: program,
        result: error != null ? null : value,
        resultStr: error != null ? null : formatValue(value),
        astStr: error != null || !options.withAst || !program ? null : JSON.stringify(program.getDto(options.astWithLocs), null, "  "),
        error: error != null ? String(error) : null
    };
}
exports.evaluate = evaluate;
function formatValue(value) {
    if (Utils.isColor(value))
        return Utils.formatColor(value);
    else if (typeof value === "number") {
        var s = value % 1 === 0 ? String(value) : value.toFixed(4).replace(/0+$/, "");
        return s;
    }
    else if (typeof value === "string")
        return value;
    else if (_.isArray(value)) {
        var s = "[";
        for (var i = 0; i < value.length; i++)
            s += formatValue(value[i]) + (i < value.length - 1 ? ", " : "");
        s += "]";
        return s;
    }
    else if (value instanceof eval_scope_1.ColorScale)
        return String(value);
    else
        return JSON.stringify(value, null, "  ");
}
//# sourceMappingURL=index.js.map