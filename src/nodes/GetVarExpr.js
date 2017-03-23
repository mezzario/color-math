import Expr from "./Expr"

export default class GetVarExpr extends Expr {
    constructor(name, $loc) {
        super("getVar", $loc)

        this.name = name
    }

    _evaluateInternal(e) {
        return e.evalGetVar(this)
    }
}
