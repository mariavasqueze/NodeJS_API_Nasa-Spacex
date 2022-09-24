const http = require("http");

const app = require("./app");

const { loadPlanetsData } = require("./models/planets.model");

const PORT = process.envPORT || 8000;

const server = http.createServer(app);

//wait to get planets data before continueing
async function startServer() {
	await loadPlanetsData();
}

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}...`);
});

startServer();
