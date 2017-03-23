import Expr from "./Expr"

export default class BezierExpr extends Expr {
    constructor(colors, $loc) {
        super("bezier", $loc)

        this.colors = colors
    }

    _evaluateInternal(e) {
        return e.evalBezier(this)
    }
}
