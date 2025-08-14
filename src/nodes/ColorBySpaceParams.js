import {Expr} from './Expr.js';

export class ColorBySpaceParams extends Expr {
  constructor(space, params, $loc) {
    super('colorBySpaceParams', $loc);

    this.space = space;
    this.params = params;
  }

  _evaluateInternal(e) {
    return e.evalColorBySpaceParams(this);
  }
}
