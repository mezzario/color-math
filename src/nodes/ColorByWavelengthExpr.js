import Expr from './Expr';

export default class ColorByWavelengthExpr extends Expr {
  constructor(value, $loc) {
    super('colorByWavelength', $loc);

    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalColorByWavelength(this);
  }
}
