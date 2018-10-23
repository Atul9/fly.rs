/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// const { readFileSync } = require("fs");
// const { join } = require("path");
// const Preprocessor = require("preprocessor");
// const MagicString = require("magic-string");
import MagicString from "magic-string"
// import { loaderSrc } from "./loader-source";

// function isEntryModule(chunk, inputs) {
//   return chunk.orderedModules.some(module => inputs.includes(module.id));
// }

const defaultOpts = {
  useEval: false,
  publicPath: undefined
};

export function loader(opts = {}) {
  opts = { ...defaultOpts, ...opts };

  // const { loader, ...defines } = opts;
  // opts.loader = new Preprocessor(opts.loader, ".").process(defines);

  let inputs;
  let resolvedInputs;
  return {
    name: "loadz0r",

    options({ input }) {
      inputs = input;
      if (typeof inputs === "string") {
        inputs = [inputs];
      }
      if (typeof inputs === "object") {
        inputs = Object.values(inputs);
      }
    },

    transformChunk(code, outputOptions, chunk) {
      if (outputOptions.format !== "amd") {
        throw new Error("You must set output.format to 'amd'");
      }
      if (outputOptions.banner && outputOptions.banner.length > 0) {
        throw new Error(
          "Loadz0r currently doesn’t work with `banner`. Feel free to submit a PR at https://github.com/surma/rollup-plugin-loadz0r"
        );
      }
      const id = `./${chunk.id}`;
      // FIXME (@surma): Is this brittle? HELL YEAH.
      // Happy to accept PRs that make this more robust.

      const magicCode = new MagicString(code);
      magicCode.remove(0, "define(".length);
      // If the module does not have any dependencies, it’s technically okay
      // to skip the dependency array. But our minimal loader expects it, so
      // we add it back in.
      if (!code.startsWith("define([")) {
        magicCode.prepend("[],");
      }
      magicCode.prepend(`define("${id}",`);

      // If not already done, resolve input names to fully qualified moduled IDs
      if (!resolvedInputs) {
        resolvedInputs = Promise.all(inputs.map(id => this.resolveId(id)));
      }
      return resolvedInputs.then(inputs => {
        // If this is an entry module, add the loader code.
        // if (isEntryModule(chunk, inputs)) {
        //   magicCode.prepend(loaderSrc);
        // }
        return {
          code: magicCode.toString(),
          map: magicCode.generateMap({ hires: true })
        };
      });
    }
  };
};

