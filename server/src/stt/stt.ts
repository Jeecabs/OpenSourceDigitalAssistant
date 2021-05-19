import fs from "fs";
import { Socket } from "socket.io";

import Asr from "../core/asr";
import log from "../helpers/log";
import parser from "../stt/deepspeech/parser";

export class Stt {
  socket: Socket;
  constructor(socket: Socket) {
    this.socket = socket;

    log.title("STT");
    log.success("New instance");
  }

  /**
   * Initialize the STT provider
   */
  init() {
    log.info("Initializing STT...");

 
    if (process.env.LEON_NODE_ENV !== "testing") {
      // Dynamically attribute the parser
      //   parser = require(`${__dirname}/${this.provider}/parser`) // eslint-disable-line global-require
      parser.init(parser.conf);
    }

    log.title("STT");
    log.success("STT initialized");

    return true;
  }

  /**
   * Forward string output to the client
   * and delete audio files once it has been forwarded
   */
  forward(string: string) {
    this.socket.emit("recognized", string, (confirmation: string) => {
      
      if (confirmation === "string-received") {
        Stt.deleteAudios();
      }
    });

    log.success(`Parsing result: ${string}`);
  }

  /**
   * Read the speech file and parse
   */
  parse(file: any) {
    log.info("Parsing WAVE file...");

    if (!fs.existsSync(file)) {
      log.error(`The WAVE file "${file}" does not exist`);

      return false;
    }

    const buffer = fs.readFileSync(file);
    /* istanbul ignore if */
    if (process.env.LEON_NODE_ENV !== "testing") {
      parser.parse(buffer, (data: { string: string }) => {
        if (data.string !== "") {
          // Forward the string to the client
          this.forward(data.string);
        } else {
          Stt.deleteAudios();
        }
      });
    }

    return true;
  }

  /**
   * Delete audio files
   */
  static deleteAudios() {
    return new Promise((resolve) => {
      const audios: string[] = Object.keys(Asr.audios);

      for (let i = 0; i < audios.length; i += 1) {
        // This is awful. Trying to get around Typescript without having to do huge refactor.
        let KEY: "wav" | "webm" = "wav";
        if (audios[i] == "webm") {
          KEY = "webm";
        } else if (audios[i] != "wav") {
          throw new Error("Incorrect audio format");
        }

        const audio = Asr.audios[KEY];

        if (fs.existsSync(audio)) {
          fs.unlinkSync(Asr.audios[KEY]);
        }

        if (i + 1 === audios.length) {
          resolve("?");
        }
      }
    });
  }
}
