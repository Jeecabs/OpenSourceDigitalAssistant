import fs from "fs";
import { spawn } from "child_process";

//import { langs } from "../../../core/langs.json";
import log from "../helpers/log";
import string from "../helpers/string";
// import Synchronizer from "../core/synchronizer";
import Tts from "../tts/tts";
import { Socket } from "socket.io";
import { langs } from "../../../core/langs.json";
import { answers } from "../data/expressions/en.json";
class Brain {
  socket: any;
  broca: any;
  interOutput: {};
  finalOutput: {};
  tts: any;
  constructor(socket: Socket) {
    this.socket = socket;

    this.interOutput = {};
    this.finalOutput = {};

    //log.title("Brain");
    //log.success("New instance");

    if (process.env.LEON_TTS === "true") {
      // Tnit TTS
      this.tts = new Tts(this.socket);
      this.tts.init();
    }
  }

  /**
   * Delete query object file
   */
  static deleteQueryObjFile(queryObjectPath: fs.PathLike) {
    try {
      fs.unlinkSync(queryObjectPath);
    } catch (e) {
      log.error(`Failed to delete query object file: ${e}`);
    }
  }

  /**
   * Make Leon talk
   */
  talk(rawSpeech: string, end = false) {
    log.title("Brain");
    log.info("Talking...");

    if (rawSpeech !== "") {
      if (process.env.LEON_TTS === "true") {
        // Stripe HTML to a whitespace. Whitespace to let the TTS respects punctuation
        const speech = rawSpeech.replace(/<(?:.|\n)*?>/gm, " ");

        this.tts.add(speech, end);
      }

      this.socket.emit("answer", rawSpeech);
    }
  }

  /**
   * Pickup speech info we need to return
   */
  wernicke(type: string, key: string | undefined, obj: { [key: string]: any }) {
    let answer: string = "";
    let answerMap: { [key: string]: string };
    // Choose a random answer or a specific one
    //@ts-ignore
    const property = answers[type];
    if (property.constructor === [].constructor) {
      answerMap = property[Math.floor(Math.random() * property.length)];
    } else {
      answerMap = property;
    }

    // Select a specific key
    if (key !== "" && typeof key !== "undefined") {
      answer = answerMap[key];
    }

    // Parse sentence's value(s) and replace with the given object
    if (typeof obj !== "undefined" && Object.keys(obj).length > 0) {
      answer = string.pnr(answer, obj);
    }

    return answer;
  }

  /**
   * Execute Python modules
   */
  execute = (obj: {
    classification: {
      confidence: number;
      package: string;
      module: string;
      action: any;
    };
    query: any;
    entities: any;
  }) => {
    return new Promise((resolve, reject) => {
      const queryId = `${Date.now()}-${string.random(4)}`;
      const queryObjectPath = `${__dirname}/../tmp/${queryId}.json`;
      log.title(obj.classification.module);
      // Ask to repeat if Leon is not sure about the request
      if (obj.classification.confidence < langs["en-US"].min_confidence) {
        this.talk(`${this.wernicke("random_not_sure", "", {})}.`, true);
        this.socket.emit("is-typing", false);

        resolve(null);
      } else {
        if (obj.classification.module.toUpperCase() == "GREETING") {
          this.talk("Hello friend");
          resolve(null);
          return;
        }

        // TODO  Completely overhaul the below section
        // TODO  This is the part that executes specific functions/tasks and returns the reply
        // TODO
        // TODO

        // Ensure the process is empty (to be able to execute other processes outside of Brain)
        // if (Object.keys(this.process).length === 0) {
        /**
         * Execute a module in a standalone way (CLI):
         *
         * 1. Need to be at the root of the project
         * 2. Edit: server/src/query-object.sample.json
         * 3. Run: PIPENV_PIPFILE=bridges/python/Pipfile pipenv run
         *    python bridges/python/main.py server/src/query-object.sample.json
         */
        const queryObj = {
          id: queryId,
          lang: langs["en-US"].short,
          package: obj.classification.package,
          module: obj.classification.module,
          action: obj.classification.action,
          query: obj.query,
          entities: obj.entities,
        };
        let process: any;

        try {
          fs.writeFileSync(queryObjectPath, JSON.stringify(queryObj));
          process = spawn(
            `pipenv run python bridges/python/main.py ${queryObjectPath}`,
            { shell: true }
          );
        } catch (e) {
          log.error(`Failed to save query object: ${e}`);
        }

        const packageName = string.ucfirst(obj.classification.package);
        const moduleName = string.ucfirst(obj.classification.module);
        let output: any = "";

        // Read output
        process.stdout.on("data", (data: string) => {
          const obj = JSON.parse(data.toString());

          if (typeof obj === "object") {
            if (obj.output.type === "inter") {
              log.title(`${packageName} package`);
              log.info(data.toString());

              this.interOutput = obj.output;
              this.talk(obj.output.speech.toString());
            } else {
              output += data;
            }
          } else {
            reject({
              type: "warning",
              obj: new Error(
                `The ${moduleName} module of the ${packageName} package is not well configured. Check the configuration file.`
              ),
            });
          }
        });

        // Handle error
        process.stderr.on("data", (data: string | undefined) => {
          this.talk(
            `${this.wernicke("random_package_module_errors", "", {
              "%module_name%": moduleName,
              "%package_name%": packageName,
            })}!`
          );
          Brain.deleteQueryObjFile(queryObjectPath);
          this.socket.emit("is-typing", false);

          log.title(packageName);
          reject({ type: "error", obj: new Error(data) });
        });

        // Catch the end of the module execution
        process.stdout.on("end", () => {
          log.title(`${packageName} package`);
          log.info(output);

          // Check if there is an output (no module error)
          if (output !== "") {
            output = JSON.parse(output).output;
            //@ts-ignore
            this.talk(output.speech.toString(), true);

            // Synchronize the downloaded content if enabled
            if (
              output.type === "end" &&
              output.options.synchronization &&
              output.options.synchronization.enabled &&
              output.options.synchronization.enabled === true
            ) {
              // const sync = new Synchronizer(
              //   this,
              //   obj.classification,
              //   this.finalOutput.options.synchronization
              // );

              // When the synchronization is finished
              // sync.synchronize((speech: string) => {
              this.talk(
                `${this.wernicke("synchronizer", "synced_direct", {})}.`
              );
              // });
            }
          }

          Brain.deleteQueryObjFile(queryObjectPath);
          this.socket.emit("is-typing", false);
          resolve(null);
        });
      }
    });
  };
}

export default Brain;
