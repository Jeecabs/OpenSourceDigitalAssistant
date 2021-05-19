import events from "events";

//import { spawn } from "child_process";
import Ffmpeg from "fluent-ffmpeg";
//@ts-ignore
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
//@ts-ignore
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";

import log from "../../helpers/log";
import string from "../../helpers/string";
import { warningLog } from "../../helpers/log";
import fetch from "node-fetch";
import { DefaultApiFactory, Item } from "server/src/tts_client";
log.title("Python TTS API");

/**
 * There is nothing to initialize for this synthesizer
 */
function init() {
  // TODO ADD API CHECK TO MAKE SURE IT IS ONLINE

  return true;
}

/**
 * Save string to audio file
 */
function save(speech: string, em: events, cb: Function) {
  const file = `${__dirname}/../../tmp/${Date.now()}-${string.random(4)}.wav`;

  // Creates an instance of the OpenAPI connector
  const TTS_API = DefaultApiFactory();

  TTS_API.createItemTtsPost({ speech, file })
    .then(() => {
      const ffmpeg = Ffmpeg();
      ffmpeg.setFfmpegPath(ffmpegPath);
      ffmpeg.setFfprobePath(ffprobePath);

      // Get file duration thanks to ffprobe
      ffmpeg.input(file).ffprobe((err, data) => {
        /* istanbul ignore if */
        if (err) log.error(err);
        else {
          const TEMP_DURATION_VAR = data.streams[0].duration;
          if (TEMP_DURATION_VAR != undefined) {
            const duration =
              data.streams[0].duration != undefined
                ? parseInt(TEMP_DURATION_VAR) * 1000
                : null;
            // TODO DELETE THE FILE THAT WAS CREATED
            em.emit("saved", duration);
            cb(file, duration);
          } else {
            warningLog("Synth: Something went horribly wrong");
          }
        }
      });
    })
    .catch((error) => log.error(error));

  process.stdout.on("end", () => { });
}

export default { init, save };
