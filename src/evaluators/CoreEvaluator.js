import chroma from 'chroma-js';
import {EvaluatorBase} from './EvaluatorBase.js';
import {ColorScale} from '../ColorScale.js';
import {
  blendColors,
  cloneValue,
  cmyToCmykArray,
  colorArithmeticOp,
  colorFromWavelength,
  forceNumInRange,
  forceRange,
  forceType,
  getColorSpaceParamsValidRanges,
  inverseColor,
  throwError,
} from '../utils.js';
import {ValueType} from '../ValueType.js';
import {BlendMode} from '../BlendMode.js';

const VarOp = {
  Store: 0,
  Retrieve: 1,
  Delete: 2,
};

export class CoreEvaluator extends EvaluatorBase {
  constructor() {
    super('core');
  }

  static get instance() {
    return this._instance || (this._instance = new CoreEvaluator());
  }

  get core() {
    return this;
  }

  evalProgram(node) {
    const values = node.statements.map(st => st.evaluate(this));
    const value = values[values.length - 1];

    this._manageVar(VarOp.Store, '$', value);

    return value;
  }

  evalStatement(node) {
    const value = node.expr.evaluate(this);

    return value;
  }

  evalParentheses(node) {
    let value = node.expr.evaluate(this);
    value = cloneValue(value);

    return value;
  }

  evalNumberLiteral(node) {
    const octal = node.value.replace(/^0o/, '');
    const value =
      octal !== node.value ? parseInt(octal, 8) : Number(node.value);

    return value;
  }

  evalPercent(node) {
    const value = forceNumInRange(
      node.value.evaluate(this),
      -100,
      100,
      node.value.$loc
    );
    const n = value / 100.0;

    return n;
  }

  evalArrayLiteral(node) {
    const value = node.value.map(expr => expr.evaluate(this));

    return value;
  }

  evalArrayElement(node) {
    const array = forceType(
      node.obj.evaluate(this),
      ValueType.Array,
      node.obj.$loc
    );
    const index = forceNumInRange(+node.name, 0, array.length - 1, node.$loc);
    const value = array[index];

    return value;
  }

  evalColorNameLiteral(node) {
    const value = chroma(node.value);

    return value;
  }

  evalColorHexLiteral(node) {
    const value = chroma(node.value);

    return value;
  }

  evalColorByNumber(node) {
    const n = forceNumInRange(
      node.value.evaluate(this),
      0,
      0xffffff,
      node.value.$loc
    );
    const value = chroma(n);

    return value;
  }

  evalColorByTemperature(node) {
    const temperature = forceNumInRange(
      node.value.evaluate(this),
      0,
      200000,
      node.value.$loc
    );
    const value = chroma.temperature(temperature);

    return value;
  }

  evalColorByWavelength(node) {
    const wl = forceNumInRange(
      node.value.evaluate(this),
      350,
      780,
      node.value.$loc
    );
    const value = colorFromWavelength(wl);

    return value;
  }

  evalColorBySpaceParams(node) {
    let space = node.space;
    const paramExprs = node.params.slice(0);
    let params = node.params.map(expr => expr.evaluate(this));
    let alphaExpr = null;
    let alpha;

    if (space === 'argb') {
      alpha = params.shift();
      alphaExpr = paramExprs.shift();
      space = 'rgb';
    } else if (params.length > (space === 'cmyk' ? 4 : 3)) {
      alpha = params.pop();
      alphaExpr = paramExprs.pop();
    }

    const ranges = getColorSpaceParamsValidRanges(space);

    if (params.length !== ranges.length) {
      throwError(
        `invalid number of params for color space ${node.space.toUpperCase()}`,
        node.$loc
      );
    }

    for (let i = 0; i < params.length; i++) {
      forceNumInRange(params[i], ranges[i], paramExprs[i].$loc);
    }

    if (space === 'cmy') {
      params = cmyToCmykArray(params);
      space = 'cmyk';
    }

    let value = chroma(params, space);
    if (alpha != null) {
      value = value.alpha(forceNumInRange(alpha, 0, 1, alphaExpr.$loc));
    }
    return value;
  }

  evalRandomColor(/*node*/) {
    const value = chroma.random();

    return value;
  }

