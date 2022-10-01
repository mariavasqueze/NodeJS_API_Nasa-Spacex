const {
	getAllLaunches,
	sheduleNewLaunch,
	existsLaunchWithId,
	abortLaunchById,
} = require("../../models/launches.model");

const getPagination = require("../../services/query");

async function httpGetAllLaunches(req, res) {
	const {skip, limit} = getPagination(req.query);
	const launches = await getAllLaunches(skip, limit)
	return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
	const launch = req.body;

	if (
		!launch.mission ||
		!launch.rocket ||
		!launch.launchDate ||
		!launch.target
	) {
		return res.status(400).json({
			error: "Missing required launch property",
		});
	}

	launch.launchDate = new Date(launch.launchDate);
	//converts date to number to check if valid
	if (isNaN(launch.launchDate)) {
		return res.status(400).json({
			error: "Invalid launch date",
		});
	}

	await sheduleNewLaunch(launch);
	return res.status(201).json(launch); // status 201 = data created
}

async function httpAbortLaunch(req, res) {
	const launchId = Number(req.params.id);

	//find if launch exists
	const existsLaunch = await existsLaunchWithId(launchId);

	if (!existsLaunch) {
		return res.status(404).json({
			error: "Launch not found",
		});
	}

	//if launch exists
	const aborted = await abortLaunchById(launchId);
	if (!aborted) {
		return res.status(400).json({
			error: "Launch not aborted",
		});
	} else {
		return res.status(200).json({
			ok: true,
		});
	}
}

module.exports = {
	httpGetAllLaunches,
	httpAddNewLaunch,
	httpAbortLaunch,
};
