const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        playlist: './src/playlist',
        simple: './src/simple',
        view: './src/view',
    },
    output: {
        filename: '[name].js',
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
