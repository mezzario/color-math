import {Expr} from './Expr.js';

export class OperationExpr extends Expr {
  constructor($type, operator, options, $loc) {
    super(`operation.${$type}`, $loc);

    this.operator = operator;
    this.options = options;
  }
}
