const path = require("path");

function resolveTargetDir(cwd, folderArg = ".", outputDir = null) {
  if (outputDir) {
    return path.resolve(cwd, outputDir, folderArg);
  }

  return path.resolve(cwd, folderArg);
}

module.exports = {
  resolveTargetDir,
};
