#!/usr/bin/env node
"use strict";

const validateWorklets = require("react-native-reanimated/scripts/validate-worklets-version");
const reanimatedPkg = require("react-native-reanimated/package.json");

const result = validateWorklets(reanimatedPkg.version);

if (!result.ok) {
  console.error("\x1b[31mReact Native worklets version mismatch detected.\x1b[0m");
  if (result.message) {
    console.error(result.message);
  }
  console.error(
    "Run `npm install`, `cd ios && pod install` (after deleting Pods/Podfile.lock if you bumped Worklets), and rebuild the native apps before testing the hero dashboard."
  );
  process.exit(1);
}

console.log("Worklets version is compatible with react-native-reanimated.");
