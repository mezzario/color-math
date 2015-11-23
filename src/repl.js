/// <reference path="../typings/tsd.d.ts" />
var _ = require("lodash");
var ReadLine = require("readline");
var CliColor = require("cli-color");
var ColorMath = require("../index");
var rl = ReadLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});
rl.setPrompt("> ");
rl.prompt();
rl
    .on("line", function (line) {
    var flags = { withAst: false, less: false };
    line = parseFlags(line, flags);
    if (line) {
        var res = ColorMath.evaluate(line, {
            evalType: flags.less ? ColorMath.EvaluatorType.Less : ColorMath.EvaluatorType.Core,
            withAst: flags.withAst
        });
        if (res.error != null)
            console.log(CliColor.red("\n" + res.error + "\n"));
        else if (flags.withAst)
            console.log("\n" + res.astStr + "\n");
        else
            console.log("= " + res.resultStr + "\n");
    }
    rl.prompt();
})
    .on("close", function () {
    process.exit(0);
});
function parseFlags(line, dict) {
    var i = 0;
    var keys = _.keys(dict);
    while (i < keys.length) {
        var key = keys[i];
        var lineNext = line.replace(new RegExp("^\\s*" + key + "\\s+", "i"), "");
        var value = lineNext !== line;
        if (value) {
            line = lineNext;
            dict[key] = true;
            keys.splice(i, 1);
            i = 0;
        }
        else
            i++;
    }
    return line;
}
//# sourceMappingURL=repl.js.map