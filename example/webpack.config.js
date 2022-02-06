import path from 'path';

export default {
    mode: 'development',
    entry: {
        playlist: './src/playlist',
        simple: './src/simple',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: path.resolve(__dirname, 'node_modules'),
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
    },
    devtool: 'eval-cheap-module-source-map',
    optimization: {
        emitOnErrors: false,
    },
};
