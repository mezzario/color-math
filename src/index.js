import * as Utils from './utils';
import * as Evaluators from './evaluators';
import * as Nodes from './nodes';
import * as Parser from './parser';
import ColorScale from './ColorScale';
import ValueType from './ValueType';
import BlendMode from './BlendMode';

Parser.parser.yy = Nodes;

export function evaluate(expr, options) {
  options = Object.assign(
    {
      evaluator: Evaluators.CoreEvaluator.instance,
      withAst: false,
      astWithLocs: false,
    },
    options
  );

  let program;
  let value;
  let error;

  try {
    program = Parser.parse(expr);
    value = program.evaluate(options.evaluator);
  } catch (e) {
    error = e.message || String(e);
  }

  return {
    withAst: options.withAst,
    astWithLocs: options.astWithLocs,
    evaluator: options.evaluator.$type,
    expr,
    program,
    result: error != null ? null : value,
    resultStr: error != null ? null : formatValue(value),
    astStr:
      error != null || !options.withAst || !program
        ? null
        : JSON.stringify(program.getDto(options.astWithLocs), null, '  '),
    error: error != null ? error : null,
  };
}

function formatValue(value) {
  if (Utils.isColor(value)) {
    return Utils.formatColor(value);
  } else if (typeof value === 'number') {
    const s =
      value % 1 === 0 ? String(value) : value.toFixed(4).replace(/0+$/, '');
    return s;
  } else if (typeof value === 'string') {
    return value;
  } else if (Array.isArray(value)) {
    let s = '[';
    for (let i = 0; i < value.length; i++) {
      s += formatValue(value[i]) + (i < value.length - 1 ? ', ' : '');
    }
    s += ']';
    return s;
  } else if (value instanceof ColorScale) {
    return String(value);
  } else {
    return JSON.stringify(value, null, '  ');
  }
}

export { Nodes, Evaluators, ColorScale, BlendMode, ValueType, Utils };
