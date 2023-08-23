const COLORS = {
  lime: "\x1B[38;5;10m",
  red: "\x1B[38;5;9m",
  red3: "\x1B[48;5;124m",
  white: "\x1B[38;5;15m",
  lightpink3: "\x1B[38;5;174m",
  palevioletred1: "\x1B[48;5;211m",
  orchid1: "\x1B[48;5;213m",
  lightsalmon1: "\x1B[48;5;216m",
  thistle3: "\x1B[48;5;182m",
  fuchsia: "\x1B[48;5;13m",
};
const F_BOLD = "\x1B[1m";
const F_UNDERLINE = "\x1B[4m";
const F_INVERT = "\x1B[7m";
const NO_FORMAT = "\x1B[0m";

export const log = (
  message: string,
  styling?: {
    text?: keyof typeof COLORS;
    background?: keyof typeof COLORS;
    bold?: boolean;
    underline?: boolean;
    invert?: boolean;
  },
) => {
  const FORMAT = [
    styling?.text && COLORS[styling.text].replace("[48", "[38"),
    styling?.background && COLORS[styling.background].replace("[38", "[48"),
    styling?.bold && F_BOLD,
    styling?.underline && F_UNDERLINE,
    styling?.invert && F_INVERT,
  ].join("");

  console.log(`${FORMAT}${message}${NO_FORMAT}`);
};

// ERROR UI
export const logError = ({
  title,
  message,
  fix,
  docs,
}: {
  title: string;
  message?: string;
  fix?: string;
  docs?: string;
}) => {
  log("");
  log("⛔️ ERROR:", { text: "red", bold: true });
  log(`${title}`);
  if (!!message) {
    log("");
    log(message);
  }
  if (!!fix) {
    log("");
    log("Run the following command to fix this error:");
    log(`$ ${fix}`);
  }
  if (!!docs) {
    log("");
    log(`Docs: ${docs}`);
  }
  log("");
  process.exit(1);
};

// CHAPTER UI
export const logChapter = (text: string) => {
  log("");
  log(`${text}`, {
    bold: true,
    underline: true,
    invert: true,
  });
  log("");
};
