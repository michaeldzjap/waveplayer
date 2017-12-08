import path from 'path';
import webpack from 'webpack';

export default {
    entry: {
        playlist: './src/playlist'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]'
    },
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: path.resolve(__dirname, 'node_modules'),
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names: ['manifest']
        })
    ],
    devtool: 'cheap-module-eval-source-map'
};
