import events from "events";

import { spawn } from "child_process";
import Ffmpeg from "fluent-ffmpeg";
//@ts-ignore
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
//@ts-ignore
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";
import fs from "fs";

import log from "../../helpers/log";
import string from "../../helpers/string";
import { warningLog } from "../../helpers/log";

log.title("Flite Synthesizer");

const conf = {
  int_f0_target_mean: 115.0, // Intonation (85-180 Hz men; 165-255 Hz women)
  f0_shift: 1.0, // Low or high
  duration_stretch: 1.0, // Speed (lower = faster)
  int_f0_target_stddev: 15.0, // Pitch variability (lower = more flat)
};

/**
 * There is nothing to initialize for this synthesizer
 */
function init() {
  const flitePath = "bin/flite/flite";

  /* istanbul ignore if */
  if (process.env.LEON_LANG !== "en-US") {
    warningLog(
      'The Flite synthesizer only accepts the "en-US" language for the moment'
    );
  }

  /* istanbul ignore if */
  if (!fs.existsSync(flitePath)) {
    log.error(
      `Cannot find ${flitePath} You can setup the offline TTS by running: "npm run setup:offline-tts"`
    );
    return false;
  }

  log.success("Synthesizer initialized");

  return true;
}

/**
 * Save string to audio file
 */
function save(speech: string, em: events, cb: Function) {
  const file = `${__dirname}/../../tmp/${Date.now()}-${string.random(4)}.wav`;
  
  // This spins up a seperate process that communicates with Flite
  // we extract the output from the process call.
  const process = spawn("bin/flite/flite", [
    speech,
    "--setf",
    `int_f0_target_mean=${conf.int_f0_target_mean}`,
    "--setf",
    `f0_shift=${conf.f0_shift}`,
    "--setf",
    `duration_stretch=${conf.duration_stretch}`,
    "--setf",
    `int_f0_target_stddev=${conf.int_f0_target_stddev}`,
    "-o",
    file,
  ]);

  // Handle error
  process.stderr.on("data", (data) => {
    log.error(data.toString());
  });

  process.stdout.on("end", () => {
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
          em.emit("saved", duration);
          cb(file, duration);
        } else {
          warningLog("Synth: Something went horribly wrong");
        }
      }
    });
  });
}

export default { conf, init, save };
