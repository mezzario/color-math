import {ParamExpr} from './ParamExpr.js';

export class SetParamExpr extends ParamExpr {
  constructor(obj, name, value, operator, $loc) {
    super('setParam', obj, name, value, operator, $loc);
  }
}
