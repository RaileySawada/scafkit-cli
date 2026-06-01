const { spawnSync } = require("child_process");
const packageJson = require("../../package.json");

function enableUtf8Console() {
  if (process.platform !== "win32") {
    return;
  }

  spawnSync("chcp.com", ["65001"], {
    stdio: "ignore",
    shell: false,
  });
}

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",

  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  bBlack: "\x1b[90m",
  bRed: "\x1b[91m",
  bGreen: "\x1b[92m",
  bYellow: "\x1b[93m",
  bBlue: "\x1b[94m",
  bMagenta: "\x1b[95m",
  bCyan: "\x1b[96m",
  bWhite: "\x1b[97m",

  fg: (n) => `\x1b[38;5;${n}m`,
};

const GRAD = [c.fg(51), c.fg(45), c.fg(39), c.fg(33), c.fg(27), c.fg(21)];

const A = c.fg(51);
const A2 = c.fg(226);
const A3 = c.fg(226);
const DIM = c.bBlack;

const ICON = Object.freeze({
  bolt: "⚡",
  warn: "!",
  mark: "◆",
  work: "◈",
  arrow: "▸",
  fail: "x",
  dot: "·",
  selected: "●",
  unselected: "○",
  next: "→",
  hint: "← →",
});

const PKG = {
  name: packageJson.name,
  version: packageJson.version,
  author: packageJson.author || "Railey Sawada",
  meaning: "Starter scaffolding CLI",
};

function box(lines, accent = A) {
  const width = Math.max(...lines.map((l) => stripAnsi(l).length)) + 4;
  const top = `${accent}╭${"─".repeat(width - 2)}╮${c.reset}`;
  const bottom = `${accent}╰${"─".repeat(width - 2)}╯${c.reset}`;
  const middle = lines.map((l) => {
    const visible = stripAnsi(l).length;
    const pad = width - 2 - visible - 2;
    return `${accent}│${c.reset} ${l}${" ".repeat(Math.max(0, pad))} ${accent}│${c.reset}`;
  });
  return [top, ...middle, bottom].join("\n");
}

function hRule(width = 54, accent = DIM) {
  return `${accent}${"─".repeat(width)}${c.reset}`;
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function padAnsiRight(value, width) {
  const visible = stripAnsi(value).length;
  return value + " ".repeat(Math.max(0, width - visible));
}

module.exports = {
  enableUtf8Console,
  c,
  GRAD,
  A,
  A2,
  A3,
  DIM,
  ICON,
  PKG,
  box,
  hRule,
  stripAnsi,
  padAnsiRight,
};
