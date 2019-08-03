import OperationExpr from './OperationExpr'

export default class BinaryExpr extends OperationExpr {
  constructor(left, right, operator, options, $loc) {
    super('binary', operator, options, $loc)

    this.left = left
    this.right = right
  }

  _evaluateInternal(e) {
    return e.evalBinaryOperation(this)
  }
}
