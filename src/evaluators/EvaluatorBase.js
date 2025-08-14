import {getType, getObjKey, throwError} from '../utils.js';
import {ValueType} from '../ValueType.js';
import {ParenthesesExpr} from '../nodes/index.js';

export class EvaluatorBase {
  constructor($type) {
    if (this.constructor === EvaluatorBase) {
      throw new Error("Can't instantiate abstract class");
    }

    this.$type = `evaluator.${$type}`;
  }

  get core() {
    throw new Error('Core evaluator should be returned in a derived class');
  }

  evalProgram(/*node*/) {
    notImpl();
  }

  evalStatement(/*node*/) {
    notImpl();
  }

  evalParentheses(/*node*/) {
    notImpl();
  }

  evalNumberLiteral(/*node*/) {
    notImpl();
  }

  evalPercent(/*node*/) {
    notImpl();
  }

  evalArrayLiteral(/*node*/) {
    notImpl();
  }

  evalArrayElement(/*node*/) {
    notImpl();
  }

  evalColorNameLiteral(/*node*/) {
    notImpl();
  }

  evalColorHexLiteral(/*node*/) {
    notImpl();
  }

  evalColorByNumber(/*node*/) {
    notImpl();
  }

  evalColorByTemperature(/*node*/) {
    notImpl();
  }

  evalColorByWavelength(/*node*/) {
    notImpl();
  }

  evalColorBySpaceParams(/*node*/) {
    notImpl();
  }

  evalRandomColor(/*node*/) {
    notImpl();
  }

  evalScale(/*node*/) {
    notImpl();
  }

  evalBezier(/*node*/) {
    notImpl();
  }

  evalCubehelix(/*node*/) {
    notImpl();
  }

  evalBrewerConst(/*node*/) {
    notImpl();
  }

  evalParam(node) {
    const obj = node.obj.evaluate(this.core);
    const objType = getType(obj);
    let defs = [];

    switch (objType) {
      case ValueType.Color:
        defs = this._getColorParamDefs();
        break;
      case ValueType.ColorScale:
        defs = this._getColorScaleParamDefs(obj.name);
        break;
    }

    if (!defs.length && objType & ValueType.Array) {
      defs.push({
        re: /^\d+$/i,
        get: node => this.evalArrayElement(node),
      });
    }

    const result = this._manageParam(node, defs);
    return result;
  }

  evalManageColorNumber(/*node*/) {
    notImpl();
  }

  evalManageColorTemperature(/*node*/) {
    notImpl();
  }

  evalManageColorLuminance(/*node*/) {
    notImpl();
  }

  evalManageColorAlpha(/*node*/) {
    notImpl();
  }

  evalManageColorCompRgbR(/*node*/) {
    notImpl();
  }

  evalManageColorCompRgbG(/*node*/) {
    notImpl();
  }

  evalManageColorCompRgbB(/*node*/) {
    notImpl();
  }

  evalManageColorCompCmykC(/*node*/) {
    notImpl();
  }

  evalManageColorCompCmykM(/*node*/) {
    notImpl();
  }

  evalManageColorCompCmykY(/*node*/) {
    notImpl();
  }

  evalManageColorCompCmykK(/*node*/) {
    notImpl();
  }

  evalManageColorCompHslH(/*node*/) {
    notImpl();
  }

  evalManageColorCompHslS(/*node*/) {
    notImpl();
  }

  evalManageColorCompHslL(/*node*/) {
    notImpl();
  }

  evalManageColorCompHsvH(/*node*/) {
    notImpl();
  }

  evalManageColorCompHsvS(/*node*/) {
    notImpl();
  }

  evalManageColorCompHsvV(/*node*/) {
    notImpl();
  }

  evalManageColorCompHsiH(/*node*/) {
    notImpl();
  }

  evalManageColorCompHsiS(/*node*/) {
    notImpl();
  }

  evalManageColorCompHsiI(/*node*/) {
    notImpl();
  }

  evalManageColorCompLabL(/*node*/) {
    notImpl();
  }

  evalManageColorCompLabA(/*node*/) {
    notImpl();
  }

  evalManageColorCompLabB(/*node*/) {
    notImpl();
  }

  evalManageColorCompLchL(/*node*/) {
    notImpl();
  }

  evalManageColorCompLchC(/*node*/) {
    notImpl();
  }

  evalManageColorCompLchH(/*node*/) {
    notImpl();
  }

  evalSetColorScalePadding(/*node*/) {
    notImpl();
  }

  evalSetScaleDomain(/*node*/) {
    notImpl();
  }

  evalSetCubehelixStart(/*node*/) {
    notImpl();
  }

