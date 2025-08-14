import {ArrayLiteralExpr} from './ArrayLiteralExpr.js';
import {BezierExpr} from './BezierExpr.js';
import {BinaryExpr} from './BinaryExpr.js';
import {BrewerConstExpr} from './BrewerConstExpr.js';
import {ColorByNumberExpr} from './ColorByNumberExpr.js';
import {ColorBySpaceParams} from './ColorBySpaceParams.js';
import {ColorByTemperatureExpr} from './ColorByTemperatureExpr.js';
import {ColorByWavelengthExpr} from './ColorByWavelengthExpr.js';
import {ColorHexLiteralExpr} from './ColorHexLiteralExpr.js';
import {ColorNameLiteralExpr} from './ColorNameLiteralExpr.js';
import {CubehelixExpr} from './CubehelixExpr.js';
import {Expr} from './Expr.js';
import {GetParamExpr} from './GetParamExpr.js';
import {GetVarExpr} from './GetVarExpr.js';
import {Loc} from './Loc.js';
import {LocPos} from './LocPos.js';
import {Node} from './Node.js';
import {NumberLiteralExpr} from './NumberLiteralExpr.js';
import {OperationExpr} from './OperationExpr.js';
import {ParamExpr} from './ParamExpr.js';
import {ParenthesesExpr} from './ParenthesesExpr.js';
import {PercentExpr} from './PercentExpr.js';
import {Program} from './Program.js';
import {RandomColorExpr} from './RandomColorExpr.js';
import {ScaleExpr} from './ScaleExpr.js';
import {SetParamExpr} from './SetParamExpr.js';
import {SetVarExpr} from './SetVarExpr.js';
import {Statement} from './Statement.js';
import {UnaryExpr} from './UnaryExpr.js';

// Export individual classes for named imports
export {
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

// Export object with all nodes for parser.yy assignment
export const Nodes = {
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
