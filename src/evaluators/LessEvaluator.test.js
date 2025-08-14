import {describe, it} from 'mocha';
import {expect} from 'expect';
import {evaluate} from '../index.js';
import {LessEvaluator} from './LessEvaluator.js';

describe('LessEvaluator', () => {
  const lessEvaluator = new LessEvaluator();

  const expr = (e, r) => {
    const result = evaluate(e, {
      evaluator: lessEvaluator,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    if (typeof r === 'function') {
      expect(r(result.resultStr)).toBeTruthy();
    } else {
      expect(result.resultStr).toBe(r);
    }
  };

  it('should define colors in different formats', () => {
    expr('#ffcc00', '#ffcc00');
    expr('ffcc00', '#ffcc00');
    expr('#fc0', '#fc0');
    expr('fc0', '#fc0');
    expr('aquamarine', 'aquamarine');
    expr('skyblue', 'skyblue');
    expr('tomato', 'tomato');
  });

  it('should define colors using different color models', () => {
    expr('rgb 127 255 212', 'rgb(127, 255, 212)');
    expr('rgba 135 206 235 75%', 'rgba(135, 206, 235, 75%)');
    expr('argb .7 255 99 71', 'argb(0.7, 255, 99, 71)');

    expr('hsl 159.8 100% 75%', 'hsl(159.8, 100%, 75%)');
    expr('hsla 197 .71 .73 55%', 'hsla(197, 0.71, 0.73, 55%)');

    expr('hsv 160 .5 1', 'hsv(160, 0.5, 1)');
    expr('hsb 197 .43 .92', 'hsv(197, 0.43, 0.92)');
    expr('hsva 9 .72 1 50%', 'hsva(9, 0.72, 1, 50%)');
  });

  it('should support operations with colors', () => {
    expr('#444 * 2', '#444 * 2');
    expr('skyblue - 0xf', 'skyblue - 15');

    expr('~red', '(#fff - red)');

    expr('red | green', 'mix(red, green)');
    expr('red | {25%} green', 'mix(red, green, 25%)');

    expr('hotpink << 50%', 'desaturate(hotpink, 50%, relative)');
    expr('rgb 165 42 42 >> .2', 'saturate(rgb(165, 42, 42), 20%, relative)');
    expr('red <<< 30%', 'darken(red, 30%, relative)');
    expr('#fc0 >>> 70%', 'lighten(#fc0, 70%, relative)');
  });

  it('should support blending colors', () => {
    expr('#222 + #444', '#222 + #444');
    expr('#ccc - #111', '#ccc - #111');
    expr('#ff6600 * #ccc', 'multiply(#ff6600, #ccc)');
    expr('#222 / #444', '#222 / #444');
    expr('#ff6600 !* #00ff00', 'screen(#ff6600, #00ff00)');
    expr('#ff6600 ** #999', 'overlay(#ff6600, #999)');
    expr('olive <* pink', 'hardlight(olive, pink)');
    expr('olive *> pink', 'softlight(olive, pink)');
    expr('ffcc00 ^* ccc', 'difference(#ffcc00, #ccc)');
    expr('ffcc00 ^^ ccc', 'exclusion(#ffcc00, #ccc)');
    expr('ffcc00 !^ ccc', 'negation(#ffcc00, #ccc)');
  });

  it('should support operations with color channels', () => {
    expr('brown @red', 'red(brown)');
    expr('#ffcc00 @g', 'green(#ffcc00)');
    expr('olive @a', 'alpha(olive)');

    expr('aquamarine @a = .3', 'fade(aquamarine, 30%)');
  });

  it('should support operations with numbers', () => {
    expr('0b01101001', '105');
    expr('0o151', '105');
    expr('105', '105');
    expr('0x69', '105');
    expr('55%', '55%');
    expr('5 + 10', '5 + 10');
    expr('-360 * 0.5 + (100 - 40)', '-360 * 0.5 + (100 - 40)');
    expr('0xf / 0b1010', '15 / 10');
    expr('2 ^ 14', 'pow(2, 14)');
    expr('4 ^ (2 / 4)', 'pow(4, 2 / 4)');
  });

  it('should support list definition', () => {
    expr('red 0f0 blue', 'red #0f0 blue');
    expr('(pink >> .5) gold', '(saturate(pink, 50%, relative)) gold');
  });

  it('should support brewer constants', () => {
    expr(
      'YlOrBr',
      '#ffffe5 #fff7bc #fee391 #fec44f #fe9929 #ec7014 #cc4c02 #993404 #662506'
    );
    expr(
      'PRGn',
      '#40004b #762a83 #9970ab #c2a5cf #e7d4e8 #f7f7f7 #d9f0d3 #a6dba0 #5aae61 #1b7837 #00441b'
    );
  });

  it('should support variables and statements', () => {
    expr('$col = rgb 255 204 0', '@col: rgb(255, 204, 0)');
    expr('$num = 2^8 - 1', '@num: pow(2, 8) - 1');
    expr('$lst = #444 #888', '@lst: #444 #888');
  });
});
