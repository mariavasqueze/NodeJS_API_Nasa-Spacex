const express = require("express");
const {
	httpGetAllLaunches,
	httpAddNewLaunch,
	httpAbortLaunch,
} = require("./launches.controller");

const launchesRouter = express.Router();

// / matches /launches && /launches/...
launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.post("/", httpAddNewLaunch);
launchesRouter.delete("/:id", httpAbortLaunch);

module.exports = launchesRouter;
