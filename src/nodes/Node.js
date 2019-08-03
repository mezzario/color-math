import cloneDeepWith from 'lodash.clonedeepwith'
import * as Utils from '../utils'
import Loc from './Loc'
import ColorScale from '../ColorScale'

export default class Node {
  constructor($type, $loc) {
    this.$type = $type

    if ($loc) {this.$loc = $loc instanceof Loc ? $loc : new Loc($loc)}
  }

  getDto(withLoc = true) {
    const dto = cloneDeepWith(this, obj => {
      if (obj !== this) {
        if (obj instanceof Node) {
          return obj.getDto(withLoc)
        } else if (obj instanceof Loc) {
          return this.$loc.toString()
        } else if (Utils.isColor(obj)) {
          return Utils.formatColor(obj)
        } else if (obj instanceof ColorScale) {
          return String(obj)
        }
      }
    })

    if (!withLoc) {delete dto.$loc}

    return dto
  }

  evaluate(e) {
    //if (this.$eval === void 0) {
    const value = this._evaluateInternal(e)
    if (value == null) {
      Utils.throwError(`evaluation of '${this.$type}' is not supported by '${e.$type}'`, this.$loc)
    }

    this.$eval = value
    //}

    return this.$eval
  }

  _evaluateInternal(/*evaluator*/) {
    throw new Error('Not implemented')
  }
}
