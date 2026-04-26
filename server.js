const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

app.post("/send", async (req, res) => {
  const { name, message, telegram } = req.body;

  if (!TOKEN || !CHAT_ID) {
    return res.status(500).json({
      error: "Telegram sozlamalari topilmadi. .env faylni tekshiring.",
    });
  }

  if (!name?.trim() || !message?.trim() || !telegram?.trim()) {
    return res.status(400).json({
      error: "Ism, xabar va Telegram username kiritilishi shart.",
    });
  }

  const tgLink = telegram ? `\n👤 Telegram: https://t.me/${telegram.replace("@", "")}` : "";
  const formattedText = `🚀 *Yangi xabar!*\n\n📝 *Ism:* ${name.trim()}\n💬 *Xabar:* ${message.trim()}${tgLink}`;

  try {
    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: formattedText,
      parse_mode: "Markdown",
    });

    res.json({ ok: true, message: "Yuborildi" });
  } catch (error) {
    console.error(
      "Telegram yuborishda xatolik:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Xabarni yuborib bo'lmadi.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server ishlayapti: http://localhost:${PORT}`);
});
