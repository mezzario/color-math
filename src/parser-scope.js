/// <reference path="../typings/tsd.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require("lodash");
var utils_1 = require("./utils");
var eval_scope_1 = require("./eval-scope");
var LocPos = (function () {
    function LocPos(ln, col, i) {
        this.ln = ln;
        this.col = col;
        this.i = i;
    }
    LocPos.prototype.toString = function () {
        return this.ln + ":" + this.col + "," + this.i;
    };
    return LocPos;
}());
exports.LocPos = LocPos;
var Loc = (function () {
    function Loc(loc) {
        this.start = new LocPos(loc.first_line, loc.first_column, loc.range[0]);
        this.end = new LocPos(loc.last_line, loc.last_column, loc.range[1]);
    }
    Loc.prototype.toString = function () {
        return this.start + ".." + this.end;
    };
    return Loc;
}());
exports.Loc = Loc;
var Node = (function () {
    function Node($type, $loc) {
        this.$type = $type;
        this.$loc = $loc;
        if ($loc)
            this.$loc = $loc instanceof Loc ? $loc : new Loc($loc);
    }
    Node.prototype.getDto = function (withLoc) {
        var _this = this;
        if (withLoc === void 0) { withLoc = true; }
        var clone;
        var transform = function (o) {
            if (o instanceof Node)
                return o.getDto(withLoc);
            else if (o instanceof Loc)
                return _this.$loc.toString();
            else if (utils_1.isColor(o))
                return utils_1.formatColor(o);
            else if (o instanceof eval_scope_1.ColorScale)
                return String(o);
        };
        clone = function (value) { return _.cloneDeep(value, function (o) { return o !== _this ? transform(o) : void 0; }); };
        var dto = clone(this);
        if (!withLoc)
            delete dto.$loc;
        return dto;
    };
    Node.prototype.evaluate = function (e) {
        //if (this.$eval === void 0) {
        var value = this.evaluateInternal(e);
        if (value == null)
            utils_1.throwError("evaluation of '" + this.$type + "' is not supported by '" + e.$type + "'", this.$loc);
        this.$eval = value;
        //}
        return this.$eval;
    };
    return Node;
}());
exports.Node = Node;
var Program = (function (_super) {
    __extends(Program, _super);
    function Program(statements, $loc) {
        _super.call(this, "program", $loc);
        this.statements = statements;
    }
    Program.prototype.getDto = function (withLoc) {
        if (withLoc === void 0) { withLoc = true; }
        var dto = _super.prototype.getDto.call(this, withLoc);
        delete dto.$eval;
        return dto;
    };
    Program.prototype.evaluateInternal = function (e) {
        return e.evalProgram(this);
    };
    return Program;
}(Node));
exports.Program = Program;
var Statement = (function (_super) {
    __extends(Statement, _super);
    function Statement(expr, $loc) {
        _super.call(this, "statement", $loc);
        this.expr = expr;
    }
    Statement.prototype.getDto = function (withLoc) {
        if (withLoc === void 0) { withLoc = true; }
        var dto = _super.prototype.getDto.call(this, withLoc);
        delete dto.$eval;
        return dto;
    };
    Statement.prototype.evaluateInternal = function (e) {
        return e.evalStatement(this);
    };
    return Statement;
}(Node));
exports.Statement = Statement;
var Expr = (function (_super) {
    __extends(Expr, _super);
    function Expr($type, $loc) {
        _super.call(this, "expr." + $type, $loc);
    }
    return Expr;
}(Node));
exports.Expr = Expr;
var ParenthesesExpr = (function (_super) {
    __extends(ParenthesesExpr, _super);
    function ParenthesesExpr(expr, $loc) {
        _super.call(this, "parentheses", $loc);
        this.expr = expr;
    }
    ParenthesesExpr.prototype.evaluateInternal = function (e) {
        return e.evalParentheses(this);
    };
    return ParenthesesExpr;
}(Expr));
exports.ParenthesesExpr = ParenthesesExpr;
var NumberLiteralExpr = (function (_super) {
    __extends(NumberLiteralExpr, _super);
    function NumberLiteralExpr(value, $loc) {
        _super.call(this, "numberLiteral", $loc);
        this.value = value;
    }
    NumberLiteralExpr.prototype.evaluateInternal = function (e) {
        return e.evalNumberLiteral(this);
    };
    return NumberLiteralExpr;
}(Expr));
exports.NumberLiteralExpr = NumberLiteralExpr;
var PercentExpr = (function (_super) {
    __extends(PercentExpr, _super);
    function PercentExpr(value, $loc) {
        _super.call(this, "percent", $loc);
        this.value = value;
    }
    PercentExpr.prototype.evaluateInternal = function (e) {
        return e.evalPercent(this);
    };
    return PercentExpr;
}(Expr));
exports.PercentExpr = PercentExpr;
var ArrayLiteralExpr = (function (_super) {
    __extends(ArrayLiteralExpr, _super);
    function ArrayLiteralExpr(value, $loc) {
        _super.call(this, "arrayLiteral", $loc);
        this.value = value;
    }
    ArrayLiteralExpr.prototype.evaluateInternal = function (e) {
        return e.evalArrayLiteral(this);
    };
    return ArrayLiteralExpr;
}(Expr));
exports.ArrayLiteralExpr = ArrayLiteralExpr;
var ColorNameLiteralExpr = (function (_super) {
    __extends(ColorNameLiteralExpr, _super);
    function ColorNameLiteralExpr(value, $loc) {
        _super.call(this, "colorNameLiteral", $loc);
        this.value = value;
    }
    ColorNameLiteralExpr.prototype.evaluateInternal = function (e) {
        return e.evalColorNameLiteral(this);
    };
    return ColorNameLiteralExpr;
}(Expr));
exports.ColorNameLiteralExpr = ColorNameLiteralExpr;
var ColorHexLiteralExpr = (function (_super) {
    __extends(ColorHexLiteralExpr, _super);
    function ColorHexLiteralExpr(value, $loc) {
        _super.call(this, "colorHexLiteral", $loc);
        this.value = value;
    }
    ColorHexLiteralExpr.prototype.evaluateInternal = function (e) {
        return e.evalColorHexLiteral(this);
    };
    return ColorHexLiteralExpr;
}(Expr));
exports.ColorHexLiteralExpr = ColorHexLiteralExpr;
var ColorByNumberExpr = (function (_super) {
    __extends(ColorByNumberExpr, _super);
    function ColorByNumberExpr(value, $loc) {
        _super.call(this, "colorByNumber", $loc);
        this.value = value;
    }
    ColorByNumberExpr.prototype.evaluateInternal = function (e) {
        return e.evalColorByNumber(this);
    };
    return ColorByNumberExpr;
}(Expr));
exports.ColorByNumberExpr = ColorByNumberExpr;
var ColorByTemperatureExpr = (function (_super) {
    __extends(ColorByTemperatureExpr, _super);
    function ColorByTemperatureExpr(value, $loc) {
        _super.call(this, "colorByTemperature", $loc);
        this.value = value;
    }
    ColorByTemperatureExpr.prototype.evaluateInternal = function (e) {
        return e.evalColorByTemperature(this);
    };
    return ColorByTemperatureExpr;
}(Expr));
exports.ColorByTemperatureExpr = ColorByTemperatureExpr;
var ColorByWavelengthExpr = (function (_super) {
    __extends(ColorByWavelengthExpr, _super);
    function ColorByWavelengthExpr(value, $loc) {
        _super.call(this, "colorByWavelength", $loc);
        this.value = value;
    }
    ColorByWavelengthExpr.prototype.evaluateInternal = function (e) {
        return e.evalColorByWavelength(this);
    };
    return ColorByWavelengthExpr;
}(Expr));
exports.ColorByWavelengthExpr = ColorByWavelengthExpr;
var ColorBySpaceParams = (function (_super) {
    __extends(ColorBySpaceParams, _super);
    function ColorBySpaceParams(space, params, $loc) {
        _super.call(this, "colorBySpaceParams", $loc);
        this.space = space;
        this.params = params;
    }
    ColorBySpaceParams.prototype.evaluateInternal = function (e) {
        return e.evalColorBySpaceParams(this);
    };
    return ColorBySpaceParams;
}(Expr));
exports.ColorBySpaceParams = ColorBySpaceParams;
var RandomColorExpr = (function (_super) {
    __extends(RandomColorExpr, _super);
    function RandomColorExpr($loc) {
        _super.call(this, "randomColor", $loc);
    }
    RandomColorExpr.prototype.evaluateInternal = function (e) {
        return e.evalRandomColor(this);
    };
    return RandomColorExpr;
}(Expr));
exports.RandomColorExpr = RandomColorExpr;
var ScaleExpr = (function (_super) {
    __extends(ScaleExpr, _super);
    function ScaleExpr(colors, domain, mode, $loc) {
        _super.call(this, "scale", $loc);
        this.colors = colors;
        this.domain = domain;
        this.mode = mode;
    }
    ScaleExpr.prototype.evaluateInternal = function (e) {
        return e.evalScale(this);
    };
    return ScaleExpr;
}(Expr));
exports.ScaleExpr = ScaleExpr;
var BezierExpr = (function (_super) {
    __extends(BezierExpr, _super);
    function BezierExpr(colors, $loc) {
        _super.call(this, "bezier", $loc);
        this.colors = colors;
    }
    BezierExpr.prototype.evaluateInternal = function (e) {
        return e.evalBezier(this);
    };
    return BezierExpr;
}(Expr));
exports.BezierExpr = BezierExpr;
var CubehelixExpr = (function (_super) {
    __extends(CubehelixExpr, _super);
    function CubehelixExpr($loc) {
        _super.call(this, "cubehelix", $loc);
    }
    CubehelixExpr.prototype.evaluateInternal = function (e) {
        return e.evalCubehelix(this);
    };
    return CubehelixExpr;
}(Expr));
exports.CubehelixExpr = CubehelixExpr;
var BrewerConstExpr = (function (_super) {
    __extends(BrewerConstExpr, _super);
    function BrewerConstExpr(name, $loc) {
        _super.call(this, "brewerConst", $loc);
        this.name = name;
    }
    BrewerConstExpr.prototype.evaluateInternal = function (e) {
        return e.evalBrewerConst(this);
    };
    return BrewerConstExpr;
}(Expr));
exports.BrewerConstExpr = BrewerConstExpr;
var ParamExpr = (function (_super) {
    __extends(ParamExpr, _super);
    function ParamExpr($type, obj, name, value, operator, $loc) {
        _super.call(this, $type, $loc);
        this.obj = obj;
        this.name = name;
        this.value = value;
        this.operator = operator;
    }
    ParamExpr.prototype.evaluateInternal = function (e) {
        return e.evalParam(this);
    };
    return ParamExpr;
}(Expr));
exports.ParamExpr = ParamExpr;
var GetParamExpr = (function (_super) {
    __extends(GetParamExpr, _super);
    function GetParamExpr(obj, name, $loc) {
        _super.call(this, "getParam", obj, name, void 0, void 0, $loc);
    }
    return GetParamExpr;
}(ParamExpr));
exports.GetParamExpr = GetParamExpr;
var SetParamExpr = (function (_super) {
    __extends(SetParamExpr, _super);
    function SetParamExpr(obj, name, value, operator, $loc) {
        _super.call(this, "setParam", obj, name, value, operator, $loc);
    }
    return SetParamExpr;
}(ParamExpr));
exports.SetParamExpr = SetParamExpr;
var OperationExpr = (function (_super) {
    __extends(OperationExpr, _super);
    function OperationExpr($type, operator, options, $loc) {
        _super.call(this, "operation." + $type, $loc);
        this.operator = operator;
        this.options = options;
    }
    return OperationExpr;
}(Expr));
exports.OperationExpr = OperationExpr;
var UnaryExpr = (function (_super) {
    __extends(UnaryExpr, _super);
    function UnaryExpr(value, operator, options, $loc) {
        _super.call(this, "unary", operator, options, $loc);
        this.value = value;
        this.operator = operator;
        this.options = options;
    }
    UnaryExpr.prototype.evaluateInternal = function (e) {
        return e.evalUnaryOperation(this);
    };
    return UnaryExpr;
}(OperationExpr));
exports.UnaryExpr = UnaryExpr;
var BinaryExpr = (function (_super) {
    __extends(BinaryExpr, _super);
    function BinaryExpr(left, right, operator, options, $loc) {
        _super.call(this, "binary", operator, options, $loc);
        this.left = left;
        this.right = right;
        this.operator = operator;
        this.options = options;
    }
    BinaryExpr.prototype.evaluateInternal = function (e) {
        return e.evalBinaryOperation(this);
    };
    return BinaryExpr;
}(OperationExpr));
exports.BinaryExpr = BinaryExpr;
var GetVarExpr = (function (_super) {
    __extends(GetVarExpr, _super);
    function GetVarExpr(name, $loc) {
        _super.call(this, "getVar", $loc);
        this.name = name;
    }
    GetVarExpr.prototype.evaluateInternal = function (e) {
        return e.evalGetVar(this);
    };
    return GetVarExpr;
}(Expr));
exports.GetVarExpr = GetVarExpr;
var SetVarExpr = (function (_super) {
    __extends(SetVarExpr, _super);
    function SetVarExpr(name, value, $loc) {
        _super.call(this, "setVar", $loc);
        this.name = name;
        this.value = value;
    }
    SetVarExpr.prototype.evaluateInternal = function (e) {
        return e.evalSetVar(this);
    };
    return SetVarExpr;
}(Expr));
exports.SetVarExpr = SetVarExpr;
//# sourceMappingURL=parser-scope.js.map