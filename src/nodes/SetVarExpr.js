import Expr from "./Expr"

export default class SetVarExpr extends Expr {
    constructor(name, value, $loc) {
        super("setVar", $loc)

        this.name = name
        this.value = value
    }

    _evaluateInternal(e) {
        return e.evalSetVar(this)
    }
}
