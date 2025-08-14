import {Expr} from './Expr.js';

export class BrewerConstExpr extends Expr {
  constructor(name, $loc) {
    super('brewerConst', $loc);

    this.name = name;
  }

  _evaluateInternal(e) {
    return e.evalBrewerConst(this);
  }
}
