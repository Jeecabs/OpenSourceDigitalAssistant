import events from "events";
import fs from "fs";
import { Socket } from "socket.io";

import log from "../helpers/log";
//import synthesizer from "../tts/flite/synthesizer";
import synthesizer from "../tts/python_api/synthesizer";

class Tts {
  socket: Socket;
  provider: string;
  providers: string[];
  em: events;
  speeches: { text: string; isFinalAnswer: boolean }[];
  constructor(socket: Socket) {
    this.socket = socket;
    this.provider = "flite";
    this.providers = [
      "flite",
      "google-cloud-tts",
      "amazon-polly",
      "watson-tts",
    ];
    this.em = new events.EventEmitter();
    this.speeches = [];

    //log.title("TTS");
    //log.success("New instance");
  }

  /**
   * Initialize the TTS provider
   */
  init() {
    //log.info("Initializing TTS...");

    if (!this.providers.includes(this.provider)) {
      log.error(
        `The TTS provider "${this.provider}" does not exist or is not yet supported`
      );

      return false;
    }

    //if (this.provider === 'google-cloud-tts' && typeof process.env.GOOGLE_APPLICATION_CREDENTIALS === 'undefined') {
    //  process.env.GOOGLE_APPLICATION_CREDENTIALS = `${__dirname}/../config/voice/google-cloud.json`
    //} else if (typeof process.env.GOOGLE_APPLICATION_CREDENTIALS !== 'undefined' &&
    //  process.env.GOOGLE_APPLICATION_CREDENTIALS.indexOf('config/voice/google-cloud.json') === -1) {
    //  warningLog(`The "GOOGLE_APPLICATION_CREDENTIALS" env variable is already settled with the following value: "${process.env.GOOGLE_APPLICATION_CREDENTIALS}"`)
    //}

    if (process.env.LEON_NODE_ENV !== "testing") {
      // Dynamically attribute the synthesizer
      synthesizer.init();
    }

    this.onSaved();
    //
    //log.title("TTS");
    //log.success("TTS initialized");

    return true;
  }

  /**
   * Forward buffer audio file and duration to the client
   * and delete audio file once it has been forwarded
   */
  forward(speech: { text: string; isFinalAnswer: boolean }) {
    synthesizer.save(
      speech.text,
      this.em,
      (file: string, duration: number | null) => {
        const bitmap = fs.readFileSync(file);

        this.socket.emit(
          "audio-forwarded",
          {
            buffer: Buffer.from(bitmap),
            is_final_answer: speech.isFinalAnswer,
            duration,
          },
          (confirmation: string) => {
            if (confirmation === "audio-received") {
              fs.unlinkSync(file);
            }
          }
        );
      }
    );
  }

  /**
   * When the synthesizer saved a new audio file
   * then shift the queue according to the audio file duration
   */
  onSaved() {
    return new Promise((resolve) => {
      this.em.on("saved", (duration) => {
        setTimeout(() => {
          this.speeches.shift();

          if (this.speeches[0]) {
            this.forward(this.speeches[0]);
          }

          resolve("?");
        }, duration);
      });
    });
  }

  /**
   * Add speeches to the queue
   */
  add(text: string, isFinalAnswer: boolean) {
    /**
     * Flite fix. When the string is only one word,
     * Flite cannot save to a file. So we add a space at the end of the string
     */
    if (this.provider === "flite" && text.indexOf(" ") === -1) {
      text += " ";
    }

    const speech = { text, isFinalAnswer };

    if (this.speeches.length > 0) {
      this.speeches.push(speech);
    } else {
      this.speeches.push(speech);
      this.forward(speech);
    }

    return this.speeches;
  }
}

export default Tts;
