# 🤹 color-math
[ColorMath](http://colormath.net/) is an expression parser and evaluator dealing with color representations. Using special grammar it supports various color models, mixing, blending, channels manipulation, scaling, bezier interpolation and more. It also supports transpiling most of the expressions to [less.js](https://github.com/less/less.js).

## Install

`npm i color-math -S`

## Usage Example

```javascript
import {evaluate as cm, LessEvaluator} from "color-math";

// Will return color which is result of mixing red and green colors.
const result = cm("red | green");
// Prints "#804000" (`result.result` is a chroma.js instance; see link below).
console.log(result.result.hex());

// Set color's alpha channel to 30%.
result = cm("red @a 30%");
// Prints "rgba(255, 0, 0, 0.3)".
console.log(result.result.css());

// Arithmetic operations with colors and numbers.
result = cm("(#222 + #444) / 2");
console.log(result.resultStr); // Prints "#333333".

// Transpile to Less.
result = cm("rgb 165 42 42 >> .2", {evaluator: new LessEvaluator()});
// Prints "saturate(rgb(165, 42, 42), 20%, relative)".
console.log(result.result);
```

[chroma.js](https://github.com/gka/chroma.js/) color library is used internally to manipulate colors and wrap results.

## Expressions Cheatsheet

Click on expression to visualize result in [ColorMath](http://colormath.net/) online parser.

Use parenthesis to control evaluation order and build complex expressions.

### Ways to Define Color

Expression | Description
--- | ---
[`#ffcc00`](http://colormath.net/#/?%23ffcc00) | hexadecimal color representation
[`ffcc00`](http://colormath.net/#/?ffcc00) | hexadecimal color representation without hash symbol
[`#fc0`](http://colormath.net/#/?%23fc0) | short hexadecimal color representation
[`fc0`](http://colormath.net/#/?fc0) | short hexadecimal color representation without hash symbol
[`skyblue`](http://colormath.net/#/?skyblue) | color literals from [W3C/X11](http://www.w3.org/TR/css3-color/#svg-color) specification
[`rand`](http://colormath.net/#/?rand) | generate random color
[`num 33023`](http://colormath.net/#/?num+33023) | color from number
[`temp 3500`](http://colormath.net/#/?temp+3500) | color by temperature in Kelvin
[`wl 560`](http://colormath.net/#/?wl+560) | color from wavelength value

### Color Models

Expression | Description
--- | ---
[`rgb 127 255 212`](http://colormath.net/#/?rgb+127+255+212) | RGB color model
[`rgba 135 206 235 75%`](http://colormath.net/#/?rgba+135+206+235+75%25) | RGB color model with alpha channel
[`argb .7 255 99 71`](http://colormath.net/#/?argb+.7+255+99+71) | RGB color model with alpha channel (first)
[`cmyk .43 .12 0 .8`](http://colormath.net/#/?cmyk+.43+.12+0+.8) | CMYK color model
[`cmyka 0 .61 .72 0 60%`](http://colormath.net/#/?cmyka+0+.61+.72+0+60%25) | CMYK color model with alpha channel
[`cmy .5 0 .17`](http://colormath.net/#/?cmy+.5+0+.17) | CMY color model
[`cmya 0 .61 .72 .65`](http://colormath.net/#/?cmya+0+.61+.72+.65) | CMY color model with alpha channel
[`hsl 159.8 100% 75%`](http://colormath.net/#/?hsl+159.8+100%25+75%25) | HSL color model
[`hsla 197 .71 .73 55%`](http://colormath.net/#/?hsla+197+.71+.73+55%25) | HSL color model with alpha channel
[`hsv 160 .5 1`](http://colormath.net/#/?hsv+160+.5+1) | HSV (also known as HSB) color model
[`hsb 197 .43 .92`](http://colormath.net/#/?hsb+197+.43+.92) | HSB color model (alias for HSV)
[`hsva 9 .72 1 50%`](http://colormath.net/#/?hsva+9+.72+1+50%25) | HSV color model with alpha channel
[`hsi 161 .36 .78`](http://colormath.net/#/?hsi+161+.36+.78) | HSI color model
[`hsia 196 .30 .75 45%`](http://colormath.net/#/?hsia+196+.30+.75+45%25) | HSI color model with alpha channel
[`lab 92 (-46) 9.7`](http://colormath.net/#/?lab+92+%28-46%29+9.7) | LAB color model
[`laba 79 (-14.8) (-21) 40%`](http://colormath.net/#/?laba+79+%28-14.8%29+%28-21%29+40%25) | LAB color model with alpha channel
[`lch 92 46.5 168`](http://colormath.net/#/?lch+92+46.5+168) | LCH color model
[`lcha 79 26 235 35%`](http://colormath.net/#/?lcha+79+26+235+35%25) | LCH color model with alpha channel
[`hcl 168 46.5 92`](http://colormath.net/#/?hcl+168+46.5+92) | HCL color model (reversed LCH)
[`hcla 235 26 79 35%`](http://colormath.net/#/?hcla+235+26+79+35%25) | HCL color model with alpha channel

### Color Operations

Expression | Description
--- | ---
[`#444 * 2`](http://colormath.net/#/?%23444+%2A+2) | arithmetic operations with numbers
[`skyblue - 0xf`](http://colormath.net/#/?skyblue+-+0xf) | arithmetic operations with numbers
[`~red`](http://colormath.net/#/?~red) | invert color
[`red \| green`](http://colormath.net/#/?red+%7C+green) | mix colors
[`red \| {25%} green`](http://colormath.net/#/?red+%7C+%7B25%25%7D+green) | mix colors in variable proportion
[`red \| {25% hsl} green`](http://colormath.net/#/?red+%7C+%7B25%25+hsl%7D+green) | mix colors in variable proportion and specific color model
[`red \| {hsl} green`](http://colormath.net/#/?red+%7C+%7Bhsl%7D+green) | mix colors in specific color model
[`hotpink << 50%`](http://colormath.net/#/?hotpink+%3C%3C+50%25) | desaturate color
[`rgb 165 42 42 >> .2`](http://colormath.net/#/?rgb+165+42+42+%3E%3E+.2) | saturate color
[`temp 4000 <<< 30%`](http://colormath.net/#/?temp+4000+%3C%3C%3C+30%25) | darken color
[`#fc0 >>> 70%`](http://colormath.net/#/?%23fc0+%3E%3E%3E+70%25) | lighten color
[`pink %% hotpink`](http://colormath.net/#/?pink+%25%25+hotpink) | compute WCAG contrast ratio between two colors

### Color Blending

Expression | Description
--- | ---
[`#222 + #444`](http://colormath.net/#/?%23222+%2B+%23444) | add
[`#ccc - #111`](http://colormath.net/#/?%23ccc+-+%23111) | subtract
[`#ff6600 * #ccc`](http://colormath.net/#/?%23ff6600+*+%23ccc) | multiply
[`#222 / #444`](http://colormath.net/#/?%23222+%2F+%23444) | divide
[`skyblue <<< tomato`](http://colormath.net/#/?skyblue+%3C%3C%3C+tomato) | darken
[`skyblue >>> tomato`](http://colormath.net/#/?skyblue+%3E%3E%3E+tomato) | lighten
[`#ff6600 !* #00ff00`](http://colormath.net/#/?%23ff6600+!*+%2300ff00) | screen
[`#ff6600 ** #999`](http://colormath.net/#/?%23ff6600+**+%23999) | overlay
[`olive <* pink`](http://colormath.net/#/?olive+%3C*+pink) | hard light
[`olive *> pink`](http://colormath.net/#/?olive+*%3E+pink) | soft light
[`ffcc00 ^* ccc`](http://colormath.net/#/?ffcc00+%5E*+ccc) | difference
[`ffcc00 ^^ ccc`](http://colormath.net/#/?ffcc00+%5E%5E+ccc) | exclusion
[`ffcc00 !^ ccc`](http://colormath.net/#/?ffcc00+!%5E+ccc) | negate
[`indigo << red`](http://colormath.net/#/?indigo+%3C%3C+red) | burn
[`indigo >> red`](http://colormath.net/#/?indigo+%3E%3E+red) | dodge

### Color Channels Manipulation

Expression | Description
--- | ---
[`brown @red`](http://colormath.net/#/?brown+%40red) | get channel's value using its name or synonym
[`#ffcc00 @g`](http://colormath.net/#/?%23ffcc00+%40g) | get channel's value using its name or synonym
[`t 5000 @cmyk.y`](http://colormath.net/#/?t+5000+%40cmyk.y) | get channel's value using its name or synonym
[`aquamarine @a = .3`](http://colormath.net/#/?aquamarine+%40a+%3D+.3) | set channel's absolute value
[`rgb 5 7 9 @hsl.h 90`](http://colormath.net/#/?rgb+5+7+9+%40hsl.h+90) | set channel's absolute value
[`#000 @lightness 50%`](http://colormath.net/#/?%23000+%40lightness+50%25) | set channel's absolute value
[`red @a /= 2`](http://colormath.net/#/?red+%40a+%2F%3D+2) | set relative channel's value
[`ffcc00 @rgb.r -= 50`](http://colormath.net/#/?ffcc00+%40rgb.r+-%3D+50) | set relative channel's value
[`tomato @s *= 30%`](http://colormath.net/#/?tomato+%40s+*%3D+30%25) | set relative channel's value
[`olive @n`](http://colormath.net/#/?olive+%40n) | get color's numeric value
[`fff @n 0`](http://colormath.net/#/?fff+%40n+0) | set color's absolute numeric value
[`#0080ff @n /= 2`](http://colormath.net/#/?%230080ff+%40n+%2F%3D+2) | set color's relative numeric value
[`#ffe3cd @t`](http://colormath.net/#/?%23ffe3cd+%40t) | get color's temperature in Kelvin
[`red @t 3500`](http://colormath.net/#/?red+%40t+3500) | set color's absolute temperature
[`ffe3cd @t += 500`](http://colormath.net/#/?ffe3cd+%40t+%2B%3D+500) | set color's relative temperature

### Color Scales

Expression | Description
--- | ---
[`scale (red 0f0 blue)`](http://colormath.net/#/?scale+(red+0f0+blue)) | scale list of colors (make gradient)
[`scale (yellow 008ae5) -> 20`](http://colormath.net/#/?scale+(yellow+008ae5)+-%3E+20) | grab n equi-distant colors from a color scale
[`scale (t 2000 t 6000)`](http://colormath.net/#/?scale+(t+2000+t+6000)) | scale list of colors
[`bezier (ff0 red #000)`](http://colormath.net/#/?bezier+(ff0+red+%23000)) | perform bezier interpolate of list of colors
[`bezier (red 0f0)`](http://colormath.net/#/?bezier+(red+0f0)) | perform bezier interpolate of list of colors
[`scale (red:.2 0f0:50%)`](http://colormath.net/#/?scale+(red%3A.2+0f0%3A50%25)) | set position of each color (inline)
[`scale (red 0f0) @domain (.2 .5)`](http://colormath.net/#/?scale+(red+0f0)+%40domain+(.2+.5)) | set position of each color (as a parameter)
[`scale (red 0f0) @pad .25`](http://colormath.net/#/?scale+(red+0f0)+%40pad+.25) | cut off a fraction of the gradient on both sides
[`bezier (red 0f0) @pad (.1 .3)`](http://colormath.net/#/?bezier+(red+0f0)+%40pad+(.1+.3)) | cut off a fraction of the gradient on both sides
[`cubehelix`](http://colormath.net/#/?cubehelix) | Dave Green's [cubehelix](http://www.mrao.cam.ac.uk/~dag/CUBEHELIX/) scaled color scheme
[`cubehelix @pad (0 .2)`](http://colormath.net/#/?cubehelix+%40pad+(0+.2)) | cut off a fraction of the gradient on both sides
[`cubehelix @start 200`](http://colormath.net/#/?cubehelix+%40start+200) | start for hue rotation
[`cubehelix @rot (-.5)`](http://colormath.net/#/?cubehelix+%40rot+(-.5)) | number of rotations
[`cubehelix @hue .5`](http://colormath.net/#/?cubehelix+%40hue+.5) | controls how saturated colors of all hues are
[`cubehelix @hue (1 0)`](http://colormath.net/#/?cubehelix+%40hue+(1+0)) | controls how saturated colors of all hues are
[`cubehelix @gamma .7`](http://colormath.net/#/?cubehelix+%40gamma+.7) | emphasize low or high intensity values
[`cubehelix @lt (.3 .8)`](http://colormath.net/#/?cubehelix+%40lt+(.3+.8)) | adjust lightness (black to white)
[`cubehelix @start 200 @rot .5`](http://colormath.net/#/?cubehelix+%40start+200+%40rot+.5) | parameters can be chained
[`+scale (black red yellow)`](http://colormath.net/#/?%2Bscale+(black+red+yellow)) | auto-correct lightness of a scale
[`+bezier (yellow 0f0 blue) -> 10`](http://colormath.net/#/?%2Bbezier+(yellow+0f0+blue)+-%3E+10) | auto-correct lightness and grab n equi-distant colors

### Numbers

Expression | Description
--- | ---
[`0b01101001`](http://colormath.net/#/?0b01101001) | binary
[`0o151`](http://colormath.net/#/?0o151) | octal
[`105`](http://colormath.net/#/?105) | decinal
[`0x69`](http://colormath.net/#/?0x69) | hexadecimal
[`55%`](http://colormath.net/#/?55%25) | percent value
[`5 + 10`](http://colormath.net/#/?5+%2B+10) | add numbers
[`-360 * 0.5 + (100 - 40)`](http://colormath.net/#/?-360+*+0.5+%2B+(100+-+40)) | arithmetic operations
[`0xf / 0b1010`](http://colormath.net/#/?0xf+%2F+0b1010) | division
[`4 ^ (2 / 4)`](http://colormath.net/#/?4+%5E+(2+%2F+4)) | take expression to a specified power

### Lists

Expression | Description
--- | ---
[`red 0f0 blue`](http://colormath.net/#/?red+0f0+blue) | define list of three colors
[`(pink >> .5) gold`](http://colormath.net/#/?(pink+%3E%3E+.5)+gold) | define list of two colors

### [Brewer](http://www.albany.edu/faculty/fboscoe/papers/harrower2003.pdf) Constants

[`OrRd`](http://colormath.net/#/?OrRd), [`PuBu`](http://colormath.net/#/?PuBu), [`BuPu`](http://colormath.net/#/?BuPu), [`Oranges`](http://colormath.net/#/?Oranges), [`BuGn`](http://colormath.net/#/?BuGn), [`YlOrBr`](http://colormath.net/#/?YlOrBr), [`YlGn`](http://colormath.net/#/?YlGn), [`Reds`](http://colormath.net/#/?Reds), [`RdPu`](http://colormath.net/#/?RdPu), [`Greens`](http://colormath.net/#/?Greens), [`YlGnBu`](http://colormath.net/#/?YlGnBu), [`Purples`](http://colormath.net/#/?Purples), [`GnBu`](http://colormath.net/#/?GnBu), [`Greys`](http://colormath.net/#/?Greys), [`YlOrRd`](http://colormath.net/#/?YlOrRd), [`PuRd`](http://colormath.net/#/?PuRd), [`Blues`](http://colormath.net/#/?Blues), [`PuBuGn`](http://colormath.net/#/?PuBuGn), [`Spectral`](http://colormath.net/#/?Spectral), [`RdYlGn`](http://colormath.net/#/?RdYlGn), [`RdBu`](http://colormath.net/#/?RdBu), [`PiYG`](http://colormath.net/#/?PiYG), [`PRGn`](http://colormath.net/#/?PRGn), [`RdYlBu`](http://colormath.net/#/?RdYlBu), [`BrBG`](http://colormath.net/#/?BrBG), [`RdGy`](http://colormath.net/#/?RdGy), [`PuOr`](http://colormath.net/#/?PuOr), [`Set2`](http://colormath.net/#/?Set2), [`Accent`](http://colormath.net/#/?Accent), [`Set1`](http://colormath.net/#/?Set1), [`Set3`](http://colormath.net/#/?Set3), [`Dark2`](http://colormath.net/#/?Dark2), [`Paired`](http://colormath.net/#/?Paired), [`Pastel2`](http://colormath.net/#/?Pastel2), [`Pastel1`](http://colormath.net/#/?Pastel1)

### Variables and Statements

Expression | Description
--- | ---
[`$col = rgb 255 204 0`](http://colormath.net/#/?%24col+%3D+rgb+255+204+0) | assign color value to a variable
[`$num = 2^8 - 1`](http://colormath.net/#/?%24num+%3D+2%5E8+-+1) | assign number value to a variable
[`$lst = #444 #888`](http://colormath.net/#/?%24lst+%3D+%23444+%23888) | assign list value to a variable
[`$my = yellow black; bezier $my`](http://colormath.net/#/?%24my+%3D+yellow+black%3B+bezier+%24my) | separate statements with semicolon

## A read–eval–print loop (REPL)

`npm start`

Interpreter will start. Now you can type your expressions.

## Demo and documentation

Please go to [http://colormath.net/](http://colormath.net/) to test your expressions, visualize results and read about all available features with examples.
