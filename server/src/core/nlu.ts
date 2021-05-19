//@ts-ignore
import { NlpManager } from "node-nlp";
import fs from "fs";
import path from "path";

import { langs } from "../../../core/langs.json";
import Ner from "../core/ner";
import log from "../helpers/log";
import stringFunctions from "../helpers/string";
import { warningLog } from "../helpers/log";
import Brain from "./brain";

class Nlu {
  brain: any;
  classifier: {};
  ner: any;
  constructor(brain: Brain) {
    this.brain = brain;
    this.classifier = {};
    this.ner = new Ner();

    //log.title("NLU");
    //log.success("New instance");
  }

  /**
   * Load the expressions classifier from the latest training
   */
  loadModel(classifierFile: fs.PathLike) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(classifierFile)) {
        //log.title("NLU");

        console.log(`THE FOLLOWING PATH IS PROBLEMATIC ${classifierFile}`);
        reject({
          type: "warning",
          obj: new Error(
            "The expressions classifier does not exist, please run: npm run train expressions"
          ),
        });
      } else {
        //log.title("NLU");

        try {
          const data = fs.readFileSync(classifierFile, "utf8");
          const nlpManager = new NlpManager();

          nlpManager.import(data);
          this.classifier = nlpManager;

          //log.success("Classifier loaded");
          resolve("Success");
        } catch (err) {
          this.brain.talk(
            `${this.brain.wernicke("random_errors")}! ${this.brain.wernicke(
              "errors",
              "nlu",
              {
                "%error%": err.message,
              }
            )}.`
          );
          this.brain.socket.emit("is-typing", false);

          reject({ type: "error", obj: err });
        }
      }
    });
  }

  /**
   * Classify the query,
   * pick-up the right classification
   * and extract entities
   */
  async process(query: string) {
    log.title("NLU");
    log.info("Processing...");

    query = stringFunctions.ucfirst(query);

    if (Object.keys(this.classifier).length === 0) {
      this.brain.talk(`${this.brain.wernicke("random_errors")}!`);
      this.brain.socket.emit("is-typing", false);

      log.error(
        "The expressions classifier is missing, please rebuild the project or if you are in dev run: npm run train expressions"
      );

      return false;
    }
    //@ts-ignore
    const lang = langs[process.env.LEON_LANG].short;
    // TODO MAKE THIS TYPESAFE!
    //@ts-ignore
    const result = await this.classifier.process(lang, query);
    const { domain, intent, score, entities } = result;
    const [moduleName, actionName] = intent.split(".");
    let obj = {
      query,
      entities,
      classification: {
        package: domain,
        module: moduleName,
        action: actionName,
        confidence: score,
      },
    };

    if (intent === "None") {
      //@ts-ignore
      const fallback = Nlu.fallback(obj, langs["en-US"].fallbacks);

      if (fallback === false) {
        this.brain.talk(
          `${this.brain.wernicke("random_unknown_queries")}.`,
          true
        );
        this.brain.socket.emit("is-typing", false);

        log.title("NLU");
        warningLog("Query not found");

        return false;
      }

      obj = fallback;
    }

    log.title("NLU");
    log.success("Query found");

    try {
      obj.entities = await this.ner.extractActionEntities(
        lang,
        path.join(
          __dirname,
          "../../../packages",
          obj.classification.package,
          `data/expressions/${lang}.json`
        ),
        obj
      );
    } catch (e) {
      //@ts-ignore
      log[e.type](e.obj.message);
      this.brain.talk(`${this.brain.wernicke(e.code, "", e.data)}!`);
    }

    try {
      //log.info("NOT EXECUTING PYTHON MODULE");
      //console.log(obj);
      // Inject action entities with the others if there is
      await this.brain.execute(obj);
    } catch (e) {
      //@ts-ignore
      log.error(e);
      this.brain.socket.emit("is-typing", false);
    }

    return true;
  }

  /**
   * Pickup and compare the right fallback
   * according to the wished module
   */
  static fallback(
    obj: { query: any; entities: any; classification: any },
    fallbacks: string | any[]
  ) {
    const words = obj.query.toLowerCase().split(" ");

    if (fallbacks.length > 0) {
      log.info("Looking for fallbacks...");
      const tmpWords = [];

      for (let i = 0; i < fallbacks.length; i += 1) {
        for (let j = 0; j < fallbacks[i].words.length; j += 1) {
          if (words.includes(fallbacks[i].words[j]) === true) {
            tmpWords.push(fallbacks[i].words[j]);
          }
        }

        if (JSON.stringify(tmpWords) === JSON.stringify(fallbacks[i].words)) {
          obj.entities = [];
          obj.classification.package = fallbacks[i].package;
          obj.classification.module = fallbacks[i].module;
          obj.classification.action = fallbacks[i].action;
          obj.classification.confidence = 1;

          log.success("Fallback found");
          return obj;
        }
      }
    }

    return false;
  }
}

export default Nlu;
