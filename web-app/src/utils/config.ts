export const ENDPOINT = "http://localhost:1337";

export const config = {
  app: "webapp",
  server_host: "localhost",
  server_port: "1337",
  min_decibels: -40, // Noise detection sensitivity
  max_blank_time: 1000, // Maximum time to consider a blank (ms)
};
export const serverUrl =
  process.env.LEON_NODE_ENV === "production"
    ? ""
    : `${config.server_host}:${config.server_port}`;

export const MY_USER_ID = "ME";
export const BOT_ID = "ROBOT";
