import {OperationExpr} from './OperationExpr.js';

export class UnaryExpr extends OperationExpr {
  constructor(value, operator, options, $loc) {
    super('unary', operator, options, $loc);

    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalUnaryOperation(this);
  }
}
