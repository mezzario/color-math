import Expr from './Expr';

export default class ArrayLiteralExpr extends Expr {
  constructor(value, $loc) {
    super('arrayLiteral', $loc);

    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalArrayLiteral(this);
  }
}
