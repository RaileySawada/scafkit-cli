const { spawn } = require("child_process");

function run(command, args, options = {}) {
  return spawn(command, args, {
    shell: false,
    stdio: "inherit",
    ...options,
  });
}

module.exports = {
  run,
};
