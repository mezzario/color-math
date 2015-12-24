// --- lexer ---

%lex

%options   flex case-insensitive ranges

%%

\s+                 /* skip whitespace */;

/* supported number literal formats:
   - binary:      0b01100101
   - octal (ES6): 0o35
   - decimal:     5
   - hexadecimal: 0xfe */
((0|[1-9]\d*|)\.\d+|(0|[1-9]\d*)\.\d*|\d+|0o[0-7]+|0x[a-f\d]+|0b[01]+)\b
    return "NUMBER";

/* supported color literal formats:
   #fff
   #ffffff
   #ffffffff
   fff
   ffffff
   ffffffff

   UNSUPPORTED:
   - color literals which can be treated as numbers,
     e.g. "111"; add "#" before literal to treat as color */
"#"?([a-f\d]{3}|[a-f\d]{6}|[a-f\d]{8})\b       return "COLOR_HEX";

("aliceblue"|"antiquewhite"|"aqua"|"aquamarine"|"azure"|"beige"|"bisque"|"black"|"blanchedalmond"|"blue"|"blueviolet"|"brown"|"burlywood"|"cadetblue"|"chartreuse"|"chocolate"|"coral"|"cornflowerblue"|"cornsilk"|"crimson"|"cyan"|"darkblue"|"darkcyan"|"darkgoldenrod"|"darkgray"|"darkgreen"|"darkgrey"|"darkkhaki"|"darkmagenta"|"darkolivegreen"|"darkorange"|"darkorchid"|"darkred"|"darksalmon"|"darkseagreen"|"darkslateblue"|"darkslategray"|"darkslategrey"|"darkturquoise"|"darkviolet"|"deeppink"|"deepskyblue"|"dimgray"|"dimgrey"|"dodgerblue"|"firebrick"|"floralwhite"|"forestgreen"|"fuchsia"|"gainsboro"|"ghostwhite"|"gold"|"goldenrod"|"gray"|"green"|"greenyellow"|"grey"|"honeydew"|"hotpink"|"indianred"|"indigo"|"ivory"|"khaki"|"lavender"|"lavenderblush"|"lawngreen"|"lemonchiffon"|"lightblue"|"lightcoral"|"lightcyan"|"lightgoldenrodyellow"|"lightgray"|"lightgreen"|"lightgrey"|"lightpink"|"lightsalmon"|"lightseagreen"|"lightskyblue"|"lightslategray"|"lightslategrey"|"lightsteelblue"|"lightyellow"|"lime"|"limegreen"|"linen"|"magenta"|"maroon"|"mediumaquamarine"|"mediumblue"|"mediumorchid"|"mediumpurple"|"mediumseagreen"|"mediumslateblue"|"mediumspringgreen"|"mediumturquoise"|"mediumvioletred"|"midnightblue"|"mintcream"|"mistyrose"|"moccasin"|"navajowhite"|"navy"|"oldlace"|"olive"|"olivedrab"|"orange"|"orangered"|"orchid"|"palegoldenrod"|"palegreen"|"paleturquoise"|"palevioletred"|"papayawhip"|"peachpuff"|"peru"|"pink"|"plum"|"powderblue"|"purple"|"rebeccapurple"|"red"|"rosybrown"|"royalblue"|"saddlebrown"|"salmon"|"sandybrown"|"seagreen"|"seashell"|"sienna"|"silver"|"skyblue"|"slateblue"|"slategray"|"slategrey"|"snow"|"springgreen"|"steelblue"|"tan"|"teal"|"thistle"|"tomato"|"turquoise"|"violet"|"wheat"|"white"|"whitesmoke"|"yellow"|"yellowgreen")\b
    return "COLOR_NAME";

("brewer"|"br")"."("OrRd"|"PuBu"|"BuPu"|"Oranges"|"BuGn"|"YlOrBr"|"YlGn"|"Reds"|"RdPu"|"Greens"|"YlGnBu"|"Purples"|"GnBu"|"Greys"|"YlOrRd"|"PuRd"|"Blues"|"PuBuGn"|"Spectral"|"RdYlGn"|"RdBu"|"PiYG"|"PRGn"|"RdYlBu"|"BrBG"|"RdGy"|"PuOr"|"Set2"|"Accent"|"Set1"|"Set3"|"Dark2"|"Paired"|"Pastel2"|"Pastel1")\b
    return "BREWER_CONST";

("random"|"rand")\b                            return "COLOR_RANDOM";
("number"|"num"|"n")\b                         return "COLOR_NUMBER";
("temperature"|"temp"|"t")\b                   return "COLOR_TEMPERATURE";
("wavelength"|"wl")\b                          return "COLOR_WAVELENGTH";

