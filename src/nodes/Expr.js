import Node from "./Node"

export default class Expr extends Node {
    constructor($type, $loc) {
        super(`expr.${$type}`, $loc)
    }
}
