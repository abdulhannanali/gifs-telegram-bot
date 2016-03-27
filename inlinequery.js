bot.on("inline_query", (inline) => {
	if (!inline.query || !inline.query.trim()) {
		return;
	}
	console.log(inline)
	
	gifs.importGif(inline.query)
		.then((res) => {
			var body = res.body
			console.log(body)

			if (body["success"]) {

				var success = body["success"]
				
				var mp4 = body["success"].files["mp4"]
				var gif = body["success"].files["gif"]

				var id = body["success"].page.split("/").pop()

				var mp4QueryResult = {
					"type": "mpeg4_gif",
					"id": id,
					"mpeg4_url": mp4,
					"thumb_url": gif
				}

				console.log(mp4QueryResult)

				bot.answerInlineQuery(inline.id, [
						mp4QueryResult
					])
			}
		})


	analytics.incrInlineQueriesReceived((error, result) => {
		if (!error) {
			console.log("Total number of inline queries received: " + result)			
		}
	})

})


