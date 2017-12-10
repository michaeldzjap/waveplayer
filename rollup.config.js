import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/waveplayer.min.js',
            format: 'cjs'
        },
        sourcemap: true,
        plugins: [
            eslint(),
            babel({
                exclude: 'node_modules/**',
                plugins: ['external-helpers', 'transform-runtime'],
                runtimeHelpers: true
            }),
            uglify()
        ]
    },
    {
        input: 'src/index.js',
        output: {
            file: 'dist/waveplayer.js',
            format: 'cjs'
        },
        plugins: [
            eslint(),
            babel({
                exclude: 'node_modules/**',
                plugins: ['external-helpers', 'transform-runtime'],
                runtimeHelpers: true
            })
        ]
    },
    {
        input: 'src/index.js',
        output: {
            file: 'dist/waveplayer.es6.js',
            format: 'es'
        },
        plugins: [
            eslint(),
            babel({
                exclude: 'node_modules/**',
                plugins: ['external-helpers', 'transform-runtime'],
                runtimeHelpers: true
            })
        ]
    }
];
