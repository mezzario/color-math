/// <reference path="../typings/tsd.d.ts" />

import * as _ from "lodash";
import * as ReadLine from "readline";
import * as CliColor from "cli-color";
import * as ColorMath from "../index";

var rl = ReadLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.setPrompt("> ");
rl.prompt();

rl
    .on("line", (line: string) => {
        let flags = { withAst: false, less: false };
        line = parseFlags(line, flags);

        if (line) {
            var res = ColorMath.evaluate(line, {
                evalType: flags.less ? ColorMath.EvaluatorType.Less : ColorMath.EvaluatorType.Core,
                withAst: flags.withAst
            });

            if (res.error != null)
                console.log(CliColor.red(`\n${res.error}\n`));
            else if (flags.withAst)
                console.log(`\n${res.astStr}\n`);
            else
                console.log(`= ${res.resultStr}\n`);
        }

        rl.prompt();
    })
    .on("close", () => {
        process.exit(0);
    });

function parseFlags(line: string, dict) {
    let i = 0;
    let keys = _.keys(dict);

    while (i < keys.length) {
        let key = keys[i];
        let lineNext = line.replace(new RegExp(`^\\s*${key}\\s+`, "i"), "");
        let value = lineNext !== line;

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