  evalScale(node) {
    const colors = Array.isArray(node.colors)
      ? node.colors.map(expr =>
          forceType(expr.evaluate(this), ValueType.Color, expr.$loc)
        )
      : forceType(
          node.colors.evaluate(this),
          ValueType.ColorArray,
          node.colors.$loc
        );

    if (colors && colors.length < 2) {
      throwError('two or more colors are required for interpolation');
    }

    const scaleParams = [{name: 'colors', value: colors}];

    if (node.domain !== void 0) {
      const domain = node.domain.map(expr =>
        forceType(expr.evaluate(this), ValueType.Number, expr.$loc)
      );
      scaleParams.push({name: 'domain', value: domain});
    }

    if (node.mode !== void 0) {
      scaleParams.push({name: 'mode', value: node.mode});
    }

    const value = new ColorScale('scale', void 0, scaleParams);

    return value;
  }

  evalBezier(node) {
    const colors = forceType(
      node.colors.evaluate(this),
      ValueType.ColorArray,
      node.colors.$loc
    );
    const colorsMin = 2;
    const colorsMax = 5;

    if (colors.length < colorsMin || colors.length > colorsMax) {
      throwError(
        `bezier interpolate supports from ${colorsMin} to ${colorsMax} colors, you provided: ${colors.length}`
      );
    }

    const scaleParams = [{name: 'colors', value: colors}];
    const value = new ColorScale('bezier', void 0, scaleParams);

    return value;
  }

  evalCubehelix(/*node*/) {
    const value = new ColorScale('cubehelix');

    return value;
  }

  evalBrewerConst(node) {
    const dict = CoreEvaluator._getBrewerConstsDict();
    const colorStrs = dict[node.name.toLowerCase()];
    const colors = colorStrs.map(s => chroma(s));

    return colors;
  }

  evalUnaryMinus(node) {
    let value = forceType(
      node.value.evaluate(this),
      ValueType.Number,
      node.value.$loc
    );
    value = -value;

    return value;
  }

  evalColorInverse(node) {
    let value = forceType(
      node.value.evaluate(this),
      ValueType.Color,
      node.value.$loc
    );
    value = inverseColor(value);

    return value;
  }

  evalCorrectLightness(node) {
    let value = forceType(
      node.value.evaluate(this),
      ValueType.ColorScale,
      node.value.$loc
    );
    value = value.clone();
    value.scaleParams.push({name: 'correctLightness'});

    return value;
  }

  evalNumbersAddition(node) {
    return this._numbersArithmeticOp(node);
  }
  evalNumbersSubtraction(node) {
    return this._numbersArithmeticOp(node);
  }
  evalNumbersMultiplication(node) {
    return this._numbersArithmeticOp(node);
  }
  evalNumbersDivision(node) {
    return this._numbersArithmeticOp(node);
  }

  evalColorAndNumberAddition(node) {
    return this._colorArithmeticOp(node);
  }
  evalColorAndNumberSubtraction(node) {
    return this._colorArithmeticOp(node);
  }
  evalColorAndNumberMultiplication(node) {
    return this._colorArithmeticOp(node);
  }
  evalColorAndNumberDivision(node) {
    return this._colorArithmeticOp(node);
  }

  evalNumberPower(node) {
    const left = node.left.evaluate(this);
    const right = node.right.evaluate(this);
    const value = Math.pow(left, right);

    return value;
  }

  evalColorsContrast(node) {
    const left = node.left.evaluate(this);
    const right = node.right.evaluate(this);
    const value = chroma.contrast(left, right);

    return value;
  }

  evalColorsMix(node) {
    const left = node.left.evaluate(this);
    const right = node.right.evaluate(this);
    const ratioExpr = (node.options || {}).ratio;
    const ratio = ratioExpr
      ? forceType(ratioExpr.evaluate(this), ValueType.Number, ratioExpr.$loc)
      : void 0;
    const mode = (node.options || {}).mode || 'rgb';
    const value = chroma.mix(left, right, ratio, mode);

    return value;
  }

