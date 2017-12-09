import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import uglify from 'rollup-plugin-uglify';

export default [
    {
        entry: 'src/index.js',
        dest: 'dist/waveplayer.min.js',
        format: 'cjs',
        sourceMap: true,
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
        entry: 'src/index.js',
        dest: 'dist/waveplayer.js',
        format: 'cjs',
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
        entry: 'src/index.js',
        dest: 'dist/waveplayer.es6.js',
        format: 'es',
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
