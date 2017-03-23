const Chroma = require("chroma-js")

export default class ColorScale {
    constructor(name, params, scaleParams) {
        this.name = name.toLowerCase()
        this.params = params || []
        this.scaleParams = scaleParams || []
    }

    toString() {
        return `<colorScale.${this.name}>`
    }

    clone() {
        let obj = new ColorScale(this.name, this.params.slice(0), this.scaleParams.slice(0))
        return obj
    }

    _getParamValue(params, name) {
        for (let i = 0; i < params.length; i++)
            if (params[i].name === name)
                return params[i].value
    }

    _applyParams(fn, params) {
        for (let i = 0; i < params.length; i++)
            if (params[i].name !== "colors")
                fn = fn[params[i].name](params[i].value)
    }

    getFn() {
        let colors = this._getParamValue(this.scaleParams, "colors")
        let ctor = Chroma[this.name]
        let fn = colors ? ctor(colors) : ctor()

        this._applyParams(fn, this.params)

        if (this.name !== "scale")
            fn = fn.scale()

        this._applyParams(fn, this.scaleParams)

        return fn
    }
}
