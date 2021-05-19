//@ts-ignore
import { NerManager } from "node-nlp";
import fs from "fs";

import log, { warningLog } from "../helpers/log";
import stringFunctions from "../helpers/string";

class Ner {
  nerManager: {
    findBuiltinEntities: Function;
    findNamedEntities: Function;
    addNamedEntity: Function;
  };
  supportedEntityTypes: string[];
  constructor() {
    this.nerManager = {
      findBuiltinEntities: () => warningLog("NER MANAGER | NOTHING SET"),
      findNamedEntities: () => warningLog("NER MANAGER | NOTHING SET"),

      addNamedEntity: () => warningLog("NER MANAGER | NOTHING SET"),
    };
    this.supportedEntityTypes = ["regex", "trim"];

    //log.title('NER')
    //log.success('New instance')
  }

  static logExtraction(entities: any[]) {
    entities.forEach((ent) =>
      log.success(`{ value: ${ent.sourceText}, entity: ${ent.entity} }`)
    );
  }

  /**
   * Grab action entities and match them with the query
   */
  extractActionEntities(
    lang: any,
    expressionsFilePath: number | fs.PathLike,
    obj: { query?: any; entities?: any; classification?: any }
  ) {
    return new Promise(async (resolve, reject) => {
      log.title("NER");
      log.info("Searching for entities...");

      // Need to instanciate on the fly to flush entities
      this.nerManager = new NerManager();

      const { entities, classification } = obj;
      // Remove end-punctuation and add an end-whitespace
      const query = `${stringFunctions.removeEndPunctuation(obj.query)} `;
      const expressionsObj = JSON.parse(
        fs.readFileSync(expressionsFilePath, "utf8")
      );
      const { module, action } = classification;
      const promises = [];

      // Verify the action has entities
      if (typeof expressionsObj[module][action].entities !== "undefined") {
        const actionEntities = expressionsObj[module][action].entities;

        /**
         * Browse action entities
         * Dynamic injection of the action entities depending of the entity type
         */
        for (let i = 0; i < actionEntities.length; i += 1) {
          const entity = actionEntities[i];

          if (!this.supportedEntityTypes.includes(entity.type)) {
            reject({
              type: "warning",
              obj: new Error(
                `"${entity.type}" action entity type not supported`
              ),
              code: "random_ner_type_not_supported",
              data: { "%entity_type%": entity.type },
            });
          } else if (entity.type === "regex") {
            promises.push(this.injectRegexEntity(lang, entity));
          } else if (entity.type === "trim") {
            promises.push(this.injectTrimEntity(lang, entity));
          }
        }

        await Promise.all(promises);

        // Merge built-in and named entities
        const nerEntities = (
          await this.nerManager.findBuiltinEntities(query, lang)
        ).concat(await this.nerManager.findNamedEntities(query, lang));

        // Trim whitespace at the beginning and the end of the entity value
        nerEntities.map((e: { sourceText: string; utteranceText: string }) => {
          e.sourceText = e.sourceText.trim();
          e.utteranceText = e.utteranceText.trim();

          return e;
        });

        Ner.logExtraction(nerEntities);

        resolve(nerEntities);
      } else {
        if (entities.length > 0) {
          Ner.logExtraction(entities);
        } else {
          log.info("No entity found");
        }

        resolve(entities);
      }
    });
  }

  /**
   * Inject trim type entities
   */
  injectTrimEntity(
    lang: any,
    entity: { name: any; type: any; conditions: string | any[] }
  ) {
    return new Promise((resolve) => {
      const e = this.nerManager.addNamedEntity(entity.name, entity.type);

      for (let j = 0; j < entity.conditions.length; j += 1) {
        const condition = entity.conditions[j];
        const conditionMethod = `add${stringFunctions.snakeToPascalCase(
          condition.type
        )}Condition`;

        if (condition.type === "between") {
          // e.g. list.addBetweenCondition('en', 'create a', 'list')
          e[conditionMethod](lang, condition.from, condition.to);
        } else if (condition.type.indexOf("after") !== -1) {
          e[conditionMethod](lang, condition.from);
        } else if (condition.type.indexOf("before") !== -1) {
          e[conditionMethod](lang, condition.to);
        }
      }

      resolve("?");
    });
  }

  /**
   * Inject regex type entities
   */
  injectRegexEntity(
    lang: any,
    entity: { name: any; type: any; regex: string | RegExp }
  ) {
    return new Promise((resolve) => {
      const e = this.nerManager.addNamedEntity(entity.name, entity.type);

      e.addRegex(lang, new RegExp(entity.regex, "g"));

      resolve("?");
    });
  }
}

export default Ner;
