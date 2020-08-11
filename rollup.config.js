import peerDepsExternal from "rollup-plugin-peer-deps-external";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { uglify } from "rollup-plugin-uglify";
import typescript from "rollup-plugin-typescript2";

import package from "./package.json";

export default {
  input: "./src/index.js",
  output: [
    {
      file: package.main,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: package.module,
      format: "esm",
      sourcemap: true,
    },
  ],
  external: [
    ...Object.keys(package.dependencies || {}),
    ...Object.keys(package.peerDependencies || {}),
  ],
  plugins: [
    babel({
      exclude: "node_modules/**",
    }),
    typescript({
      typescript: require("typescript"),
    }),
    peerDepsExternal(),
    resolve(),
    commonjs(),
    uglify(),
  ],
};
