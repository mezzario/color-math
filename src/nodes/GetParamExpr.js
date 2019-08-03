import ParamExpr from './ParamExpr'

export default class GetParamExpr extends ParamExpr {
  constructor(obj, name, $loc) {
    super('getParam', obj, name, void 0, void 0, $loc)
  }
}
