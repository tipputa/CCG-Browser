import babel from 'rollup-plugin-babel';
import {
    terser
} from "rollup-plugin-terser";

const config = {
    input: 'src/index.js',
    plugins: [
        babel({
            'presets': [
                '@babel/preset-env'
            ]
        })
    ],
    output: {
        file: 'dist/bundle.js',
        format: 'iife',
        name: 'bio',
        banner: ""
    }
}


export default [
    config,
    {
        ...config,
        output: {
            ...config.output,
            file: 'dist/bundle.min.js'
        },
        plugins: [
            ...config.plugins,
            terser({
                output: {
                    preamble: config.output.banner
                }
            })
        ]
    },
];