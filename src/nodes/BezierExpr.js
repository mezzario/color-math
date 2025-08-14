import {Expr} from './Expr.js';

export class BezierExpr extends Expr {
  constructor(colors, $loc) {
    super('bezier', $loc);

    this.colors = colors;
  }

  _evaluateInternal(e) {
    return e.evalBezier(this);
  }
}
