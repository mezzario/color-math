import Expr from './Expr'

export default class ColorByTemperatureExpr extends Expr {
  constructor(value, $loc) {
    super('colorByTemperature', $loc)

    this.value = value
  }

  _evaluateInternal(e) {
    return e.evalColorByTemperature(this)
  }
}
