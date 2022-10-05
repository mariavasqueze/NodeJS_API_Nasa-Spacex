const axios = require("axios");

const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
	console.log("Downlaoding launch data");
	const response = await axios.post(SPACEX_API_URL, {
		query: {},
		options: {
			pagination: false,
			populate: [
				{
					path: "rocket",
					select: {
						name: 1,
					},
				},
				{
					path: "payloads",
					select: {
						customer: 1,
					},
				},
			],
		},
	});

	if(response.status !== 200){
		console.log("Problem downloading launch data");
		throw new Error("Launch data download failed");
	}
	//get response from api
	const launchDocs = response.data.docs;
	//map response to = our object
	for (const launchDoc of launchDocs) {
		const payloads = launchDoc["payloads"];
		//call flatMap to go through each and pass all to one array (list)
		const customers = payloads.flatMap((payload) => {
			return payload["customers"];
		});

		const launch = {
			flightNumber: launchDoc["flight_number"],
			mission: launchDoc["name"],
			rocket: launchDoc["rocket"]["name"],
			launchDate: launchDoc["date_local"],
			upcoming: launchDoc["upcoming"],
			success: launchDoc["success"],
			customers,
		};

		console.log(`${launch.flightNumber} ${launch.mission}`);

		await saveLaunch(launch);
	}
}

async function loadLaunchData() {
	const firstLaunch = await findLaunch({
		flightNumber: 1,
		rocket: "Falcon 1",
		mission: "FalconSat",
	});
	if (firstLaunch) {
		console.log("Launch data already loaded");
	} else {
		await populateLaunches();
	}
}

async function findLaunch(filter) {
	return await launchesDatabase.findOne(filter);
}

// check if id exists
async function existsLaunchWithId(launchId) {
	return await findLaunch({
		flightNumber: launchId,
	});
}

async function getLatestFlightNumber() {
	const latestLaunch = await launchesDatabase
		//sort launched by desc(-) order, return first document with findOne
		.findOne()
		.sort("-flightNumber");

	if (!latestLaunch) {
		return DEFAULT_FLIGHT_NUMBER;
	}

	return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
	return await launchesDatabase
		.find({}, { "_id": 0, "__v": 0 })
		.sort({ flightNumber: 1 }) //positive for ascending
		.skip(skip)
		.limit(limit);
}

async function saveLaunch(launch) {
	await launchesDatabase.findOneAndUpdate(
		{
			//check if it exists first
			flightNumber: launch.flightNumber,
		},
		//add:
		launch,
		{
			upsert: true,
		}
	);
}

async function sheduleNewLaunch(launch) {
	const planet = await planets.findOne({
		keplerName: launch.target,
	});

	if (!planet) {
		throw new Error("No matching planet was found");
	}

	const newFlightNumber = await getLatestFlightNumber() + 1;

	const newLaunch = Object.assign(launch, {
		success: true,
		upcoming: true,
		customers: ["MariaV", "NASA"],
		flightNumber: newFlightNumber,
	});

	await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
	// check for id if exist, update properties, but don't add anything.
	const aborted = await launchesDatabase.updateOne(
		{
			flightNumber: launchId,
		},
		{
			upcoming: false,
			success: false,
		}
	);

	// doc was successfully aborted
	return aborted.modifiedCount === 1;
}

module.exports = {
	loadLaunchData,
	existsLaunchWithId,
	getAllLaunches,
	sheduleNewLaunch,
	abortLaunchById,
};
