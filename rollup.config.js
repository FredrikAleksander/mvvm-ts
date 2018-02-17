import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import ejs from 'rollup-plugin-ejs';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

export default [
{
  plugins: [
    json({
      // for tree-shaking, properties will be declared as
      // variables, using either `var` or `const`
      preferConst: true, // Default: false

      // specify indentation for the generated default export —
      // defaults to '\t'
      indent: '  '
    }),
    resolve(),
    ejs({
			include: ['**/*.ejs']
	}),
    typescript({
			tsconfigOverride: {
					compilerOptions: {
							declaration: false
					}
			}
	})
  ],
  input: 'src/mvvm/main.ts',
  output: {
    format: 'cjs',
    sourcemap: true,
    file: pkg.main
  },
  external: ["tslib", "reflect-metadata"]
},
{
  plugins: [
    json({
      // for tree-shaking, properties will be declared as
      // variables, using either `var` or `const`
      preferConst: true, // Default: false

      // specify indentation for the generated default export —
      // defaults to '\t'
      indent: '  '
    }),
    resolve(),
    ejs({
			include: ['**/*.ejs']
	}),
    typescript({
			tsconfigOverride: {
					compilerOptions: {
							declaration: false
					}
			}
	})
  ],
  input: 'src/mvvm/main.ts',
  output: {
    format: 'es',
    sourcemap: true,
    file: pkg.module
  },
  external: ["tslib", "reflect-metadata"]
},
{
    plugins: [
    json({
      // for tree-shaking, properties will be declared as
      // variables, using either `var` or `const`
      preferConst: true, // Default: false

      // specify indentation for the generated default export —
      // defaults to '\t'
      indent: '  '
    }),
    resolve(),
    ejs({
			include: ['**/*.ejs']
	}),
    typescript({
			tsconfigOverride: {
					compilerOptions: {
							declaration: false
					}
			}
	})
  ],
  input: './src/samples/todo/webapp.ts',
  output: {
    format: 'iife',
    sourcemap: true,
    file: 'samples/todo/todo.js'
  },

}

];
