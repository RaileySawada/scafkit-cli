const {
  generatePhpProject,
  generatePhpController,
  generatePhpRoute,
} = require("../generators/phpGenerator");
const { generatePernProject } = require("../generators/pernGenerator");
const { generateReactProject } = require("../generators/reactGenerator");

module.exports = {
  generatePhpProject,
  generatePhpController,
  generatePhpRoute,
  generatePernProject,
  generateReactProject,
};
