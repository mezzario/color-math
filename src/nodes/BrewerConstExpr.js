import Expr from "./Expr"

export default class BrewerConstExpr extends Expr {
    constructor(name, $loc) {
        super("brewerConst", $loc)

        this.name = name
    }

    _evaluateInternal(e) {
        return e.evalBrewerConst(this)
    }
}
