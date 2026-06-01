const { c, A, DIM, ICON, PKG, stripAnsi } = require("./theme");

function banner() {
  const rows = [
    " ███████╗ ██████╗ █████╗ ███████╗██╗  ██╗██╗████████╗       ██████╗██╗     ██╗",
    " ██╔════╝██╔════╝██╔══██╗██╔════╝██║ ██╔╝██║╚══██╔══╝      ██╔════╝██║     ██║",
    " ███████╗██║     ███████║█████╗  █████╔╝ ██║   ██║   █████╗██║     ██║     ██║",
    " ╚════██║██║     ██╔══██║██╔══╝  ██╔═██╗ ██║   ██║   ╚════╝██║     ██║     ██║",
    " ███████║╚██████╗██║  ██║██║     ██║  ██╗██║   ██║         ╚██████╗███████╗██║",
    " ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝   ╚═╝          ╚═════╝╚══════╝╚═╝",
  ];

  const BLUE = c.fg(39);
  const BLUE2 = c.fg(33);
  const BLUE3 = c.fg(27);
  const BLUE4 = c.fg(21);
  const YELLOW = c.fg(226);
  const WHITE = c.bWhite;
  const MUTED = c.fg(240);

  const rowColors = [c.fg(87), c.fg(81), c.fg(45), BLUE, BLUE2, BLUE3];

  const W = Math.max(62, ...rows.map((row) => stripAnsi(row).length));

  const borderTop = `  ${BLUE}${c.bold}╔${"═".repeat(W + 2)}╗${c.reset}`;
  const borderBottom = `  ${BLUE}${c.bold}╚${"═".repeat(W + 2)}╝${c.reset}`;
  const empty = `  ${BLUE}${c.bold}║${c.reset} ${" ".repeat(W)} ${BLUE}${c.bold}║${c.reset}`;

  const centerText = (text) => {
    const len = stripAnsi(text).length;
    const left = Math.floor((W - len) / 2);
    const right = Math.max(0, W - len - left);
    return " ".repeat(left) + text + " ".repeat(right);
  };

  const line = (text = "") => {
    const visible = stripAnsi(text).length;
    const pad = Math.max(0, W - visible);
    return `  ${BLUE}${c.bold}║${c.reset} ${text}${" ".repeat(pad)} ${BLUE}${c.bold}║${c.reset}`;
  };

  const artLine = (row, color) => {
    const visible = stripAnsi(row).length;
    const pad = Math.max(0, W - visible);
    return `  ${BLUE}${c.bold}║${c.reset} ${color}${c.bold}${row}${c.reset}${" ".repeat(pad)} ${BLUE}${c.bold}║${c.reset}`;
  };

  console.log();
  console.log(borderTop);
  console.log(empty);

  rows.forEach((row, i) => {
    console.log(artLine(row, rowColors[i]));
  });

  console.log(empty);
  console.log(
    line(centerText(`${WHITE}${c.bold}Project starter kit${c.reset}`)),
  );
  console.log(
    line(
      centerText(
        `${MUTED}PHP MVC  ${ICON.dot}  PERN  ${ICON.dot}  React${c.reset}`,
      ),
    ),
  );
  console.log(line(centerText(`${BLUE}${c.bold}v${PKG.version}${c.reset}`)));
  console.log(empty);
  console.log(borderBottom);
  console.log();

  console.log(
    `  ${DIM}┌─[${c.reset}${BLUE}${c.bold}scafkit${c.reset}${DIM}]─[${c.reset}${YELLOW}${c.bold}ready${c.reset}${DIM}]${c.reset}`,
  );
  console.log(
    `  ${DIM}├─${c.reset} ${MUTED}templates${c.reset}  ${BLUE}${c.bold}php${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}pern${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}react${c.reset}`,
  );
  console.log(
    `  ${DIM}├─${c.reset} ${MUTED}create${c.reset}     ${YELLOW}${c.bold}php${c.reset} ${c.white}<app>${c.reset}   ${DIM}|${c.reset}   ${YELLOW}${c.bold}pern${c.reset} ${c.white}<app>${c.reset} ${DIM}--tw${c.reset}   ${DIM}|${c.reset}   ${YELLOW}${c.bold}react${c.reset} ${c.white}<app>${c.reset} ${DIM}--js${c.reset}`,
  );
  console.log(
    `  ${DIM}├─${c.reset} ${MUTED}ops${c.reset}        ${BLUE}${c.bold}help${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}pwd${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}cd${c.reset} ${c.white}<dir>${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}run${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}update${c.reset}`,
  );
  console.log(
    `  ${DIM}└─${c.reset} ${MUTED}php${c.reset}        ${YELLOW}${c.bold}make:controller${c.reset} ${c.white}Invoice approve reject${c.reset} ${DIM}/${c.reset} ${YELLOW}${c.bold}make:route${c.reset}`,
  );
  console.log();
}

module.exports = { banner };
