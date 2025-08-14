import {Expr} from './Expr.js';

export class ColorByNumberExpr extends Expr {
  constructor(value, $loc) {
    super('colorByNumber', $loc);

    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalColorByNumber(this);
  }
}