  evalSetCubehelixRotations(/*node*/) {
    notImpl();
  }

  evalSetCubehelixHue(/*node*/) {
    notImpl();
  }

  evalSetCubehelixGamma(/*node*/) {
    notImpl();
  }

  evalSetCubehelixLightness(/*node*/) {
    notImpl();
  }

  evalUnaryOperation(node) {
    switch (node.operator) {
      case '-':
        return this.evalUnaryMinus(node);
      case '~':
        return this.evalColorInverse(node);
      case '+':
        return this.evalCorrectLightness(node);
      default:
        throw `invalid operator: ${node.operator}`;
    }
  }

  evalUnaryMinus(/*node*/) {
    notImpl();
  }

  evalColorInverse(/*node*/) {
    notImpl();
  }

  evalCorrectLightness(/*node*/) {
    notImpl();
  }

  evalBinaryOperation(node) {
    const left = node.left.evaluate(this.core);
    const right = node.right.evaluate(this.core);

    const isNumbers = [left, right].every(v => getType(v) === ValueType.Number);
    const isColors = [left, right].every(v => getType(v) === ValueType.Color);
    const isColorAndNumber =
      getType(left) === ValueType.Color && getType(right) === ValueType.Number;
    const isNumberAndColor =
      getType(left) === ValueType.Number && getType(right) === ValueType.Color;

    switch (node.operator) {
      case '+':
        if (isNumbers) {
          return this.evalNumbersAddition(node);
        } else if (isColors) {
          return this.evalAddBlend(node);
        } else if (isColorAndNumber || isNumberAndColor) {
          return this.evalColorAndNumberAddition(node);
        } else {
          break;
        }

      case '-':
        if (isNumbers) {
          return this.evalNumbersSubtraction(node);
        } else if (isColors) {
          return this.evalSubtractBlend(node);
        } else if (isColorAndNumber) {
          return this.evalColorAndNumberSubtraction(node);
        } else {
          break;
        }

      case '*':
        if (isNumbers) {
          return this.evalNumbersMultiplication(node);
        } else if (isColors) {
          return this.evalMultiplyBlend(node);
        } else if (isColorAndNumber || isNumberAndColor) {
          return this.evalColorAndNumberMultiplication(node);
        } else {
          break;
        }

      case '/':
        if (isNumbers) {
          return this.evalNumbersDivision(node);
        } else if (isColors) {
          return this.evalDivideBlend(node);
        } else if (isColorAndNumber) {
          return this.evalColorAndNumberDivision(node);
        } else {
          break;
        }

      case '^':
        if (isNumbers) {
          return this.evalNumberPower(node);
        } else {
          break;
        }

      case '%%':
        if (isColors) {
          return this.evalColorsContrast(node);
        } else {
          break;
        }

      case '|':
        if (isColors) {
          return this.evalColorsMix(node);
        } else {
          break;
        }

      case '->':
        if (
          getType(left) === ValueType.ColorScale &&
          getType(right) === ValueType.Number
        ) {
          return this.evalColorsFromScaleProduction(node);
        } else {
          break;
        }

      case '<<':
        if (isColorAndNumber) {
          return this.evalColorDesaturate(node);
        } else if (isColors) {
          return this.evalColorBurnBlend(node);
        } else {
          break;
        }

      case '>>':
        if (isColorAndNumber) {
          return this.evalColorSaturate(node);
        } else if (isColors) {
          return this.evalColorDodgeBlend(node);
        } else {
          break;
        }

      case '<<<':
        if (isColorAndNumber) {
          return this.evalColorDarken(node);
        } else if (isColors) {
          return this.evalDarkenBlend(node);
        } else {
          break;
        }

      case '>>>':
        if (isColorAndNumber) {
          return this.evalColorLighten(node);
        } else if (isColors) {
          return this.evalLightenBlend(node);
        } else {
          break;
        }

      case '!*':
        if (isColors) {
          return this.evalScreenBlend(node);
        } else {
          break;
        }

      case '**':
        if (isColors) {
          return this.evalOverlayBlend(node);
        } else {
          break;
        }

      case '<*':
        if (isColors) {
          return this.evalHardLightBlend(node);
        } else {
          break;
        }

      case '*>':
        if (isColors) {
          return this.evalSoftLightBlend(node);
        } else {
          break;
        }

      case '^*':
        if (isColors) {
          return this.evalDifferenceBlend(node);
        } else {
          break;
        }

      case '^^':
        if (isColors) {
          return this.evalExclusionBlend(node);
        } else {
          break;
        }

      case '!^':
        if (isColors) {
          return this.evalNegateBlend(node);
        } else {
          break;
        }

      default:
        throwError(`invalid operator '${node.operator}'`);
    }

    throwError(
      `${getObjKey(ValueType, getType(left))} ` +
        `and ${getObjKey(ValueType, getType(right))} ` +
        `is invalid operand types or sequence for operator '${node.operator}'`,
      node.$loc
    );
  }