  evalColorsFromScaleProduction(node) {
    const left = node.left.evaluate(this);
    const right = forceNumInRange(
      node.right.evaluate(this),
      2,
      0xffff,
      node.right.$loc
    );
    const value = left
      .getFn()
      .colors(right)
      .map(s => chroma(s));

    return value;
  }

  evalColorDesaturate(node) {
    return this._adjustColorCompOp(node, 'lch.c', false);
  }
  evalColorSaturate(node) {
    return this._adjustColorCompOp(node, 'lch.c', true);
  }
  evalColorDarken(node) {
    return this._adjustColorCompOp(node, 'lab.l', false);
  }
  evalColorLighten(node) {
    return this._adjustColorCompOp(node, 'lab.l', true);
  }

  evalAddBlend(node) {
    return this._blendColorsOp(node, BlendMode.Add);
  }
  evalSubtractBlend(node) {
    return this._blendColorsOp(node, BlendMode.Subtract);
  }
  evalMultiplyBlend(node) {
    return this._blendColorsOp(node, BlendMode.Multiply);
  }
  evalDivideBlend(node) {
    return this._blendColorsOp(node, BlendMode.Divide);
  }
  evalColorBurnBlend(node) {
    return this._blendColorsOp(node, BlendMode.ColorBurn);
  }
  evalColorDodgeBlend(node) {
    return this._blendColorsOp(node, BlendMode.ColorDodge);
  }
  evalDarkenBlend(node) {
    return this._blendColorsOp(node, BlendMode.Darken);
  }
  evalLightenBlend(node) {
    return this._blendColorsOp(node, BlendMode.Lighten);
  }
  evalScreenBlend(node) {
    return this._blendColorsOp(node, BlendMode.Screen);
  }
  evalOverlayBlend(node) {
    return this._blendColorsOp(node, BlendMode.Overlay);
  }
  evalHardLightBlend(node) {
    return this._blendColorsOp(node, BlendMode.HardLight);
  }
  evalSoftLightBlend(node) {
    return this._blendColorsOp(node, BlendMode.SoftLight);
  }
  evalDifferenceBlend(node) {
    return this._blendColorsOp(node, BlendMode.Difference);
  }
  evalExclusionBlend(node) {
    return this._blendColorsOp(node, BlendMode.Exclusion);
  }
  evalNegateBlend(node) {
    return this._blendColorsOp(node, BlendMode.Negate);
  }

  evalManageColorNumber(node) {
    const curObj = node.obj.evaluate(this);
    const curValue = Number(`0x${curObj.hex().replace(/^#/, '')}`);

    if (node.value === void 0) {
      // get
      return curValue;
    } else {
      // set
      let value = forceNumInRange(
        node.value.evaluate(this),
        0,
        0xffffff,
        node.value.$loc
      );
      if (node.operator) {
        // set rel
        value = Math.max(
          Math.min(
            this._getNumberArithmeticFunc(node.operator)(curValue, value),
            0xffffff
          ),
          0
        );
      }

      let obj = chroma(value);
      obj = obj.alpha(curObj.alpha());
      return obj;
    }
  }

  evalManageColorTemperature(node) {
    const curValue = node.obj.evaluate(this).temperature();

    if (node.value === void 0) {
      return curValue;
    } else {
      let value = forceType(
        node.value.evaluate(this),
        ValueType.Number,
        node.value.$loc
      );
      if (node.operator) {
        value = this._getNumberArithmeticFunc(node.operator)(curValue, value);
      }

      const obj = chroma.temperature(value);
      return obj;
    }
  }

  evalManageColorLuminance(node) {
    const obj = cloneValue(node.obj.evaluate(this));
    const curValue = obj.luminance();

    if (node.value === void 0) {
      return curValue;
    } else {
      let value = forceNumInRange(
        node.value.evaluate(this),
        0,
        1,
        node.value.$loc
      );
      if (node.operator) {
        value = this._getNumberArithmeticFunc(node.operator)(curValue, value);
      }

      const space = node.name.match(/^((\w+)\.)?\w+/i)[2] || void 0;

      obj.luminance(value, space);

      return obj;
    }
  }

