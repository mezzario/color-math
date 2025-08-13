import Expr from './Expr';

export default class NumberLiteralExpr extends Expr {
  constructor(value, $loc) {
    super('numberLiteral', $loc);

    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalNumberLiteral(this);
  }
}
