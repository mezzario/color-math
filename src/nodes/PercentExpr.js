import Expr from './Expr';

export default class PercentExpr extends Expr {
  constructor(value, $loc) {
    super('percent', $loc);

    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalPercent(this);
  }
}
