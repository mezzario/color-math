import {Expr} from './Expr.js';

export class GetVarExpr extends Expr {
  constructor(name, $loc) {
    super('getVar', $loc);

    this.name = name;
  }

  _evaluateInternal(e) {
    return e.evalGetVar(this);
  }
}
