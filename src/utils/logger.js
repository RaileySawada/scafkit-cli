const { c, A, DIM, ICON } = require("../ui/theme");

function info(message) {
  console.log(`  ${A}${ICON.arrow}${c.reset} ${message}`);
}

function muted(message) {
  console.log(`  ${DIM}${message}${c.reset}`);
}

module.exports = {
  info,
  muted,
};