  evalNumbersAddition(/*node*/) {
    notImpl();
  }

  evalNumbersSubtraction(/*node*/) {
    notImpl();
  }

  evalNumbersMultiplication(/*node*/) {
    notImpl();
  }

  evalNumbersDivision(/*node*/) {
    notImpl();
  }

  evalColorAndNumberAddition(/*node*/) {
    notImpl();
  }

  evalColorAndNumberSubtraction(/*node*/) {
    notImpl();
  }

  evalColorAndNumberMultiplication(/*node*/) {
    notImpl();
  }

  evalColorAndNumberDivision(/*node*/) {
    notImpl();
  }

  evalNumberPower(/*node*/) {
    notImpl();
  }

  evalColorsContrast(/*node*/) {
    notImpl();
  }

  evalColorsMix(/*node*/) {
    notImpl();
  }

  evalColorsFromScaleProduction(/*node*/) {
    notImpl();
  }

  evalColorDesaturate(/*node*/) {
    notImpl();
  }

  evalColorSaturate(/*node*/) {
    notImpl();
  }

  evalColorDarken(/*node*/) {
    notImpl();
  }

  evalColorLighten(/*node*/) {
    notImpl();
  }

  evalAddBlend(/*node*/) {
    notImpl();
  }

  evalSubtractBlend(/*node*/) {
    notImpl();
  }

  evalMultiplyBlend(/*node*/) {
    notImpl();
  }

  evalDivideBlend(/*node*/) {
    notImpl();
  }

  evalColorBurnBlend(/*node*/) {
    notImpl();
  }

  evalColorDodgeBlend(/*node*/) {
    notImpl();
  }

  evalDarkenBlend(/*node*/) {
    notImpl();
  }

  evalLightenBlend(/*node*/) {
    notImpl();
  }

  evalScreenBlend(/*node*/) {
    notImpl();
  }

  evalOverlayBlend(/*node*/) {
    notImpl();
  }

  evalHardLightBlend(/*node*/) {
    notImpl();
  }

  evalSoftLightBlend(/*node*/) {
    notImpl();
  }

  evalDifferenceBlend(/*node*/) {
    notImpl();
  }

  evalExclusionBlend(/*node*/) {
    notImpl();
  }

  evalNegateBlend(/*node*/) {
    notImpl();
  }

  evalGetVar(/*node*/) {
    notImpl();
  }

  evalSetVar(/*node*/) {
    notImpl();
  }

  _getNumberArithmeticFunc(operator) {
    if (!['+', '-', '*', '/'].includes(operator)) {
      throwError(`invalid arithmetic operator provided: '${operator}'`);
    }

    switch (operator) {
      case '+':
        return (a, b) => a + b;
      case '-':
        return (a, b) => a - b;
      case '*':
        return (a, b) => a * b;
      case '/':
        return (a, b) => a / b;
      default:
        throwError(`invalid arithmetic operator provided: '${operator}'`);
    }
  }

  _manageParam(node, defs) {
    const opName = (() => {
      if (node.value === void 0) {
        return 'get';
      } else if (!node.operator) {
        return 'set';
      } else {
        return 'relative set';
      }
    })();

    for (let i = 0; i < defs.length; i++) {
      const def = defs[i];

      if (node.name.match(def.re)) {
        let method = def.manage;

        if (!method) {
          method = node.value === void 0 ? def.get : def.set;

          if (node.operator) {
            method = def.setRel;
          }
        }

        if (method) {
          const result = method.call(def, node);
          if (result === void 0) {
            throwError(
              `operation '${opName}' for parameter '${node.name}' is not supported by '${this.$type}'`,
              node.$loc
            );
          }

          return result;
        } else {
          throwError(
            `operation '${opName}' is not supported for parameter '${node.name}'`,
            node.$loc
          );
        }

        break;
      }
    }

    throwError(`unknown parameter name '${node.name}'`, node.$loc);
  }

