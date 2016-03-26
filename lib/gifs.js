const request = require("request")

var importEndpoint = "https://api.gifs.com/media/import"
var uploadEndpoint = "https://api.gifs.com/media/upload"

module.exports = function (key, attribution) {
	if (!key) {
		key = ""
	}

	function importGif (source, title, tags, nsfw) {
		var gifBody = {
			source: source || "",
			title: title || "",
			tags: tags || [], 
			nsfw: nsfw || false
		}

		if (attribution) {
			gifBody["attribution"] = attribution
		}



		return new 	Promise(function (resolve, reject) {
			request({
				url: importEndpoint,
				body: gifBody,
				json: true,
				method: "post",
				headers: gifHeaders()
			}, function (error, res, body) {
				if (error) {
					reject(error)
				}
				else {
					resolve(res, body)
				}
			})
		})
	}

	function gifHeaders () {
		var headers = {}
		if (key) {
			headers["Gifs-API-Key"] = key
		}

		return headers
	}

	return {
		importGif: importGif
	}
}
