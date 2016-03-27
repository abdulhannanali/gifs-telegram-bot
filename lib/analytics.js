const redis = require("redis")


module.exports = function (redis_endpoint) {
	const client = redis.createClient(redis_endpoint)

	function getGifConverts(cb) {
		client.get("gif_converts", cb)
	}

	function incrGifConverts(cb) {
		client.incr("gif_converts", cb)
	}

	function getMessagesReceived(cb) {
		client.get("msg_received", cb)
	}

	function incrMessagesReceived(cb) {
		client.incr("msg_received", cb)
	}

	function getInlineQueriesReceived (cb) {
		client.get("inline_msg_received", cb)
	}

	function incrInlineQueriesReceived (cb) {
		client.incr("inline_msg_received", cb)
	}

	function getStats (cb) {
		client.multi()
			.get("gif_converts")
			.get("msg_received")
			.get("inline_msg_received")
			.exec(function (error, replies) {
				var mappedReplies = replies.map((reply) => {
					if (reply == null) {
						return 0
					}
					return reply
				})

				cb(error, mappedReplies)
			})
	}


	return {
		getGifConverts: getGifConverts,
		incrGifConverts: incrGifConverts,
		getMessagesReceived: getMessagesReceived,
		incrMessagesReceived: incrMessagesReceived,
		getInlineQueriesReceived: getInlineQueriesReceived,
		incrInlineQueriesReceived: incrInlineQueriesReceived,
		getStats: getStats
	}
} 