"rgb""a"?\b                                    return "CSPACE_RGB";
"argb"\b                                       return "CSPACE_ARGB";
"cmy""a"?\b                                    return "CSPACE_CMY";
"cmyk""a"?\b                                   return "CSPACE_CMYK";
"hsl""a"?\b                                    return "CSPACE_HSL";
"hs"("v"|"b")"a"?\b                            return "CSPACE_HSV";
"hsi""a"?\b                                    return "CSPACE_HSI";
"lab""a"?\b                                    return "CSPACE_CIELAB";
"lch""a"?\b                                    return "CSPACE_CIELCH";
"hcl""a"?\b                                    return "CSPACE_CIEHCL";

"scale"\b                                      return "SCALE";
"bezier"\b                                     return "SCALE_BEZIER";
"cubehelix"\b                                  return "SCALE_CUBEHELIX";

"@"(\w+".")*\w+\b                              return "PARAM"
"$"\w*\b|"$"                                   return "VARIABLE"

"%%"                                           return "%%";
"%"                                            return "%";
"~"                                            return "~";
"+="                                           return "+=";
"+"                                            return "+";
"->"                                           return "->";
"-="                                           return "-=";
"-"                                            return "-";
"^^"                                           return "^^";
"^*"                                           return "^*";
"!^"                                           return "!^";
"^"                                            return "^";
"**"                                           return "**";
"!*"                                           return "!*";
"<*"                                           return "<*";
"*>"                                           return "*>";
"*="                                           return "*=";
"*"                                            return "*";
"/="                                           return "/=";
"/"                                            return "/";
"("                                            return "(";
")"                                            return ")";
"{"                                            return "{";
"}"                                            return "}";
"["                                            return "[";
"]"                                            return "]";
","                                            return ",";
"="                                            return "=";
"|"                                            return "|";
"<<<"                                          return "<<<";
">>>"                                          return ">>>";
"<<"                                           return "<<";
">>"                                           return ">>";
":"                                            return ":";
";"                                            return ";";

<<EOF>>                                        return "EOF";
.                                              return "INVALID";

%%

/lex

// --- parser ---

%right                                         "=" "+=" "-=" "*=" "/="
%nonassoc                                      "%%"
%left                                          "+" "-"
%left                                          "*" "/" "|" "<<" ">>" "<<<" ">>>" "!*" "**" "<*" "*>" "^*" "^^" "!^"
%left                                          "^"
%nonassoc                                      "%"
%left                                          "UMINUS" "~"
%nonassoc                                      "[" "]"
%left                                          "PARAM"
%nonassoc                                      "COLOR_NUMBER" "COLOR_TEMPERATURE"
                                               "CSPACE_RGB" "CSPACE_ARGB" "CSPACE_CMY" "CSPACE_CMYK" "CSPACE_HSL"
                                               "CSPACE_HSV" "CSPACE_HSI" "CSPACE_CIELAB" "CSPACE_CIELCH" "CSPACE_CIEHCL"
                                               "->"
%nonassoc                                      "CORRECT_LIGHTNESS"

%start                                         program

%%

program:
    statements                                 { return new yy.Program($1, @$); }
;

statements:
    statement                                  -> [new yy.Statement($1, @$)]
  | statements statement                       -> $1.concat(new yy.Statement($2, @2))
;

statement:
    expr EOF                                   -> $1
  | expr ";"                                   -> $1
  | expr ";" EOF                               -> $1
;

number:
    NUMBER                                     -> new yy.NumberLiteralExpr($1, @$)
;

exprList:
    expr                                       -> [$1]
  | exprList "," expr                          -> $1.concat($3)
;

arrayLiteral:
    "[" exprList "]"                           -> new yy.ArrayLiteralExpr($2, @$)
;

colorSpace2:
    CSPACE_RGB                                 -> "rgb"
  | CSPACE_CMYK                                -> "cmyk"
  | CSPACE_HSL                                 -> "hsl"
  | CSPACE_HSV                                 -> "hsv"
  | CSPACE_HSI                                 -> "hsi"
  | CSPACE_CIELAB                              -> "lab"
  | CSPACE_CIELCH                              -> "lch"
  | CSPACE_CIEHCL                              -> "hcl"
;

colorSpace:
    colorSpace2
  | CSPACE_ARGB                                -> "argb"
  | CSPACE_CMY                                 -> "cmy"
;

colorSpaceParamsList1:
    expr "," expr "," expr                     -> [$1, $3, $5]
  | expr "," expr "," expr "," expr            -> [$1, $3, $5, $7]
  | expr "," expr "," expr "," expr "," expr   -> [$1, $3, $5, $7, $9]
;

colorSpaceParamsList2:
    expr3 expr3 expr3                          -> [$1, $2, $3]
  | expr3 expr3 expr3 expr3                    -> [$1, $2, $3, $4]
  | expr3 expr3 expr3 expr3 expr3              -> [$1, $2, $3, $4, $5]
;

colorWithStop:
    expr3 ":" expr3                            -> [$1, $3]
;

colorsWithStopsList:
    colorWithStop                              -> [[$1[0]], [$1[1]]]
  | colorsWithStopsList "," colorWithStop      -> [$1[0].concat($3[0]), $1[1].concat($3[1])]
