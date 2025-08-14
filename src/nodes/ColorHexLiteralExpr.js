import {Expr} from './Expr.js';

export class ColorHexLiteralExpr extends Expr {
  constructor(value, $loc) {
    super('colorHexLiteral', $loc);

    this.value = value;
  }

  _evaluateInternal(e) {
    return e.evalColorHexLiteral(this);
  }
}
