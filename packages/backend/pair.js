const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
async function start() {
  const sessionDir = "/root/mydash-vps/packages/backend/.wa-session";
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15", "Safari", "26.0"],
    syncFullHistory: false,
  });
  sock.ev.on("creds.update", saveCreds);
  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode("62895370206659");
    console.log("PAIRING_CODE:" + code);
    process.exit(0);
  } else {
    console.log("ALREADY_PAIRED");
    process.exit(0);
  }
}
start().catch(e => { console.error("ERROR:" + e.message); process.exit(1); });