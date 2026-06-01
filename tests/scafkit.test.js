const assert = require("node:assert/strict");
const { startCli, handleCommand } = require("../src");

assert.equal(typeof startCli, "function");
assert.equal(typeof handleCommand, "function");
