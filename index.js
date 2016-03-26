const TelegramBot = require("node-telegram-bot-api")
const tmpl_compile = require("string-template/compile")
const fs = require("fs")

var gifdetails_tmpl = tmpl_compile(fs.readFileSync("./templates/gifdetails.tmpl", "utf-8"))
var error_tmpl = tmpl_compile(fs.readFileSync("./templates/error.tmpl", "utf-8")) 

var aboutdetails = fs.readFileSync("./templates/about.md")
var typedetails = fs.readFileSync("./templates/typedetails.md")
var startmessage = fs.readFileSync("./templates/startmessage.md")
var helpmessage = fs.readFileSync("./templates/helpmessage.md")

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

bot.onText(/.*/, (msg, match) => {
	if (msg.text.indexOf("/") == 0) {
		return
	}

	importGif(msg.text, msg, true, "gif")
})

bot.onText(/\/video\s+(.*)/, (msg, match) => {
	importGif(match[1], msg, true, "mp4")
})

bot.onText(/\/image\s+(.*)/, (msg, match) => {
	importGif(match[1], msg, true, "jpg")
})

bot.onText(/\/about\s*.*/, (msg, match) => {
	bot.sendMessage(msg.chat.id, aboutdetails, {
		parse_mode: "Markdown"
	})
})

// start enpoint
bot.onText(/\/start\s*.*/, (msg, match) => {
	bot.sendMessage(msg.chat.id, startmessage, {
		parse_mode: "Markdown"
	})
})

// types
bot.onText(/\/types\s*.*/, (msg, match) => {
	bot.sendMessage(msg.chat.id, typedetails, {
		parse_mode: "Markdown"
	})
})


// help endpoint
bot.onText(/\/help\s*.*/, (msg, match) => {
	bot.sendMessage(msg.chat.id, helpmessage)
})

bot.on("video", (msg, match) => {
	if (msg.video.duration > 30) {
		bot.sendMessage(msg.chat.id, "OOps! We can convert video upto 30 seconds till now.")
	}
	else {
		bot.getFileLink(msg.video.file_id)
			.then((link) => {
				importGif(link, msg, true, "gif")
			})
	}
})

bot.on("document", (msg, match) => {
	console.log(msg)
	var isSupported = false

	var supportedTypes = [
		"video/mp4",
		"video/webm",
		"image/gif",
	]

	supportedTypes.forEach((type) => {
		if (msg.document.mime_type == type) {
			isSupported = true
		}
	})

	if (isSupported) {
		var file_size_mb = msg.document.file_size / Math.pow(10, 6)

		if (file_size_mb > 3) {
			bot.sendMessage(msg.chat.id, "The file size should be under 3 mb!")
		}
		else {
			bot.getFileLink(msg.document.file_id)
				.then((link) => {
					importGif(link, msg, true)
				})
		}
	}
	else {
		bot.sendMessage(msg.chat.id, "Sorry! This file format is not supported. :(")
			.then(() => {
				bot.sendMessage("Type /types to know about the formats we support")
			})
	}
})



// imports the gif to gifs.com
// and does telegram bot operations on them
function importGif (link, msg, details, fileFormat) {
	
	gifs.importGif(link)
		.then((res, body) => {
			var success = res.body["success"]
			var errors = res.body["errors"]
			
			if (success) {
				console.log("Gif Imported")
				if (fileFormat) {
					bot.sendMessage(msg.chat.id, (success.files[fileFormat]))
						.then((msg) => {
							if (details) {
								detailsMessage(success, msg)
							}
						})
				}
				else if (details) {
					detailsMessage(success, msg)
				}
			}
 			else if (errors) {
				bot.sendMessage(msg.chat.id, error_tmpl(parseError(errors)), {
					reply_to_message_id: msg.message_id,
					disable_notification: true,
					disable_web_page_preview: true
				})
			}
		})
		.catch((error) => {
			console.error(error)
			errorMessage(error)
		})
}

// sends message about the gif details
function detailsMessage (success, msg) {

	var formatObj = {
		page: success.page
	}

	// adding the given formats to the object
	Object.keys(success.files)
		.forEach((file) => {
			formatObj[file] = success.files[file]
		})

	return bot.sendMessage(msg.chat.id, gifdetails_tmpl(formatObj), {
		parse_mode: "Markdown",
		reply_to_message_id: msg.message_id,
		disable_web_page_preview: true,
		disable_notification: true
	})
}

function errorMessage(msg) {
	bot.sendMessage(msg.chat.id, "Sorry! An internal error occurred!")
}


// parseError parses the error given by gifs.com API
function parseError(errors) {
	var msg = errors.message
	if (msg.match("Duration Too Long")) {
		return "Duration too long for Gifs.com, Please send something shorter."
	}
	else if (msg.match("is not an accepted")) {
		return "Sorry! We don't accept the given content type! Type /types to know about things we can understand!"
	}
	else if (msg.match("unavailable")) {
		return "Sorry! The link didn't respond back!"
	}
	else {
		return "Sorry! We were unable to provide you with a gif! 😢"
	}
}
