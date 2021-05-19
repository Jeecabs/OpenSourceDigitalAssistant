/**
 * This file allows to run a separate node to detect the wake word "Leon/Léon"
 * You can consider to run this file on a different hardware
 */



const io = require("socket.io-client");
const Porcupine = require("@picovoice/porcupine-node");
const { getPlatform } = require("@picovoice/porcupine-node/platforms");
const {
  
  JARVIS,
} = require("@picovoice/porcupine-node/builtin_keywords");

const recorder = require("./recorder/index.js")


function chunkArray(array, size) {
  return Array.from({ length: Math.ceil(array.length / size) }, (v, index) =>
    array.slice(index * size, index * size + size)
  );
}
(async () => {

  const LEON_HOST = process.env.LEON_HOST || "http://localhost";
  const LEON_PORT = process.env.LEON_PORT || 1337;
  const url = `${LEON_HOST}:${LEON_PORT}`;
  const socket = io(url);

  socket.on("connect", () => {
    socket.emit("init", "hotword-node");
    console.log("Connected to the server");
    console.log("Waiting for hotword...");
  });
  const PLATFORM_RECORDER_MAP = new Map();
  PLATFORM_RECORDER_MAP.set("linux", "arecord");
  PLATFORM_RECORDER_MAP.set("mac", "sox");
  PLATFORM_RECORDER_MAP.set("raspberry-pi", "arecord");
  PLATFORM_RECORDER_MAP.set("windows", "sox");

  console.log("STARTING ");
  const keywordPaths = [JARVIS];
  const keywordNames = ['JARVIS']
  if (keywordPaths.length != keywordNames.length) {
    throw new Error("Keyword Paths and names need to be the same")
  }
  const sensitivities = [0.65];
  let handle = new Porcupine(
    keywordPaths,
    sensitivities
    //   modelFilePath,
    //   libraryFilePath
  );
  let platform;
  try {
    platform = getPlatform();
  } catch (error) {
    console.error();
    ("The NodeJS binding does not support this platform. Supported platforms include macOS (x86_64), Windows (x86_64), Linux (x86_64), and Raspberry Pi (1-4)");
    console.error(error);
  }
  let recorderType = PLATFORM_RECORDER_MAP.get(platform);

  const frameLength = handle.frameLength;
  const sampleRate = handle.sampleRate;
console.log
  const recording = recorder.record({
    sampleRate: sampleRate,
    channels: 1,
    audioType: "raw",
    recorder: recorderType,
  });

  var frameAccumulator = [];

  recording.stream().on("data", (data) => {
    // Two bytes per Int16 from the data buffer
    let newFrames16 = new Array(data.length / 2);
    for (let i = 0; i < data.length; i += 2) {
      newFrames16[i / 2] = data.readInt16LE(i);
    }

    // Split the incoming PCM integer data into arrays of size Porcupine.frameLength. If there's insufficient frames, or a remainder,
    // store it in 'frameAccumulator' for the next iteration, so that we don't miss any audio data
    frameAccumulator = frameAccumulator.concat(newFrames16);
    let frames = chunkArray(frameAccumulator, frameLength);

    if (frames[frames.length - 1].length !== frameLength) {
      // store remainder from divisions of frameLength
      frameAccumulator = frames.pop();
    } else {
      frameAccumulator = [];
    }

    for (let frame of frames) {
      let index = handle.process(frame);
      if (index !== -1) {
        console.log(`Detected '${keywordNames[index]}'`);
        // TODO ACTION
      }
    }
  });

  console.log(`Listening for wake word(s): ${keywordNames}`);
  process.stdin.resume();
  console.warn("Press ctrl+c to exit.");
})();
//request.get(`${url}/v1/info`).end((err, res) => {
//  if (err || !res.ok) {
//    if (!err.response) {
//      console.error(`Failed to reach the server: ${err}`);
//    } else {
//      console.error(err.response.error.message);
//    }
//  } else {
//    //const models = new Models();
////
//    //models.add({
//    //  file: `${__dirname}/models/leon-${res.body.lang.short}.pmdl`,
//    //  sensitivity: "0.5",
//    //  hotwords: `leon-${res.body.lang.short}`,
//    //});
////
//    //const detector = new Detector({
//    //  resource: `${__dirname}/node_modules/snowboy/resources/common.res`,
//    //  models,
//    //  audioGain: 2.0,
//    //  applyFrontend: true,
//    //});
////
//   // detector.on("silence", () => {});
////
//   // detector.on("sound", (/* buffer */) => {
//   //   /**
//   //    * <buffer> contains the last chunk of the audio that triggers the "sound" event.
//   //    * It could be written to a wav stream
//   //    */
//   // });
////
//   // detector.on("error", () => {
//   //   console.error("error");
//   // });
////
//   // detector.on("hotword", (index, hotword, buffer) => {
//   //   /**
//   //    * <buffer> contains the last chunk of the audio that triggers the "hotword" event.
//   //    * It could be written to a wav stream. You will have to use it
//   //    * together with the <buffer> in the "sound" event if you want to get audio
//   //    * data after the hotword
//   //    */
//   //   const obj = { hotword, buffer };
////
//   //   console.log("Hotword detected", obj);
//   //   socket.emit("hotword-detected", obj);
//   // });
//
//    const mic = record.start({
//      threshold: 0,
//      verbose: false,
//    });
//
//    mic.pipe(detector);
//  }
//});
