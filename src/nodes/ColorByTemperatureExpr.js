import {Expr} from './Expr.js';

export class ColorByTemperatureExpr extends Expr {
  constructor(value, $loc) {
    super('colorByTemperature', $loc);

    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalColorByTemperature(this);
  }
}
