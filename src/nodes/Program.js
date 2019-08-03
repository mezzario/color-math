import Node from './Node'

export default class Program extends Node {
  constructor(statements, $loc) {
    super('program', $loc)

    this.statements = statements
  }

  getDto(withLoc = true) {
    const dto = super.getDto(withLoc)
    delete dto.$eval
    return dto
  }

  _evaluateInternal(e) {
    return e.evalProgram(this)
  }
}
