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


	return {
		getGifConverts: getGifConverts,
		incrGifConverts: incrGifConverts,
		getMessagesReceived: getMessagesReceived,
		incrMessagesReceived: incrMessagesReceived,
		getInlineQueriesReceived: getInlineQueriesReceived,
		incrInlineQueriesReceived: incrInlineQueriesReceived
	}
} 
