import {isColor, formatColor} from './utils.js';
import {EvaluatorBase} from './evaluators/EvaluatorBase.js';
import {CoreEvaluator} from './evaluators/CoreEvaluator.js';
import {LessEvaluator} from './evaluators/LessEvaluator.js';
import {parser} from './parser.js';
import {ColorScale} from './ColorScale.js';
import {ValueType} from './ValueType.js';
import {BlendMode} from './BlendMode.js';

import {ArrayLiteralExpr} from './nodes/ArrayLiteralExpr.js';
import {BezierExpr} from './nodes/BezierExpr.js';
import {BinaryExpr} from './nodes/BinaryExpr.js';
import {BrewerConstExpr} from './nodes/BrewerConstExpr.js';
import {ColorByNumberExpr} from './nodes/ColorByNumberExpr.js';
import {ColorBySpaceParams} from './nodes/ColorBySpaceParams.js';
import {ColorByTemperatureExpr} from './nodes/ColorByTemperatureExpr.js';
import {ColorByWavelengthExpr} from './nodes/ColorByWavelengthExpr.js';
import {ColorHexLiteralExpr} from './nodes/ColorHexLiteralExpr.js';
import {ColorNameLiteralExpr} from './nodes/ColorNameLiteralExpr.js';
import {CubehelixExpr} from './nodes/CubehelixExpr.js';
import {Expr} from './nodes/Expr.js';
import {GetParamExpr} from './nodes/GetParamExpr.js';
import {GetVarExpr} from './nodes/GetVarExpr.js';
import {Loc} from './nodes/Loc.js';
import {LocPos} from './nodes/LocPos.js';
import {Node} from './nodes/Node.js';
import {NumberLiteralExpr} from './nodes/NumberLiteralExpr.js';
import {OperationExpr} from './nodes/OperationExpr.js';
import {ParamExpr} from './nodes/ParamExpr.js';
import {ParenthesesExpr} from './nodes/ParenthesesExpr.js';
import {PercentExpr} from './nodes/PercentExpr.js';
import {Program} from './nodes/Program.js';
import {RandomColorExpr} from './nodes/RandomColorExpr.js';
import {ScaleExpr} from './nodes/ScaleExpr.js';
import {SetParamExpr} from './nodes/SetParamExpr.js';
import {SetVarExpr} from './nodes/SetVarExpr.js';
import {Statement} from './nodes/Statement.js';
import {UnaryExpr} from './nodes/UnaryExpr.js';

const Nodes = {
  ArrayLiteralExpr,
  BezierExpr,
  BinaryExpr,
  BrewerConstExpr,
  ColorByNumberExpr,
  ColorBySpaceParams,
  ColorByTemperatureExpr,
  ColorByWavelengthExpr,
  ColorHexLiteralExpr,
  ColorNameLiteralExpr,
  CubehelixExpr,
  Expr,
  GetParamExpr,
  GetVarExpr,
  Loc,
  LocPos,
  Node,
  NumberLiteralExpr,
  OperationExpr,
  ParamExpr,
  ParenthesesExpr,
  PercentExpr,
  Program,
  RandomColorExpr,
  ScaleExpr,
  SetParamExpr,
  SetVarExpr,
  Statement,
  UnaryExpr,
};

parser.yy = Nodes;

export function evaluate(expr, options) {
  options = Object.assign(
    {
      evaluator: CoreEvaluator.instance,
      withAst: false,
      astWithLocs: false,
    },
    options
  );

  let program;
  let value;
  let error;

  try {
    program = parser.parse(expr);
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
  if (isColor(value)) {
    return formatColor(value);
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

export {
  Nodes,
  EvaluatorBase,
  CoreEvaluator,
  LessEvaluator,
  ColorScale,
  BlendMode,
  ValueType,
};
