import EvaluatorBase from './EvaluatorBase'
import * as Utils from '../utils'
import BlendMode from '../BlendMode'
import {PercentExpr, NumberLiteralExpr} from '../nodes'
import CoreEvaluator from './CoreEvaluator'

export default class LessEvaluator extends EvaluatorBase {
  constructor() {
    super('less')
  }

  get core() {
    return CoreEvaluator.instance
  }

  evalProgram(node) {
    // do core evaluation to perform all necessary validations
    this.core.evalProgram(node)

    const value = node.statements.length > 1
      ? node.statements.map(st => `${st.evaluate(this)};`).join('\n')
      : node.statements[0].evaluate(this)

    return value
  }

  evalStatement(node) {
    const value = node.expr.evaluate(this)

    return value
  }

  evalParentheses(node) {
    const value = `(${node.expr.evaluate(this)})`

    return value
  }

  evalNumberLiteral(node) {
    const n = this.core.evalNumberLiteral(node)
    const value = n % 1 === 0 ? n : n.toFixed(8).replace(/0+$/, '')

    return value
  }

  evalPercent(node) {
    const value = `${node.value.evaluate(this)}%`

    return value
  }

  evalArrayLiteral(node) {
    const value = node.value.map(expr => expr.evaluate(this)).join(' ')

    return value
  }

  evalArrayElement(node) {
    const value = `extract(${this._unwrapParens(node.obj).evaluate(this)}, ${node.name + 1})`

    return value
  }

  evalColorNameLiteral(node) {
    const value = node.value

    return value
  }

