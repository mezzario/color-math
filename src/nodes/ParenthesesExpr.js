import Expr from './Expr'

export default class ParenthesesExpr extends Expr {
  constructor(expr, $loc) {
    super('parentheses', $loc)

    this.expr = expr
  }

  _evaluateInternal(e) {
    return e.evalParentheses(this)
  }
}
