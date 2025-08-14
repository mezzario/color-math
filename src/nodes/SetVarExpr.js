import {Expr} from './Expr.js';

export class SetVarExpr extends Expr {
  constructor(name, value, $loc) {
    super('setVar', $loc);

    this.name = name;
    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalSetVar(this);
  }
}