  evalColorHexLiteral(node) {
    const value = (!node.value.match(/^#/) ? '#' : '') + node.value

    return value
  }

  evalColorByNumber(node) {
    Utils.throwError('defining color by number is not supported by LESS', node.$loc)
  }

  evalColorByTemperature(node) {
    Utils.throwError('defining color by temperature is not supported by LESS', node.$loc)
  }

  evalColorByWavelength(node) {
    Utils.throwError('defining color by wavelength is not supported by LESS', node.$loc)
  }

  evalColorBySpaceParams(node) {
    const params = node.params.map(expr => expr.evaluate(this))
    const alpha = params.length > (node.space === 'cmyk' ? 4 : 3)
    let value = void 0

    switch (node.space) {
      case 'argb':
        value = `${node.space}(${params.join(', ')})`
        break

      case 'rgb':
      case 'hsl':
      case 'hsv':
        value = `${node.space + (alpha ? 'a' : '')}(${params.join(', ')})`
        break

      default: this._unspColorSpace(node.space, node.$loc)
    }

    return value
  }

  evalRandomColor(/*node*/) {
    //return "~`(function(){for(var i=0,c='#',m=Math;i<6;i++)c+='0123456789ABCDEF'[m.floor(m.random()*16)];return c;})()`"
    return '~"#`(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)`"'
  }

  evalScale(node)     { this._unspColorScale(node.$loc) }
  evalBezier(node)    { this._unspColorScale(node.$loc) }
  evalCubehelix(node) { this._unspColorScale(node.$loc) }

  evalBrewerConst(node) {
    const coreValue = this.core.evalBrewerConst(node)
    const value = coreValue.map(c => c.hex()).join(' ')

    return value
  }

  evalUnaryMinus(node) {
    const value = `-${node.value.evaluate(this)}`

    return value
  }

  evalColorInverse(node) {
    const value = `(#fff - ${node.value.evaluate(this)})`

    return value
  }

  evalCorrectLightness(node) {
    this._unspColorScale(node.$loc)
  }

  evalNumbersAddition(node)       { return this._arithmeticOp(node) }
  evalNumbersSubtraction(node)    { return this._arithmeticOp(node) }
  evalNumbersMultiplication(node) { return this._arithmeticOp(node) }
  evalNumbersDivision(node)       { return this._arithmeticOp(node) }

  evalColorAndNumberAddition(node)       { return this._arithmeticOp(node) }
  evalColorAndNumberSubtraction(node)    { return this._arithmeticOp(node) }
  evalColorAndNumberMultiplication(node) { return this._arithmeticOp(node) }
  evalColorAndNumberDivision(node)       { return this._arithmeticOp(node) }

  evalNumberPower(node) {
    const left = this._unwrapParens(node.left).evaluate(this)
    const right = this._unwrapParens(node.right).evaluate(this)
    const value = `pow(${left}, ${right})`

    return value
  }

  evalColorsContrast(node) {
    Utils.throwError('calculating numeric contrast value is not supported by LESS', node.$loc)
  }

  evalColorsMix(node) {
    const params = [
      this._unwrapParens(node.left).evaluate(this),
      this._unwrapParens(node.right).evaluate(this),
    ]

    const ratioExpr = (node.options || {}).ratio
    if (ratioExpr) {
      params.push(this._toPercentage(ratioExpr))
    }

    const mode = (node.options || {}).mode
    if (mode && mode !== 'rgb') {
      Utils.throwError('LESS supports mixing colors only in RGB color space', node.$loc)
    }

    let func = 'mix'
    const leftColorStr = node.left.evaluate(this.core).hex('rgba').toLowerCase()

    if (leftColorStr === '#ffffffff') {
      params.shift()
      func = 'tint'
    } else if (leftColorStr === '#000000ff') {
      params.shift()
      func = 'shade'
    }

    const value = `${func}(${params.join(', ')})`

    return value
  }

  evalColorsFromScaleProduction(node) {
    this._unspColorScale(node.$loc)
  }

  evalColorDesaturate(node) { return this._funcOp(node.left, node.right, 'desaturate', true, true) }
  evalColorSaturate(node)   { return this._funcOp(node.left, node.right, 'saturate', true, true) }
  evalColorDarken(node)     { return this._funcOp(node.left, node.right, 'darken', true, true) }
  evalColorLighten(node)    { return this._funcOp(node.left, node.right, 'lighten', true, true) }

  evalAddBlend(node)        { return this._arithmeticOp(node) }
  evalSubtractBlend(node)   { return this._arithmeticOp(node) }
  evalMultiplyBlend(node)   { return this._funcOp(node.left, node.right, 'multiply') }
  evalDivideBlend(node)     { return this._arithmeticOp(node) }
  evalColorBurnBlend(node)  { return this._unspColorBlend(BlendMode.ColorBurn, node.$loc) }
  evalColorDodgeBlend(node) { return this._unspColorBlend(BlendMode.ColorDodge, node.$loc) }
  evalDarkenBlend(node)     { return this._unspColorBlend(BlendMode.Darken, node.$loc) }
  evalLightenBlend(node)    { return this._unspColorBlend(BlendMode.Lighten, node.$loc) }
  evalScreenBlend(node)     { return this._funcOp(node.left, node.right, 'screen') }
  evalOverlayBlend(node)    { return this._funcOp(node.left, node.right, 'overlay') }
  evalHardLightBlend(node)  { return this._funcOp(node.left, node.right, 'hardlight') }
  evalSoftLightBlend(node)  { return this._funcOp(node.left, node.right, 'softlight') }
  evalDifferenceBlend(node) { return this._funcOp(node.left, node.right, 'difference') }
  evalExclusionBlend(node)  { return this._funcOp(node.left, node.right, 'exclusion') }
  evalNegateBlend(node)     { return this._funcOp(node.left, node.right, 'negation') }

  evalManageColorNumber(node) {
    Utils.throwError('defining color by number is not supported by LESS', node.$loc)
  }

  evalManageColorTemperature(node) {
    Utils.throwError('defining color by temperature is not supported by LESS', node.$loc)
  }

  evalManageColorLuminance(node) {
    let res = void 0

    if (node.value === void 0) {
      res = `luma(${this._unwrapParens(node.obj).evaluate(this)})`
    } else {
      Utils.throwError(`setting luminance is not supported by LESS`, node.$loc)
    }

    return res
  }

  evalManageColorAlpha(node) {
    let res = void 0

    if (node.value === void 0) {
      res = `alpha(${this._unwrapParens(node.obj).evaluate(this)})`
    } else {
      if (node.operator === '+') {
        res = this._funcOp(node.obj, node.value, 'fadein', true)
      } else if (node.operator === '-') {
        res = this._funcOp(node.obj, node.value, 'fadeout', true)
      } else if (!node.operator) {
        res = this._funcOp(node.obj, node.value, 'fade', true)
      } else {
        Utils.throwError(`assignment operator '${node.operator}=' for alpha channel is not supported by LESS`, node.$loc)
      }
    }

    return res
  }

  evalManageColorCompRgbR(node)  { return this._getColorCompOp(node, 'rgb', 'red') }
  evalManageColorCompRgbG(node)  { return this._getColorCompOp(node, 'rgb', 'green') }
  evalManageColorCompRgbB(node)  { return this._getColorCompOp(node, 'rgb', 'blue') }

  evalManageColorCompCmykC(node) { this._unspColorSpace('cmyk', node.$loc) }
  evalManageColorCompCmykM(node) { this._unspColorSpace('cmyk', node.$loc) }
  evalManageColorCompCmykY(node) { this._unspColorSpace('cmyk', node.$loc) }
  evalManageColorCompCmykK(node) { this._unspColorSpace('cmyk', node.$loc) }

  evalManageColorCompHslH(node)  { return this._getColorCompOp(node, 'hsl', 'hue') }
  evalManageColorCompHslS(node)  { return this._getColorCompOp(node, 'hsl', 'saturation') }
  evalManageColorCompHslL(node)  { return this._getColorCompOp(node, 'hsl', 'lightness') }

  evalManageColorCompHsvH(node)  { return this._getColorCompOp(node, 'hsv', 'hsvhue') }
  evalManageColorCompHsvS(node)  { return this._getColorCompOp(node, 'hsv', 'hsvsaturation') }
  evalManageColorCompHsvV(node)  { return this._getColorCompOp(node, 'hsv', 'hsvvalue') }

  evalManageColorCompHsiH(node)  { this._unspColorSpace('hsi', node.$loc) }
  evalManageColorCompHsiS(node)  { this._unspColorSpace('hsi', node.$loc) }
  evalManageColorCompHsiI(node)  { this._unspColorSpace('hsi', node.$loc) }

  evalManageColorCompLabL(node)  { this._unspColorSpace('lab', node.$loc) }
  evalManageColorCompLabA(node)  { this._unspColorSpace('lab', node.$loc) }
  evalManageColorCompLabB(node)  { this._unspColorSpace('lab', node.$loc) }

  evalManageColorCompLchL(node)  { this._unspColorSpace('lch', node.$loc) }
  evalManageColorCompLchC(node)  { this._unspColorSpace('lch', node.$loc) }
  evalManageColorCompLchH(node)  { this._unspColorSpace('lch', node.$loc) }

  evalSetColorScalePadding(node)  { this._unspColorScale(node.$loc) }
  evalSetScaleDomain(node)        { this._unspColorScale(node.$loc) }
  evalSetCubehelixStart(node)     { this._unspColorScale(node.$loc) }
  evalSetCubehelixRotations(node) { this._unspColorScale(node.$loc) }
  evalSetCubehelixHue(node)       { this._unspColorScale(node.$loc) }
  evalSetCubehelixGamma(node)     { this._unspColorScale(node.$loc) }
  evalSetCubehelixLightness(node) { this._unspColorScale(node.$loc) }

  evalGetVar(node) {
    const value = `@${node.name.replace(/^\$/, '')}`

    return value
  }

  evalSetVar(node) {
    const value = `@${node.name.replace(/^\$/, '')}: ${node.value.evaluate(this)}`

    return value
  }

  _arithmeticOp(node) {
    const left = node.left.evaluate(this)
    const right = node.right.evaluate(this)
    const value = `${left} ${node.operator} ${right}`

    return value
  }

  _toPercentage(node) {
    const value = node.evaluate(this)
    let res

    if (node instanceof PercentExpr) {
      res = value
    } else if (node instanceof NumberLiteralExpr) {
      res = this.core.evalNumberLiteral(node) * 100 + '%'
    } else {
      res = `percentage(${value})`
    }

    return res
  }

  _funcOp(nodeLeft, nodeRight, func, rightIsPercentage = false, relative = false) {
    const params = [
      this._unwrapParens(nodeLeft).evaluate(this),
      rightIsPercentage ? this._toPercentage(nodeRight) : nodeRight.evaluate(this),
    ]

    if (relative) {
      params.push('relative')
    }

    const value = `${func}(${params.join(', ')})`
    return value
  }

  _getColorCompOp(node, space, func) {
    if (node.value === void 0) {
      const res = `${func}(${node.obj.evaluate(this)})`
      return res
    } else {
      Utils.throwError(`setting components in ${space.toUpperCase()} color space is not supported by LESS`, node.$loc)
    }
  }

  _unspColorScale(loc) {
    Utils.throwError('color scales are not supported by LESS', loc)
  }

  _unspColorSpace(space, loc) {
    Utils.throwError(`color space '${space.toUpperCase() }' is not supported by LESS`, loc)
  }

  _unspColorBlend(mode, loc) {
    Utils.throwError(`'${Utils.getObjKey(BlendMode, mode)}' blending function is not supported by LESS`, loc)
  }
}
