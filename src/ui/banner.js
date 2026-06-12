const { c, ICON, PKG, stripAnsi } = require("./theme");

function banner() {
  const CYAN = c.fg(45);
  const CYAN_SOFT = c.fg(87);
  const BLUE = c.fg(39);
  const BLUE_DARK = c.fg(27);
  const LINE = c.fg(31);
  const MUTED = c.fg(240);
  const WHITE = c.bWhite;

  const titleRows = [
    "███████╗ ██████╗ █████╗ ███████╗██╗  ██╗██╗████████╗       ██████╗██╗     ██╗",
    "██╔════╝██╔════╝██╔══██╗██╔════╝██║ ██╔╝██║╚══██╔══╝      ██╔════╝██║     ██║",
    "███████╗██║     ███████║█████╗  █████╔╝ ██║   ██║         ██║     ██║     ██║",
    "╚════██║██║     ██╔══██║██╔══╝  ██╔═██╗ ██║   ██║         ██║     ██║     ██║",
    "███████║╚██████╗██║  ██║██║     ██║  ██╗██║   ██║         ╚██████╗███████╗██║",
    "╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝   ╚═╝          ╚═════╝╚══════╝╚═╝",
  ];
  const rowColors = [CYAN_SOFT, c.fg(81), CYAN, BLUE, c.fg(33), BLUE_DARK];
  const width = Math.max(...titleRows.map((row) => stripAnsi(row).length));

  const center = (text) => {
    const visible = stripAnsi(text).length;
    const left = Math.floor((width - visible) / 2);
    const right = Math.max(0, width - visible - left);
    return `${" ".repeat(left)}${text}${" ".repeat(right)}`;
  };

  console.log();
  console.log(`  ${LINE}${"─".repeat(width)}${c.reset}`);
  titleRows.forEach((row, index) => {
    console.log(`  ${rowColors[index]}${c.bold}${row}${c.reset}`);
  });
  console.log(`  ${LINE}${"─".repeat(width)}${c.reset}`);
  console.log(
    `  ${center(`${WHITE}${c.bold}SCAFFOLD FASTER.${c.reset}  ${CYAN}${c.bold}CODE SMARTER.${c.reset}`)}`,
  );
  console.log(
    `  ${center(`${CYAN}${c.bold}React${c.reset}  ${WHITE}${ICON.dot}${c.reset}  ${BLUE}${c.bold}PERN${c.reset}  ${WHITE}${ICON.dot}${c.reset}  ${c.fg(33)}${c.bold}PHP MVC${c.reset}  ${WHITE}${ICON.dot}${c.reset}  ${BLUE_DARK}${c.bold}Laravel Builder${c.reset}`)}`,
  );
  console.log(
    `  ${center(`${MUTED}Node.js CommonJS scaffolding CLI ${ICON.dot} v${PKG.version}${c.reset}`)}`,
  );
  console.log();

  console.log(`  ${LINE}┌─${c.reset} ${CYAN}${c.bold}scafkit${c.reset} ${MUTED}ready${c.reset}`);
  console.log(
    `  ${LINE}├─${c.reset} ${MUTED}templates${c.reset}  ${CYAN}${c.bold}php${c.reset} ${LINE}/${c.reset} ${BLUE}${c.bold}pern${c.reset} ${LINE}/${c.reset} ${c.fg(33)}${c.bold}react${c.reset}`,
  );
  console.log(
    `  ${LINE}├─${c.reset} ${MUTED}create${c.reset}     ${CYAN}${c.bold}php${c.reset} ${c.white}<app>${c.reset}  ${BLUE}${c.bold}pern${c.reset} ${c.white}<app>${c.reset} ${LINE}--tw${c.reset}  ${c.fg(33)}${c.bold}react${c.reset} ${c.white}<app>${c.reset} ${LINE}--js${c.reset}`,
  );
  console.log(
    `  ${LINE}├─${c.reset} ${MUTED}ops${c.reset}        ${CYAN}${c.bold}help${c.reset} ${LINE}/${c.reset} ${CYAN}${c.bold}run${c.reset} ${LINE}/${c.reset} ${CYAN}${c.bold}doctor${c.reset} ${LINE}/${c.reset} ${CYAN}${c.bold}update${c.reset}`,
  );
  console.log(
    `  ${LINE}└─${c.reset} ${MUTED}build${c.reset}      ${CYAN}${c.bold}laravel:build${c.reset} ${LINE}/${c.reset} ${BLUE}${c.bold}make:controller${c.reset} ${LINE}/${c.reset} ${c.fg(33)}${c.bold}make:route${c.reset}`,
  );
  console.log();
}

module.exports = { banner };
