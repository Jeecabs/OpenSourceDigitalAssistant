import fs from "fs";
import { getCurrentTimeZone } from "./date";

const log = {
  success: (value: any) => console.log("\x1b[32m✔ %s\x1b[0m", value),
  info: (value: any) => console.info("\x1b[36m➡ %s\x1b[0m", value),
  error: (value: any) => {
    const path = `${__dirname}/../../../logs/errors.log`;
    const errMessage = "Not able to log the error";
    const data = `${getCurrentTimeZone} - ${value}`;

    if (process.env.LEON_NODE_ENV !== "testing") {
      if (!fs.existsSync(path)) {
        fs.writeFile(path, data, { flag: "wx" }, (err) => {
          if (err) warningLog(errMessage);
        });
      } else {
        fs.appendFile(path, `\n${data}`, (err) => {
          if (err) warningLog(errMessage);
        });
      }
    }

    return console.error("\x1b[31m✖ %s\x1b[0m", value);
  },
  title: (value: any) =>
    console.log("\n---\n\n\x1b[7m.: %s :.\x1b[0m", value.toUpperCase()),
  default: (value: any) => console.log("%s", value),
};

export function warningLog(value: any) {
  console.warn("\x1b[33m❗ %s\x1b[0m", value);
}

export default log;
