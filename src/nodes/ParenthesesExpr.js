import {Expr} from './Expr.js';

export class ParenthesesExpr extends Expr {
  constructor(expr, $loc) {
    super('parentheses', $loc);

    this.expr = expr;
  }

  _evaluateInternal(e) {
    return e.evalParentheses(this);
  }
}
