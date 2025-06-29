# duck-ai-api
Reverse engineered API of https://duck.ai

# DuckDuckGo Chat API Reverse Engineering (Unofficial)

⚠️ **This code is poorly written and for experimental purposes only. Use at your own risk.**

This project demonstrates an unofficial, reverse-engineered approach to interact with DuckDuckGo's Chat interface, by mimicking client behavior and reconstructing request headers, tokens, and JavaScript logic.

---

## ⚠️ Disclaimer

This project is intended for educational and research purposes only.  
It is **not affiliated with or endorsed by DuckDuckGo**.  

Use of this code may violate DuckDuckGo’s [Terms of Service](https://duckduckgo.com/terms), and could result in your IP being banned or other consequences.  
Proceed responsibly and lawfully.

---

## 🔧 Features

- Fetches client-specific tokens from DuckDuckGo.
- Deobfuscates JavaScript code (via an external CLI tool).
- Constructs valid request headers including client hashes.
- Streams chat responses from the DuckDuckGo Chat API endpoint.

---

## 🛠️ Requirements

- Node.js
- External CLI tool: `obfuscator-io-deobfuscator` must be available in your system PATH. Also you need to modify it to allow source code as command line parameter.

---

## 🚀 Usage

```bash
node index.js
