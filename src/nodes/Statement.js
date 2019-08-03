import Node from './Node'

export default class Statement extends Node {
  constructor(expr, $loc) {
    super('statement', $loc)

    this.expr = expr
  }

  getDto(withLoc = true) {
    const dto = super.getDto(withLoc)
    delete dto.$eval
    return dto
  }

  _evaluateInternal(e) {
    return e.evalStatement(this)
  }
}
