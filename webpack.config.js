const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
    devtool: 'inline-source-map',
    mode: 'production',
    entry: './src/browser/index.js',
    watch: true,
    module: {
        rules: [

        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                sourceMap: true, // Must be set to true if using source-maps in production
            }),
        ],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dom')
    }
}