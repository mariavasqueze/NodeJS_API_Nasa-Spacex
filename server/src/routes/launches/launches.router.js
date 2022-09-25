const express = require("express");
const {
	httpGetAllLaunches,
	httpAddNewLaunch,
} = require("./launches.controller");

const launchesRouter = express.Router();

// / matches /launches && /launches/...
launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.get("/", httpAddNewLaunch);

module.exports = launchesRouter;
