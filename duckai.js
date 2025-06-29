const axios = require("axios")
const { Buffer } = require("buffer");
const { spawnSync } = require("child_process");
const { JSDOM } = require('jsdom');
const { createHash } = require('crypto');




function deobfuscateScript(script) {
	const process = spawnSync("cmd", ["/c", "obfuscator-io-deobfuscator", script, "-o", "124", "-s"]);
	const output = process.stdout.toString();
	return output;
}


function getHashes(vqdHash) {
	const jsScript = Buffer.from(vqdHash, 'base64').toString('utf-8');
	const deobfuscated = deobfuscateScript(jsScript);

	const htmlItem = eval(deobfuscated.split('.innerHTML = ')[1].split(';')[0])
	const constant_number = parseInt(deobfuscated.split('return String(')[1].split(" ")[0], 16);
	
	const dom = new JSDOM();
	const el = dom.window.document.createElement("div");
	el.innerHTML = htmlItem;

	const clientHashes = [
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"Not)A;Brand";v="8", "Chromium";v="138", "Brave";v="138"',
		(constant_number + el.innerHTML.length * el.querySelectorAll("*").length).toString()
	].map((t) => createHash("sha256").update(t).digest("base64"));
	var emptyClientHash = deobfuscated.replace(/'client_hashes':\s*\[[\s\S]*?\],/, `'client_hashes': [],`);

	var finalObject = eval(emptyClientHash);
	finalObject.client_hashes = clientHashes;
	finalObject.meta.origin = "https://duckduckgo.com";
	finalObject.meta.stack = "Error\nat ue (https://duckduckgo.com/dist/wpm.chat.0ea649b4eccc96d608ac.js:1:23715)\nat async https://duckduckgo.com/dist/wpm.chat.0ea649b4eccc96d608ac.js:1:25902";
	finalObject.meta.duration = "6";

	return btoa(JSON.stringify(finalObject));
}

(async () => {
	try {
		var headers = {
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
			'accept-language': 'en-US,en;q=0.9',
			'cache-control': 'no-cache',
			'pragma': 'no-cache',
			'priority': 'u=0, i',
			'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Brave";v="138"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Windows"',
			'sec-fetch-dest': 'document',
			'sec-fetch-mode': 'navigate',
			'sec-fetch-site': 'none',
			'sec-fetch-user': '?1',
			'sec-gpc': '1',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
		};


		const homeRes = await axios.get("https://duckduckgo.com/?q=DuckDuckGo+AI+Chat&ia=chat&duckai=1", { headers });

		const html = homeRes.data;
		const feVersion = html.split('__DDG_BE_VERSION__="')[1].split('"')[0];
		const chatHash = html.split('__DDG_FE_CHAT_HASH__="')[1].split('"')[0];
		const X_FE_VERSION = `${feVersion}-${chatHash}`;


		const statusRes = await axios.get("https://duckduckgo.com/duckchat/v1/status", {
			headers: {
				...headers,
				referer: "https://duckduckgo.com/",
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'x-vqd-accept': '1',
			}
		});
		const vqdHash = getHashes(statusRes.headers["x-vqd-hash-1"]);

		headers = {
			"accept": "text/event-stream",
			"accept-language": "en-US,en;q=0.9",
			"cache-control": "no-cache",
			"content-type": "application/json",
			"pragma": "no-cache",
			"priority": "u=1, i",
			"sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Brave\";v=\"138\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"Windows\"",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"sec-gpc": "1",
			"x-fe-signals": "eyJzdGFydCI6MTc1MTA1MDYxMDMxNSwiZXZlbnRzIjpbeyJuYW1lIjoic3RhcnROZXdDaGF0IiwiZGVsdGEiOjcyfSx7Im5hbWUiOiJyZWNlbnRDaGF0c0xpc3RJbXByZXNzaW9uIiwiZGVsdGEiOjkzfV0sImVuZCI6NDE1MX0=",
			"x-fe-version": X_FE_VERSION,
			"x-vqd-hash-1": vqdHash,
			"Referer": "https://duckduckgo.com/",
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
		  }
		
		const chatRes = await axios.post(
			"https://duckduckgo.com/duckchat/v1/chat",
			{
			  model: 'gpt-4o-mini',
			  metadata: {
				toolChoice: {
				  NewsSearch: false,
				  VideosSearch: false,
				  LocalSearch: false,
				  WeatherForecast: false
				}
			  },
			  messages: [ {
         "content" : "hello",
         "role" : "user"
      } ],
			  canUseTools: true
			},
			{headers: headers, responseType: 'stream', adapter: "fetch"},
		);
		const reader = chatRes.data.pipeThrough(new TextDecoderStream()).getReader();
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			value.split("\n").forEach((line) => {
				if (!line.length || line === "data: [DONE]") return
				var object = JSON.parse(line.substr(6))
				if (object.message)
					process.stdout.write(object.message)
			})
		  }
		
	} catch (err) {
		console.error("Error:", err.message || err);
	}
})();
