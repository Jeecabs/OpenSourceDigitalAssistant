//@ts-ignore
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import log, { warningLog } from "./helpers/log";
import { langs } from "../../core/langs.json";
import { version } from "../../package.json";
import { getCurrentTimeZone } from "./helpers/date";
import infoRouter from "./api/info/info.routes";
//import path from "path";
import downloadRouter from "./api/downloads/download.routes";
import { Server, Socket } from "socket.io";
import Brain from "./core/brain";
import Nlu from "./core/nlu";
import Asr from "./core/asr";
import { Stt } from "./stt/stt";
import http from "http";
// TODO ADD PING TO THE TTS SERVER TO CHECK IF IT IS ONLINE

//import Server from "./core/server";
let stt: Stt;

(async () => {
  dotenv.config();

  //await Server.init()
  const app = express();
  const CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://10.0.0.201:5000",
    "http://localhost:4242",

    `${process.env.LEON_HOST}:4242`,
  ];
  app.use(
    cors({
      origin: CORS_ORIGINS,
      credentials: true, // TODO Verify if this is more just for cookies
    })
  );

  app.use(express.json());

  log.title("Initialization");
  log.success(`[RUNNING MODE] The current env is ${process.env.LEON_NODE_ENV}`);
  log.success(`The current version is ${version}`);

  if (!Object.keys(langs).includes(process.env.LEON_LANG ?? "en-US") === true) {
    process.env.LEON_LANG = "en-US";

    warningLog(
      "The language you chose is not supported, then the default language has been applied"
    );
  }

  log.success(`The current time zone is ${getCurrentTimeZone()} \n`);

  const apiVersion = "v1";

  // ! THIS WAS MEANT FOR SERVING THE WEB APP
  // ! THIS WILL BE REPURPOSED ONCE THE REACT APP IS DONE.
  // TODO BUILD THE REACT APP THEN SERVE VIA EXPRESS.
  //  // Render the web app
  //  //app.use(express.static(`${__dirname}/../../../app`));
  //  //app.get("/", (_req, res) => {
  //  //  res.sendFile(path.resolve(`${__dirname}/../../../app/index.html`));
  //  //});
  //
  // This endpoint sends configuration info to the client
  app.use(`/${apiVersion}/info`, infoRouter);
  // This is the endpoint where the client interacts with the bot.
  app.use(`/${apiVersion}/downloads`, downloadRouter);

  const httpServer = http.createServer(app);

  //await app.listen(parseInt(process.env.LEON_PORT ?? "1337"), () => {
  //  console.log(
  //    `server started on localhost:${process.env.LEON_PORT ?? "1337"}`
  //  );
  //});
  const io = new Server(httpServer, {
    // ...
    cors: {
      origin: CORS_ORIGINS,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", connection);
  httpServer.listen(parseInt(process.env.LEON_PORT ?? "1337"), () => {
    console.log(
      `🚀 Server ready at http://localhost:${parseInt(
        process.env.LEON_PORT ?? "1337"
      )}`
    );

    console.log(
      `🚀 Subscriptions ready at ws://localhost:${parseInt(
        process.env.LEON_PORT ?? "1337"
      )}`
    );
  });
  console.log("API Started");
})();

function connection(socket: Socket) {
  return new Promise((resolve) => {
    // Init
    socket.on("init", async (data) => {
      // THE HOTWORD SERVER TRIGGERS THIS NOT THE CLIENTS
      if (data === "hotword-node") {
        // Hotword triggered
        socket.on("hotword-detected", (data) => {
          log.title("Socket");
          log.success(`Hotword ${data.hotword} detected`);

          // This tells the client to start listening
          socket.broadcast.emit("enable-record");
        });
      } else {
        const brain = new Brain(socket);
        const nlu = new Nlu(brain);
        const asr = new Asr();
        //let sttState = "disabled";
        //let ttsState = "disabled";

        //if (process.env.LEON_STT === "true") {
        //  sttState = "enabled";
        //
        //  stt = new Stt(socket);
        //  stt.init();
        //}
        // if (process.env.LEON_TTS === "true") {
        //   ttsState = "enabled";
        //   // TODO ADD FETCH REQUEST TO HOTWORD SERVER
        // }

        //  log.title("Initialization");
        //  log.success(`STT ${sttState}`);
        //  log.success(`TTS ${ttsState}`);

        // Train modules expressions
        try {
          await nlu.loadModel(`${__dirname}/data/expressions/classifier.json`);
        } catch (e) {
          //@ts-ignore
          console.log("ERROR");
          console.log(e);
        }

        // Listen for new query
        socket.on("query", async (data) => {
          socket.emit("is-typing", true);
          await nlu.process(data.value);
        });

        // Handle automatic speech recognition
        socket.on("recognize", async (data) => {
          try {
            await asr.run(data, stt);
          } catch (e) {
            //@ts-ignore
            log[e.type](e.obj.message);
          }
        });
      }

      resolve("?");
    });
  });
}
