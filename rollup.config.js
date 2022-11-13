import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

import pkg from './package.json';

const local = process.env.NODE_ENV === 'local';

export default {
    input: 'src/index.js',
    output: [
        {
            dir: './',
            entryFileNames: pkg.main,
            format: 'cjs',
            sourcemap: local,
            exports: 'named',
        },
        {
            dir: './',
            entryFileNames: pkg.module,
            format: 'es',
            sourcemap: local,
        },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    watch: {
        include: 'src/**',
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
            plugins: [
                '@babel/plugin-external-helpers',
                '@babel/plugin-transform-runtime',
                '@babel/plugin-proposal-class-properties',
            ],
            babelHelpers: 'runtime',
        }),
        commonjs(),
        nodeResolve(),
        terser(),
    ],
};
