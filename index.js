const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");

const TelegramBot =
  require("node-telegram-bot-api");

const express = require("express");
const pino = require("pino");

const app = express();

const PORT = process.env.PORT || 3000;

/* TELEGRAM TOKEN */
const token = process.env.BOT_TOKEN;

/* OWNER TELEGRAM ID */
const ownerId = process.env.OWNER_ID;

const bot =
  new TelegramBot(token, { polling: true });

let sock;
let pairCode = "Not Generated";
let botStatus = "OFFLINE";

/* WEB PANEL */

app.get("/", (req, res) => {

  res.send(`
  <html>
  <body style="
    background:#0f172a;
    color:white;
    font-family:sans-serif;
    padding:30px;
  ">

  <h1>WHATSAPP PANEL</h1>

  <h2>Status: ${botStatus}</h2>

  <h2>Pair Code: ${pairCode}</h2>

  </body>
  </html>
  `);

});

app.listen(PORT, () => {
  console.log("WEB PANEL STARTED");
});

/* START WHATSAPP */

async function startBot() {

  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update",
    ({ connection }) => {

    if (connection === "open") {

      botStatus = "ONLINE 🟢";

      console.log("BOT CONNECTED");

    }

  });

}

startBot();

/* TELEGRAM COMMAND */

bot.onText(/\/pair (.+)/,
async (msg, match) => {

  if (String(msg.chat.id) !== ownerId)
    return;

  const number =
    match[1].replace(/[^0-9]/g, "");

  if (true) {

    pairCode =
      await sock.requestPairingCode(number);

    bot.sendMessage(
      msg.chat.id,
      `PAIR CODE:\n${pairCode}`
    );

  }

});
