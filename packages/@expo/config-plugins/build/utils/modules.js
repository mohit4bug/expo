"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.directoryExistsAsync = directoryExistsAsync;
exports.fileExists = fileExists;
exports.fileExistsAsync = fileExistsAsync;
exports.writeIfDifferentAsync = writeIfDifferentAsync;
function _fs() {
  const data = _interopRequireDefault(require("fs"));
  _fs = function () {
    return data;
  };
  return data;
}
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const debug = require('debug')('expo:config-plugins:fs');

/**
 * A non-failing version of async FS stat.
 *
 * @param file
 */
async function statAsync(file) {
  try {
    return await _fs().default.promises.stat(file);
  } catch {
    return null;
  }
}
async function fileExistsAsync(file) {
  var _await$statAsync$isFi, _await$statAsync;
  return (_await$statAsync$isFi = (_await$statAsync = await statAsync(file)) === null || _await$statAsync === void 0 ? void 0 : _await$statAsync.isFile()) !== null && _await$statAsync$isFi !== void 0 ? _await$statAsync$isFi : false;
}
async function directoryExistsAsync(file) {
  var _await$statAsync$isDi, _await$statAsync2;
  return (_await$statAsync$isDi = (_await$statAsync2 = await statAsync(file)) === null || _await$statAsync2 === void 0 ? void 0 : _await$statAsync2.isDirectory()) !== null && _await$statAsync$isDi !== void 0 ? _await$statAsync$isDi : false;
}
function fileExists(file) {
  try {
    return _fs().default.statSync(file).isFile();
  } catch {
    return false;
  }
}

// An optimization to attempt to prevent Xcode cache invalidation on files that don't change.
async function writeIfDifferentAsync(filePath, contents) {
  if (!fileExists(filePath)) {
    const existing = await _fs().default.promises.readFile(filePath, 'utf8');
    if (existing === contents) {
      debug(`Skipping writing unchanged file: ${filePath}`);
      return;
    }
  }
  await _fs().default.promises.writeFile(filePath, contents);
}
//# sourceMappingURL=modules.js.map