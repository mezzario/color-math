import OperationExpr from './OperationExpr';

export default class UnaryExpr extends OperationExpr {
  constructor(value, operator, options, $loc) {
    super('unary', operator, options, $loc);

    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalUnaryOperation(this);
  }
}
