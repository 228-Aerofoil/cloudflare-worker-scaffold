import { logger } from "@aerofoil/logger";
import path from "path";
import { fileURLToPath } from "url";

const sourceDirectory = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"source",
);

export async function scaffold({
	fs,
	projectConfig,
	projectRootPath,
	generateDeploymentInfo,
	deploymentTypes,
}) {
	const deployInfo = await generateDeploymentInfo(null, {
		deployment: { type: "@cloudflare/worker" },
	});
	const deploymentRootPath = path.resolve(
		projectRootPath,
		"deployments",
		deployInfo.name,
	);
	logger.info(`Scaffolding ${deployInfo.name} at ${deploymentRootPath}`);
	await fs.copy(sourceDirectory, deploymentRootPath);
	const packageJSON = JSON.parse(
		await fs.readFile(path.resolve(deploymentRootPath, "package.json"), "utf8"),
	);
	packageJSON.name = `@${projectConfig.name}/${deployInfo.name}`;
	const framework = await logger.listInput(
		"Which framework do you want to use?",
		[["none"], ["hono", "elysia"]],
	);

	switch (framework) {
		case "none":
			await fs.copy(
				path.resolve(sourceDirectory, "..", "extras", "none", "index.ts"),
				path.resolve(deploymentRootPath, "src", "index.ts"),
			);
			break;
		case "hono":
			packageJSON.dependencies["hono"] = "^3.5.8";
			await fs.copy(
				path.resolve(sourceDirectory, "..", "extras", "hono"),
				path.resolve(deploymentRootPath, "src"),
			);
			break;
		case "elysia":
			packageJSON.devDependencies["@types/lodash.clonedeep"] = "^4.5.7";
			packageJSON.devDependencies["openapi-types"] = "^12.1.3";
			packageJSON.dependencies["@elysiajs/swagger"] = "^0.6.1";
			packageJSON.dependencies["@sinclair/typebox"] = "^0.31.14";
			packageJSON.dependencies["elysia"] = "^0.6.19";
			await fs.copy(
				path.resolve(sourceDirectory, "..", "extras", "elysia"),
				path.resolve(deploymentRootPath, "src"),
			);
			break;

		default:
			throw new Error(`Unknown framework: ${framework}`);
			break;
	}

	await fs.writeFile(
		path.resolve(deploymentRootPath, "package.json"),
		JSON.stringify(packageJSON, null, "\t"),
	);
}
