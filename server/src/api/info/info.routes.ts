import { Router } from "express";

import { langs } from "../../../../core/langs.json";
import { version } from "../../../../package.json";
import log from "../../helpers/log";

const infoRouter = Router();

// Get information to init client
infoRouter.get("/", function (_req, res, _next) {
  log.title("GET /info");

  const message = "Information pulled.";

  log.success(message);

  res.json({
    success: true,
    status: 200,
    code: "info_pulled",
    message,
    after_speech: process.env.LEON_AFTER_SPEECH === "true",
    stt: {
      enabled: process.env.LEON_STT === "true",
      provider: process.env.LEON_STT_PROVIDER,
    },
    tts: {
      enabled: process.env.LEON_TTS === "true",
      provider: process.env.LEON_TTS_PROVIDER,
    },
    lang: langs[ 'en-US'],
    version,
  });
});

export default infoRouter;
