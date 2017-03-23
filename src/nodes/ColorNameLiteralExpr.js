import Expr from "./Expr"

export default class ColorNameLiteralExpr extends Expr {
    constructor(value, $loc) {
        super("colorNameLiteral", $loc)

        this.value = value
    }

    _evaluateInternal(e) {
        return e.evalColorNameLiteral(this)
    }
}
