import log from "../server/src/helpers/log";
import os from "../server/src/helpers/os";
import { exec } from "child_process";
/**
 * Check OS environment
 */
export default () =>
  new Promise(async (resolve, reject) => {
    log.info("Checking OS environment...");

    const info = os.get();

    if (info.type === "windows") {
      log.error("Voice offline mode is not available on Windows");
      reject();
    } else if (info.type === "unknown") {
      log.error(
        "This OS is unknown, please open an issue to let us know about it"
      );
      reject();
    } else {
      try {
        log.success(`You are running ${info.name}`);
        log.info("Checking tools...");

        //@ts-ignore
        await exec("tar", ["--version"]);
        log.success('"tar" found');

        //@ts-ignore
        await exec("make", ["--version"]);
        log.success('"make" found');

        if (info.type === "macos") {
          //@ts-ignore
          await exec("brew", ["--version"]);
          log.success('"brew" found');
          //@ts-ignore
          await exec("curl", ["--version"]);
          log.success('"curl" found');
        } else if (info.type === "linux") {
          //@ts-ignore
          await exec("apt-get", ["--version"]);
          log.success('"apt-get" found');
          //@ts-ignore
          await exec("wget", ["--version"]);
          log.success('"wget" found');
        }

        resolve("?");
      } catch (e) {
        if (e.cmd) {
          const cmd = e.cmd.substr(0, e.cmd.indexOf(" "));
          log.error(
            `The following command has failed: "${e.cmd}". "${cmd}" is maybe missing. To continue this setup, please install the required tool. More details about the failure: ${e}`
          );
        } else {
          log.error(`Failed to prepare the environment: ${e}`);
        }

        reject(e);
      }
    }
  });
