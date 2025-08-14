import {Expr} from './Expr.js';

export class RandomColorExpr extends Expr {
  constructor($loc) {
    super('randomColor', $loc);
  }

  _evaluateInternal(e) {
    return e.evalRandomColor(this);
  }
}
