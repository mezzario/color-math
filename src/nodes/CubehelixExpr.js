import Expr from './Expr';

export default class CubehelixExpr extends Expr {
  constructor($loc) {
    super('cubehelix', $loc);
  }

  _evaluateInternal(e) {
    return e.evalCubehelix(this);
  }
}
