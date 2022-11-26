const path = require('path');

module.exports = {
    mode: 'development',
    entry: ['./src/simple', './src/playlist'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.ts'],
    },
    devtool: 'eval-cheap-module-source-map',
};
