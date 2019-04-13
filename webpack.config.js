const path = require('path')

module.exports = {
    devtool: 'inline-source-map',
    mode: 'production',
    entry: './src/browser/index.js',
    watch: true,
    module: {
        rules: [
            
        ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dom')
    }
}