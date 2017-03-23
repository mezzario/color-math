import Webpack from "webpack"
import Path from "path"

const { NODE_ENV } = process.env

export default {
    entry: [
        "./src"
    ],

    output: {
        path: Path.join(__dirname, "dist"),
        filename: `color-math${NODE_ENV === "production" ? ".min" : ""}.js`,
        library: "ColorMath",
        libraryTarget: "umd"
        //pathinfo: true
    },

    node: {
        fs: "empty"
    },

    module: {
        rules: [{
            test: /\.js$/,
            loader: "babel-loader",
            exclude: /node_modules/
        }]
    },

    plugins: [
        new Webpack.optimize.OccurrenceOrderPlugin(),
        new Webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(NODE_ENV)
        }),
        ...(NODE_ENV === "production"
            ? [new Webpack.optimize.UglifyJsPlugin({
                compressor: {
                    warnings: false
                    // pure_getters: true,
                    // unsafe: true,
                    // unsafe_comps: true,
                    // screw_ie8: false
                }
            })] : [])
    ]
}
