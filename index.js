const TelegramBot = require("node-telegram-bot-api")
const request = require("request")

var env = process.env.NODE_ENV
env = "development"

if (env == "development") {
	require("./config")

	const gifs = require("./lib/gifs.js")(process.env.GIFS_COM_KEY)
	const BOT_TOKEN = process.env.BOT_TOKEN

	if (!BOT_TOKEN) {
		throw new Error("TELEGRAM BOT TOKEN is not provided")
	}

	const bot = new TelegramBot(BOT_TOKEN, {polling: true})
}
else {

}

bot.onText(/.*/, (msg, match) => {
	gifs.importGif(msg.text)
		.then((res, body) => {
			var success = res.body["success"]
			var errors = res.body["errors"]
			
			if (success) {
				console.log("gif imported")
				console.log(success)
				bot.sendDocument(msg.chat.id, request(success.files["gif"], {
					"caption": "This is a caption"
				}))

			}
			else if (errors) {

			}
		})
})



