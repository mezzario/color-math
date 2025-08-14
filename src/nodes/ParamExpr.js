import {Expr} from './Expr.js';

export class ParamExpr extends Expr {
  constructor($type, obj, name, value, operator, $loc) {
    super($type, $loc);

    this.obj = obj;
    this.name = name;
    this.value = value;
    this.operator = operator;
  }

  _evaluateInternal(e) {
    return e.evalParam(this);
  }
}
