import { GlobalEval } from "src/global-eval";

export interface ConfigOptions {
  globalEval: GlobalEval;
  global: object;
}

export interface DevTools {
  run(path: string): void;
  runTests(): void;
}

export type initFn = (target: object, config: ConfigOptions) => DevTools;