  evalManageColorAlpha(node) {
    let obj = cloneValue(node.obj.evaluate(this));
    const curValue = obj.alpha();

    if (node.value === void 0) {
      return curValue;
    } else {
      let value = ['*', '/'].includes(node.operator)
        ? forceType(
            node.value.evaluate(this),
            ValueType.Number,
            node.value.$loc
          )
        : forceNumInRange(node.value.evaluate(this), 0, 1, node.value.$loc);

      if (node.operator) {
        value = this._getNumberArithmeticFunc(node.operator)(curValue, value);
      }

      obj = obj.alpha(value);
      return obj;
    }
  }

  manageColorCompOp(node, comp) {
    let obj = cloneValue(node.obj.evaluate(this));
    const curValue = obj.get(comp);

    if (node.value === void 0) {
      return curValue;
    } else {
      const parts = comp.split('.');
      const ranges = getColorSpaceParamsValidRanges(parts[0]);
      const index = parts[0].indexOf(parts[1]);
      const range = ranges[index];
      let value = forceNumInRange(
        node.value.evaluate(this),
        range,
        node.value.$loc
      );

      if (node.operator) {
        value = this._getNumberArithmeticFunc(node.operator)(curValue, value);
      }

      obj = obj.set(comp, value);
      return obj;
    }
  }

  evalManageColorCompRgbR(node) {
    return this.manageColorCompOp(node, 'rgb.r');
  }
  evalManageColorCompRgbG(node) {
    return this.manageColorCompOp(node, 'rgb.g');
  }
  evalManageColorCompRgbB(node) {
    return this.manageColorCompOp(node, 'rgb.b');
  }

  evalManageColorCompCmykC(node) {
    return this.manageColorCompOp(node, 'cmyk.c');
  }
  evalManageColorCompCmykM(node) {
    return this.manageColorCompOp(node, 'cmyk.m');
  }
  evalManageColorCompCmykY(node) {
    return this.manageColorCompOp(node, 'cmyk.y');
  }
  evalManageColorCompCmykK(node) {
    return this.manageColorCompOp(node, 'cmyk.k');
  }

  evalManageColorCompHslH(node) {
    return this.manageColorCompOp(node, 'hsl.h');
  }
  evalManageColorCompHslS(node) {
    return this.manageColorCompOp(node, 'hsl.s');
  }
  evalManageColorCompHslL(node) {
    return this.manageColorCompOp(node, 'hsl.l');
  }

  evalManageColorCompHsvH(node) {
    return this.manageColorCompOp(node, 'hsv.h');
  }
  evalManageColorCompHsvS(node) {
    return this.manageColorCompOp(node, 'hsv.s');
  }
  evalManageColorCompHsvV(node) {
    return this.manageColorCompOp(node, 'hsv.v');
  }

  evalManageColorCompHsiH(node) {
    return this.manageColorCompOp(node, 'hsi.h');
  }
  evalManageColorCompHsiS(node) {
    return this.manageColorCompOp(node, 'hsi.s');
  }
  evalManageColorCompHsiI(node) {
    return this.manageColorCompOp(node, 'hsi.i');
  }

  evalManageColorCompLabL(node) {
    return this.manageColorCompOp(node, 'lab.l');
  }
  evalManageColorCompLabA(node) {
    return this.manageColorCompOp(node, 'lab.a');
  }
  evalManageColorCompLabB(node) {
    return this.manageColorCompOp(node, 'lab.b');
  }

  evalManageColorCompLchL(node) {
    return this.manageColorCompOp(node, 'lch.l');
  }
  evalManageColorCompLchC(node) {
    return this.manageColorCompOp(node, 'lch.c');
  }
  evalManageColorCompLchH(node) {
    return this.manageColorCompOp(node, 'lch.h');
  }

  evalSetColorScalePadding(node) {
    let value = node.value.evaluate(this);

    value = Array.isArray(value)
      ? forceRange(value, node.value.$loc)
      : forceType(value, ValueType.Number, node.value.$loc);

    const obj = this._addColorScaleParam(node, true, 'padding', value);
    return obj;
  }

  evalSetScaleDomain(node) {
    const value = forceType(
      node.value.evaluate(this),
      ValueType.NumberArray,
      node.value.$loc
    );
    if (value.length < 2) {
      throwError("'domain' parameter should contain at least two elements");
    }

    const obj = this._addColorScaleParam(node, true, 'domain', value);
    return obj;
  }

