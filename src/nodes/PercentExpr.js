import {Expr} from './Expr.js';

export class PercentExpr extends Expr {
  constructor(value, $loc) {
    super('percent', $loc);

    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalPercent(this);
  }
}