;

colorsWithStops:
    "[" colorsWithStopsList "]"                -> $2
;

expr3:
    number
  | number "%"                                 -> new yy.PercentExpr($1, @$)
  | COLOR_NAME                                 -> new yy.ColorNameLiteralExpr($1, @$)
  | COLOR_HEX                                  -> new yy.ColorHexLiteralExpr($1, @$)
  | COLOR_RANDOM                               -> new yy.RandomColorExpr(@$)
  | COLOR_NUMBER expr3                         -> new yy.ColorByNumberExpr($2, @$)
  | COLOR_TEMPERATURE expr3                    -> new yy.ColorByTemperatureExpr($2, @$)
  | COLOR_WAVELENGTH expr3                     -> new yy.ColorByWavelengthExpr($2, @$)
  | colorSpace "(" colorSpaceParamsList1 ")"   -> new yy.ColorBySpaceParams($1, $3, @$)
  | colorSpace "(" colorSpaceParamsList2 ")"   -> new yy.ColorBySpaceParams($1, $3, @$)
  | BREWER_CONST                               -> new yy.BrewerConstExpr($1.replace(/^.+\./, ""), @$)
  | VARIABLE                                   -> new yy.GetVarExpr($1, @$)
  | exprWParen
;

expr2:
    expr3
  | arrayLiteral
;

expr:
    expr2
  | colorSpace colorSpaceParamsList2           -> new yy.ColorBySpaceParams($1, $2, @$)

  | SCALE colorsWithStops                      -> new yy.ScaleExpr($2[0], $2[1], void 0, @$)
  | SCALE colorsWithStops colorSpace2          -> new yy.ScaleExpr($2[0], $2[1], $3, @$)
  | SCALE expr2                                -> new yy.ScaleExpr($2, void 0, void 0, @$)
  | SCALE expr2 colorSpace2                    -> new yy.ScaleExpr($2, void 0, $3, @$)
  | SCALE_BEZIER expr2                         -> new yy.BezierExpr($2, @$)
  | SCALE_CUBEHELIX                            -> new yy.CubehelixExpr(@$)

  | expr PARAM                                 -> new yy.GetParamExpr($1, $2.replace(/^@/, ""), @$)
  | expr PARAM      expr2                      -> new yy.SetParamExpr($1, $2.replace(/^@/, ""), $3, void 0, @$)
  | expr PARAM  "=" expr2                      -> new yy.SetParamExpr($1, $2.replace(/^@/, ""), $4, void 0, @$)
  | expr PARAM "+=" expr2                      -> new yy.SetParamExpr($1, $2.replace(/^@/, ""), $4, "+", @$)
  | expr PARAM "-=" expr2                      -> new yy.SetParamExpr($1, $2.replace(/^@/, ""), $4, "-", @$)
  | expr PARAM "*=" expr2                      -> new yy.SetParamExpr($1, $2.replace(/^@/, ""), $4, "*", @$)
  | expr PARAM "/=" expr2                      -> new yy.SetParamExpr($1, $2.replace(/^@/, ""), $4, "/", @$)

  | "-" expr %prec "UMINUS"                    -> new yy.UnaryExpr($2, $1, void 0, @$)
  | "~" expr                                   -> new yy.UnaryExpr($2, $1, void 0, @$)
  | "+" expr %prec "CORRECT_LIGHTNESS"         -> new yy.UnaryExpr($2, $1, void 0, @$)

  | expr "+" expr                              -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "-" expr                              -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "*" expr                              -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "/" expr                              -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "^" expr                              -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "%%" expr                             -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "<<" expr                             -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr ">>" expr                             -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "<<<" expr                            -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr ">>>" expr                            -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "!*" expr                             -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "**" expr                             -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "<*" expr                             -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "*>" expr                             -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "^*" expr                             -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "^^" expr                             -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "!^" expr                             -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr "->" expr                             -> new yy.BinaryExpr($1, $3, $2, void 0, @$)

  | expr  "|"                           expr   -> new yy.BinaryExpr($1, $3, $2, void 0, @$)
  | expr  "|" "{" colorSpace2       "}" expr   -> new yy.BinaryExpr($1, $6, $2, { mode: $4 }, @$)
  | expr  "|" "{" expr              "}" expr   -> new yy.BinaryExpr($1, $6, $2, { ratio: $4 }, @$)
  | expr  "|" "{" expr3 colorSpace2 "}" expr   -> new yy.BinaryExpr($1, $7, $2, { mode: $5, ratio: $4 }, @$)

  | expr2 "[" expr "]"                         -> new yy.ArrayElementExpr($1, $3, @$)
  | VARIABLE "=" expr                          -> new yy.SetVarExpr($1, $3, @$)
;

exprWParen:
  "(" expr ")"                                 -> new yy.ParenthesesExpr($2, @$)
;

%%
