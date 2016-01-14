# color-math
ColorMath is a parser which is very similar to ordinary calculator, but instead of numbers it mainly operates with colors.

### Install
`npm i color-math -S`

### Usage example
```javascript
var ColorMath = require("color-math");

var result = ColorMath.evaluate("red | green");
// will return color which is result of mixing red and green colors

result = ColorMath.evaluate("red @a 30%")
// set color's alpha channel to 30%

result = ColorMath.evaluate("(#222 + #444) / 2")
// arithmetic operations with colors and numbers
```

[chroma.js](https://github.com/gka/chroma.js/) color library is used internally to manipulate colors and wrap results.

### A read–eval–print loop (REPL)

```
npm i
npm start
```

Interpreter will start. Now you can type your expressions.

### Demo and documentation

Please go to [http://colormath.net/](http://colormath.net/) to test your expressions, visualize results and read about all available features with examples.