  _getColorParamDefs() {
    return [
      {
        re: /^(number|num|n)$/i,
        manage: node => this.evalManageColorNumber(node),
      },
      {
        re: /^(temperature|temp|t)$/i,
        manage: node => this.evalManageColorTemperature(node),
      },
      {
        re: /^((rgb|cmyk|hsl|hsv|hsi|lab|lch|hcl)\.)?(luminance|lum)$/i,
        manage: node => {
          if (node.value === void 0 && node.name.match(/\./)) {
            throwError(
              'color space should not be specified when retrieving luminance',
              node.$loc
            );
          }

          return this.evalManageColorLuminance(node);
        },
      },
      {
        re: /^(alpha|a)$/i,
        manage: node => this.evalManageColorAlpha(node),
      },
      {
        re: /^(rgb\.)?(red|r)$/i,
        manage: node => this.evalManageColorCompRgbR(node),
      },
      {
        re: /^(rgb\.)?(green|g)$/i,
        manage: node => this.evalManageColorCompRgbG(node),
      },
      {
        re: /^(rgb\.)?(blue|b)$/i,
        manage: node => this.evalManageColorCompRgbB(node),
      },
      {
        re: /^(cmyk\.)?(cyan|c)$/i,
        manage: node => this.evalManageColorCompCmykC(node),
      },
      {
        re: /^(cmyk\.)?(magenta|mag|m)$/i,
        manage: node => this.evalManageColorCompCmykM(node),
      },
      {
        re: /^(cmyk\.)?(yellow|yel|y)$/i,
        manage: node => this.evalManageColorCompCmykY(node),
      },
      {
        re: /^(cmyk\.)?(key|k)$/i,
        manage: node => this.evalManageColorCompCmykK(node),
      },
      {
        re: /^((hsl|hsv|hsi|lch|hcl)\.)?(hue|h)$/i,
        manage: node =>
          node.name.match(/hsv/i)
            ? this.evalManageColorCompHsvH(node)
            : node.name.match(/hsi/i)
              ? this.evalManageColorCompHsiH(node)
              : node.name.match(/lch|hcl/i)
                ? this.evalManageColorCompLchH(node)
                : this.evalManageColorCompHslH(node),
      },
      {
        re: /^((hsl|hsv|hsi)\.)?(saturation|sat|s)$/i,
        manage: node =>
          node.name.match(/hsv/i)
            ? this.evalManageColorCompHsvS(node)
            : node.name.match(/hsi/i)
              ? this.evalManageColorCompHsiS(node)
              : this.evalManageColorCompHslS(node),
      },
      {
        re: /^((hsl|lab|lch|hcl)\.)?(lightness|ltns|lt|l)$/i,
        manage: node =>
          node.name.match(/lab/i)
            ? this.evalManageColorCompLabL(node)
            : node.name.match(/lch|hcl/i)
              ? this.evalManageColorCompLchL(node)
              : this.evalManageColorCompHslL(node),
      },
      {
        re: /^(hsv\.)?(value|val|v)$/i,
        manage: node => this.evalManageColorCompHsvV(node),
      },
      {
        re: /^(hsi\.)?(intensity|int|i)$/i,
        manage: node => this.evalManageColorCompHsiI(node),
      },
      {
        re: /^lab\.a$/i,
        manage: node => this.evalManageColorCompLabA(node),
      },
      {
        re: /^lab\.b$/i,
        manage: node => this.evalManageColorCompLabB(node),
      },
      {
        re: /^((((lch|hcl)\.)?(chroma|chr|ch))|lch\.c|hcl\.c)$/i,
        manage: node => this.evalManageColorCompLchC(node),
      },
    ];
  }

  _getColorScaleParamDefs(scaleName) {
    const defs = [
      {
        re: /^(padding|pad|p)$/i,
        set: node => this.evalSetColorScalePadding(node),
      },
    ];

    if (scaleName === 'scale') {
      defs.push.apply(defs, [
        {
          re: /^(domain|dom|d)$/i,
          set: node => this.evalSetScaleDomain(node),
        },
      ]);
    }

    if (scaleName === 'cubehelix') {
      defs.push.apply(defs, [
        {
          re: /^(start|s)$/i,
          set: node => this.evalSetCubehelixStart(node),
        },
        {
          re: /^(rotations|rot|r)$/i,
          set: node => this.evalSetCubehelixRotations(node),
        },
        {
          re: /^(hue|h)$/i,
          set: node => this.evalSetCubehelixHue(node),
        },
        {
          re: /^(gamma|g)$/i,
          set: node => this.evalSetCubehelixGamma(node),
        },
        {
          re: /^(lightness|lt|l)$/i,
          set: node => this.evalSetCubehelixLightness(node),
        },
      ]);
    }

    return defs;
  }

  _unwrapParens(node) {
    while (node instanceof ParenthesesExpr) {
      node = node.expr;
    }

    return node;
  }
}

function notImpl() {
  throw new Error('Not implemented');
}
