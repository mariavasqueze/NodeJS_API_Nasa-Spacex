const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
	flightNumber: {
		type: Number,
		required: true,
	},
	launchDate: {
		type: Date,
		required: true,
	},
	mission: {
		type: String,
		requireed: true,
	},
	rocket: {
		type: String,
	},
	target: {
		type: String,
		required: true,
	},
	customers: [String],
	upcoming: {
		type: Boolean,
		required: true,
	},
	success: {
		type: Boolean,
		required: true,
		default: true,
	},
});

// connect launchesSchema with "launches" collection
module.exports = mongoose.model("Launch", launchesSchema);