  evalSetCubehelixStart(node) {
    const value = forceNumInRange(
      node.value.evaluate(this),
      0,
      360,
      node.value.$loc
    );
    const obj = this._addColorScaleParam(node, false, 'start', value);

    return obj;
  }

  evalSetCubehelixRotations(node) {
    const value = forceType(
      node.value.evaluate(this),
      ValueType.Number,
      node.value.$loc
    );
    const obj = this._addColorScaleParam(node, false, 'rotations', value);

    return obj;
  }

  evalSetCubehelixHue(node) {
    let value = node.value.evaluate(this);

    value = Array.isArray(value)
      ? forceRange(value, node.value.$loc)
      : forceType(value, ValueType.Number, node.value.$loc);

    const obj = this._addColorScaleParam(node, false, 'hue', value);

    return obj;
  }

  evalSetCubehelixGamma(node) {
    const value = forceType(
      node.value.evaluate(this),
      ValueType.Number,
      node.value.$loc
    );
    const obj = this._addColorScaleParam(node, false, 'gamma', value);

    return obj;
  }

  evalSetCubehelixLightness(node) {
    const value = forceRange(node.value.evaluate(this), node.value.$loc);
    if (value[0] === value[1]) {
      throwError("empty 'lightness' range");
    }

    const obj = this._addColorScaleParam(node, false, 'lightness', value);

    return obj;
  }

  evalGetVar(node) {
    const value = this._manageVar(VarOp.Retrieve, node.name);

    return value;
  }

  evalSetVar(node) {
    const value = node.value.evaluate(this);
    this._manageVar(VarOp.Store, node.name, value);

    return value;
  }

  _varsDict = Object.create(null);

  _manageVar(op, name, value) {
    const name2 = name.replace(/^\$/, '').toLowerCase() || '$';
    const dict = this._varsDict;

    switch (op) {
      case VarOp.Store:
        dict[name2] = value;
        if (value === void 0) {
          throwError(`cannot assign undefined value to variable ${name}`);
        }
        break;

      case VarOp.Retrieve:
        value = dict[name2];
        if (value === void 0) {
          throwError(`variable ${name} is not defined`);
        }
        break;

      case VarOp.Delete:
        value = dict[name2];
        delete dict[name2];
        break;
    }

    return value;
  }

  static _getBrewerConstsDict() {
    let dict = this._brewerConstsDict;

    if (!dict) {
      dict = Object.create(null);

      for (const key in chroma.brewer) {
        if (key in chroma.brewer) {
          dict[key.toLowerCase()] = chroma.brewer[key];
        }
      }

      this._brewerConstsDict = dict;
    }

    return dict;
  }

  _numbersArithmeticOp(node) {
    const left = node.left.evaluate(this);
    const right = node.right.evaluate(this);
    const value = this._getNumberArithmeticFunc(node.operator)(left, right);

    return value;
  }

  _blendColorsOp(node, mode) {
    const left = node.left.evaluate(this);
    const right = node.right.evaluate(this);
    const value = blendColors(left, right, mode);

    return value;
  }

  _colorArithmeticOp(node) {
    const left = node.left.evaluate(this);
    const right = node.right.evaluate(this);
    const value = colorArithmeticOp(left, right, node.operator);

    return value;
  }

  _adjustColorCompOp(node, colorComp, add) {
    const left = node.left.evaluate(this);
    const right = forceNumInRange(
      node.right.evaluate(this),
      0,
      1,
      node.right.$loc
    );
    const value = cloneValue(left).set(
      colorComp,
      `*${!add ? 1 - right : 1 + right}`
    );

    return value;
  }

  _addColorScaleParam(node, scaleParams, name, value) {
    const obj = cloneValue(node.obj.evaluate(this));
    const params = scaleParams ? obj.scaleParams : obj.params;

    for (let i = 0; i < params.length; i++) {
      if (params[i].name === name) {
        params.splice(i, 1);
        break;
      }
    }

    params.push({
      name,
      value,
    });

    return obj;
  }
}
