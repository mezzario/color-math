import {Expr} from './Expr.js';

export class CubehelixExpr extends Expr {
  constructor($loc) {
    super('cubehelix', $loc);
  }

  _evaluateInternal(e) {
    return e.evalCubehelix(this);
  }
}
