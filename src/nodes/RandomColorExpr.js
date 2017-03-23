import Expr from "./Expr"

export default class RandomColorExpr extends Expr {
    constructor($loc) {
        super("randomColor", $loc)
    }

    _evaluateInternal(e) {
        return e.evalRandomColor(this)
    }
}
