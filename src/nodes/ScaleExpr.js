import {Expr} from './Expr.js';

export class ScaleExpr extends Expr {
  constructor(colors, domain, mode, $loc) {
    super('scale', $loc);

    this.colors = colors;
    this.domain = domain;
    this.mode = mode;
  }

  _evaluateInternal(e) {
    return e.evalScale(this);
  }
}
