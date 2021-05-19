import { exec } from "child_process";

import log from "../../server/src/helpers/log";
import os from "../../server/src/helpers/os";

/**
 * Setup offline hotword detection
 */
export default () =>
  new Promise(async (resolve, reject) => {
    log.info("Setting up offline hotword detection...");

    const info = os.get();
    let pkgm = "apt-get install";
    if (info.type === "macos") {
      pkgm = "brew";
    }

    if (info.type === "windows") {
      log.error("Voice offline mode is not available on Windows");
      reject();
    } else {
      try {
        log.info("Installing dependencies...");

        let cmd = `sudo ${pkgm} sox libsox-fmt-all -y`;
        if (info.type === "linux") {
          log.info(`Executing the following command: ${cmd}`);
          await exec(cmd);
        } else if (info.type === "macos") {
          cmd = `${pkgm} install swig portaudio sox`;
          log.info(`Executing the following command: ${cmd}`);
          await exec(cmd);
        }

        log.success("System dependencies downloaded");
        log.info("Installing hotword dependencies...");
        await exec("cd hotword && yarn");
        log.success("Offline hotword detection installed");

        resolve("?");
      } catch (e) {
        log.error(`Failed to install offline hotword detection: ${e}`);
        reject(e);
      }
    }
  });
