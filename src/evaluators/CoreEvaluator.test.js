import {describe, it} from 'mocha';
import {expect} from 'expect';
import {evaluate} from '../index.js';

describe('CoreEvaluator', () => {
  const expr = (e, r) => {
    const result = evaluate(e);

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
    expr('#fc0', '#ffcc00');
    expr('fc0', '#ffcc00');
    expr('aquamarine', '#7fffd4');
    expr('skyblue', '#87ceeb');
    expr('tomato', '#ff6347');
    expr('rand', rs => /^#[a-f0-9]{6}$/.test(rs));
    expr('num 33023', '#0080ff');
    expr('t 3500', '#ffc38a');
    expr('wl 560', '#b6ff00');
  });

  it('should define colors using different color models', () => {
    expr('rgb 127 255 212', '#7fffd4');
    expr('rgba 135 206 235 75%', '#87ceebbf');
    expr('argb .7 255 99 71', '#ff6347b3');

    expr('cmyk .43 .12 0 .8', '#1d2d33');
    expr('cmyka 0 .61 .72 0 60%', '#ff634799');
    expr('cmy .5 0 .17', '#80ffd4');
    expr('cmya 0 .61 .72 .65', '#ff6347a6');

    expr('hsl 159.8 100% 75%', '#80ffd4');
    expr('hsla 197 .71 .73 55%', '#89cfeb8c');

    expr('hsv 160 .5 1', '#80ffd4');
    expr('hsb 197 .43 .92', '#86ceeb');
    expr('hsva 9 .72 1 50%', '#ff634780');

    expr('hsi 161 .36 .78', '#7fffd5');
    expr('hsia 196 .30 .75 45%', '#86ceea73');

    expr('lab 92 (-46) 9.7', '#7dffd4');
    expr('laba 79 (-14.8) (-21) 40%', '#87cdea66');

    expr('lch 92 46.5 168', '#7fffd4');
    expr('lcha 79 26 235 35%', '#86cdea59');

    expr('hcl 168 46.5 92', '#7fffd4');
    expr('hcla 235 26 79 35%', '#86cdea59');
  });

  it('should support operations with colors', () => {
    expr('#444 * 2', '#888888');
    expr('skyblue - 0xf', '#78bfdc');
    expr('#ffcc00 - 20', '#ebb800');

    expr('~red', '#00ffff');

    expr('red | green', '#804000');
    expr('red | {25%} green', '#bf2000');
    expr('red | {25% hsl} green', '#df7000');
    expr('red | {hsl} green', '#bfc000');

    expr('hotpink << 50%', '#d28aa9');
    expr('rgb 165 42 42 >> .2', '#b10f21');
    expr('temp 4000 <<< 30%', '#b48a61');
    expr('#fc0 >>> 70%', '#ffffc9');

    expr('pink %% hotpink', '1.7215');
    expr('pink %% purple', '6.1242');
  });

  it('should support blending colors', () => {
    expr('#222 + #444', '#666666');
    expr('#ccc - #111', '#bbbbbb');
    expr('#ff6600 * #ccc', '#cc5200');
    expr('#222 / #444', '#808080');
    expr('skyblue <<< tomato', '#876347');
    expr('skyblue >>> tomato', '#ffceeb');
    expr('#ff6600 !* #00ff00', '#ffff00');
    expr('#ff6600 ** #999', '#ff7a00');
    expr('olive <* pink', '#ffc097');
    expr('olive *> pink', '#bfa000');
    expr('ffcc00 ^* ccc', '#3300cc');
    expr('ffcc00 ^^ ccc', '#3352cc');
    expr('ffcc00 !^ ccc', '#3366cc');
    expr('indigo << red', '#4b0000');
    expr('indigo >> red', '#ff0082');
  });

  it('should support operations with color channels', () => {
    expr('brown @red', '165');
    expr('#ffcc00 @g', '204');
    expr('t 5000 @cmyk.y', '0.1961');
    expr('olive @a', '1');

    expr('aquamarine @a = .3', '#7fffd44d');
    expr('rgb 5 7 9 @hsl.h 90', '#070905');
    expr('#000 @lightness 50%', '#808080');

    expr('red @a /= 2', '#ff000080');
    expr('ffcc00 @rgb.r -= 50', '#cdcc00');
    expr('tomato @s *= 30%', '#bf9087');

    expr('olive @n', '8421376');

    expr('fff @n 0', '#000000');
    expr('#0080ff @n /= 2', '#00407f');

    expr('#ffe3cd @t', '4999');

    expr('red @t 3500', '#ffc38a');
    expr('ffe3cd @t += 500', '#ffecdf');
  });

  it('should support operations with color scales', () => {
    expr(
      'scale (red 0f0 blue) -> 10',
      '[#ff0000, #c63900, #8e7100, #55aa00, #1ce300, #00e31c, #00aa55, #00718e, #0039c6, #0000ff]'
    );
    expr(
      'scale (yellow 008ae5) -> 10',
      '[#ffff00, #e3f219, #c6e533, #aad84c, #8ecb66, #71be7f, #55b199, #39a4b2, #1c97cc, #008ae5]'
    );
    expr(
      'scale (t 2000 t 6000) -> 10',
      '[#ff8b14, #ff972c, #ffa245, #ffae5d, #ffb975, #ffc58e, #ffd0a6, #ffdcbe, #ffe7d7, #fff3ef]'
    );
    expr(
      'bezier (ff0 red #000) -> 10',
      '[#ffff00, #ffd700, #f9b200, #e78e03, #ce6d09, #af500d, #8a370e, #61240e, #371508, #000000]'
    );
    expr(
      'bezier (red 0f0) -> 10',
      '[#ff0000, #f64e00, #eb7000, #df8a00, #d1a000, #c0b500, #abc900, #90db00, #6aed00, #00ff00]'
    );

    expr(
      'scale (red:.2 0f0:50%) -> 10',
      '[#ff0000, #e31c00, #c63900, #aa5500, #8e7100, #718e00, #55aa00, #39c600, #1ce300, #00ff00]'
    );
    expr(
      'scale (red 0f0) @domain (.2 .5) -> 10',
      '[#ff0000, #e31c00, #c63900, #aa5500, #8e7100, #718e00, #55aa00, #39c600, #1ce300, #00ff00]'
    );
    expr(
      'scale (red 0f0) @pad .25 -> 10',
      '[#bf4000, #b14e00, #a35c00, #956a00, #877800, #788700, #6a9500, #5ca300, #4eb100, #40bf00]'
    );
    expr(
      'bezier (red 0f0) @pad (.1 .3) -> 10',
      '[#f74a00, #f16000, #ea7200, #e38200, #db9100, #d29e00, #c9ab00, #beb700, #b2c300, #a4ce00]'
    );

    expr(
      'cubehelix @pad (0 .2) -> 10',
      '[#000000, #19122b, #18334b, #175a49, #377434, #767b33, #b5795e, #d383a5, #cea1df, #c1caf3]'
    );
    expr(
      'cubehelix @start 200 -> 10',
      '[#000000, #072818, #2e4610, #794b2a, #a8547c, #9c7bc8, #86b4d5, #a0dbbf, #ddeacb, #ffffff]'
    );
    expr(
      'cubehelix @rot (-.5) -> 10',
      '[#000000, #29122f, #432c62, #514d8d, #5a72ac, #6699bd, #7cbcc6, #9fd9ce, #cdefde, #ffffff]'
    );
    expr(
      'cubehelix @hue .5 -> 10',
      '[#000000, #1b1a29, #274044, #406247, #747652, #a7847e, #bf9db8, #c5c3dc, #d8e7e9, #ffffff]'
    );
    expr(
      'cubehelix @hue (1 0) -> 10',
      '[#000000, #1b1932, #1d444a, #396742, #74764f, #a48580, #b8a1b3, #c6c5d0, #e0e4e4, #ffffff]'
    );
    expr(
      'cubehelix @gamma .7 -> 10',
      '[#000000, #343061, #2a6b76, #489457, #959a53, #d7978d, #e3aad7, #d3d1f8, #dcf1f4, #ffffff]'
    );
    expr(
      'cubehelix @lt (.3 .8) -> 10',
      '[#743467, #565294, #377d87, #489558, #8a8e46, #c67f75, #cd86bf, #aca8e6, #97cdd6, #aedfb8]'
    );
    expr(
      'cubehelix @start 200 @rot .5 @gamma .8 @lt (.3 .8) -> 10',
      '[#3b6c8f, #5871aa, #7874bc, #9978c5, #b77fc6, #cf89c1, #e097ba, #e9a9b5, #ecbcb4, #ebcfbb]'
    );

    expr(
      '+scale (black red yellow) -> 10',
      '[#000000, #440000, #6f0000, #9e0000, #cf0000, #ff1800, #ff7400, #ffa800, #ffd500, #ffff00]'
    );
    expr(
      '+bezier (yellow 0f0 blue) -> 10',
      '[#ffff00, #c3f336, #aade5a, #9ec676, #95ad8f, #8d93a6, #8178bc, #715cd2, #553be9, #0000ff]'
    );
  });

  it('should support operations with numbers', () => {
    expr('0b01101001', '105');
    expr('0o151', '105');
    expr('105', '105');
    expr('0x69', '105');
    expr('55%', '0.55');
    expr('5 + 10', '15');
    expr('-360 * 0.5 + (100 - 40)', '-120');
    expr('0xf / 0b1010', '1.5');
    expr('2 ^ 14', '16384');
    expr('4 ^ (2 / 4)', '2');
  });

  it('should support list definition', () => {
    expr('red 0f0 blue', '[#ff0000, #00ff00, #0000ff]');
    expr('(pink >> .5) gold', '[#ffb6c8, #ffd700]');
  });

  it('should support brewer constants', () => {
    expr(
      'YlOrBr',
      '[#ffffe5, #fff7bc, #fee391, #fec44f, #fe9929, #ec7014, #cc4c02, #993404, #662506]'
    );
    expr(
      'PRGn',
      '[#40004b, #762a83, #9970ab, #c2a5cf, #e7d4e8, #f7f7f7, #d9f0d3, #a6dba0, #5aae61, #1b7837, #00441b]'
    );
  });

  it('should support variables and statements', () => {
    expr('$col = rgb 255 204 0', '#ffcc00');
    expr('$num = 2^8 - 1', '255');
    expr('$lst = #444 #888', '[#444444, #888888]');
    expr(
      '$my = yellow black; bezier $my -> 10',
      '[#ffff00, #e0df11, #c1c018, #a3a21b, #86851b, #6b691a, #504e17, #373514, #1f1e0d, #000000]'
    );
  });
});
