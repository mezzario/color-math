import {Expr} from './Expr.js';

export class NumberLiteralExpr extends Expr {
  constructor(value, $loc) {
    super('numberLiteral', $loc);

    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalNumberLiteral(this);
  }
}
