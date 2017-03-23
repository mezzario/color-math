import ParamExpr from "./ParamExpr"

export default class SetParamExpr extends ParamExpr {
    constructor(obj, name, value, operator, $loc) {
        super("setParam", obj, name, value, operator, $loc)
    }
}
