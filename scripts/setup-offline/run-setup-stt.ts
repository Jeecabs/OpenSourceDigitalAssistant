import log from "../../server/src/helpers/log";

import setupStt from "./setup-stt";

/**
 * execute the setup offline STT script
 */
(async () => {
  try {
    await setupStt();
  } catch (e) {
    log.error(`Failed to setup offline STT: ${e}`);
  }
})();
