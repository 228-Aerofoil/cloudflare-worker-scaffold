import path from "path";
import type {
	ScaffoldConfig,
	ScaffoldScriptFunction,
} from "@aerofoil/aerofoil-core/type/ScaffoldManifest";
import {
	type PackageJson,
	type TsConfigJson,
	generateScaffoldMetadata,
} from "@aerofoil/aerofoil-core/util/generateScaffoldMetadata";
import { logger } from "@aerofoil/logger";
import type {
	CallExpression,
	ExportNamedDeclaration,
	Node,
	ObjectExpression,
	ObjectProperty,
	VariableDeclaration,
	VariableDeclarator,
} from "@babel/types";

export const scaffold: ScaffoldScriptFunction = async (options) => {
	const { deployInfo, deploymentRootPath, loadJsonFile, loadScriptFile } =
		await generateScaffoldMetadata(options, {
			deploymentTypeFilter: ["@cloudflare/worker"],
		});
	const tsConfigName = `${deployInfo.scaffoldSource?.replace(
		/\\|@|\//g,
		"-",
	)}.tsconfig.json`;

	await using packageJson = await loadJsonFile<PackageJson>("package.json");
	packageJson.name = `@${options.projectConfig.name}/${deployInfo.name}`;
	packageJson.devDependencies = packageJson.devDependencies ?? {};
	packageJson.dependencies = packageJson.dependencies ?? {};

	const framework = await logger.listInput(
		"Which framework do you want to use?",
		[["none"], ["hono", "elysia"]],
	);

	await logger.awaitText(async () => {
		//todo don't override this if it exists
		await options.fs.copy(
			path.resolve(options.scaffoldPath, "extras", "tsconfig.json"),
			path.resolve(
				options.projectRootPath,
				"libraries",
				"tsconfig",
				tsConfigName,
			),
		);
		await using tsConfigPackageJson = await loadJsonFile<PackageJson>(
			"../../libraries/tsconfig/package.json",
		);
		if (!tsConfigPackageJson.files?.includes(tsConfigName)) {
			tsConfigPackageJson.files = [
				...(tsConfigPackageJson.files ?? []),
				tsConfigName,
			];
		}
		await using tsConfigJson =
			await loadJsonFile<TsConfigJson>("tsconfig.json");
		tsConfigJson.extends = `tsconfig/${tsConfigName}`;
	}, "Creating tsconfig");

	if (framework === "none") {
		await options.fs.copy(
			path.resolve(options.scaffoldPath, "extras", "none"),
			path.resolve(deploymentRootPath, "src"),
		);
	}
	if (framework === "hono") {
		packageJson.dependencies.hono = "^3.11.8";

		await options.fs.copy(
			path.resolve(options.scaffoldPath, "extras", "hono"),
			path.resolve(deploymentRootPath, "src"),
		);
	}
	if (framework === "elysia") {
		await options.fs.copy(
			path.resolve(options.scaffoldPath, "extras", "elysia"),
			path.resolve(deploymentRootPath, "src"),
		);

		await using coreTs = await loadScriptFile("./src/core.ts");

		packageJson.dependencies.elysia = "^0.7.30";
		packageJson.dependencies["@elysiajs/swagger"] = "^0.7.4";
		packageJson.dependencies["@sinclair/typebox"] = "^0.31.17";
		packageJson.devDependencies["openapi-types"] = "^12.1.3";

		try {
			updateElysiaPluginSwaggerTitle(
				(coreTs.$ast as { body: Array<Node> }).body,
				deployInfo.name,
			);
		} catch (error) {
			logger.warn(
				`Failed to update swagger title. Error: ${(error as Error).message}`,
			);
		}
	}
};

export const scaffoldConfig = {
	deploymentDefaultName: "cloudflare-worker",
	todos: [],
	requiredExtensions: ["@aerofoil/af-ext-cloudflare"],
	version: "0.3.0",
	aerofoilVersion: "0.8.6",
	name: "cloudflare-worker-scaffold",
} satisfies ScaffoldConfig;

function findElysiaPluginSwaggerAst(ast: Array<Node>) {
	const coreExport = ast.find(
		(node) =>
			node.type === "ExportNamedDeclaration" &&
			node.declaration != null &&
			node.declaration.type === "VariableDeclaration" &&
			node.declaration.declarations[0] != null &&
			node.declaration.declarations[0].id.type === "Identifier" &&
			node.declaration.declarations[0].id.name === "core",
	) as
		| (ExportNamedDeclaration & {
				declaration: VariableDeclaration & {
					declarations: [VariableDeclarator];
				};
		  })
		| null;

	if (
		coreExport == null ||
		coreExport.declaration.declarations[0].init == null ||
		coreExport.declaration.declarations[0].init.type !== "CallExpression"
	) {
		return null;
	}

	const coreExportInit = coreExport.declaration.declarations[0].init;

	let currentCallExpression: CallExpression = coreExportInit;
	let swagger: CallExpression | null = null;
	let max = 100;
	do {
		if (
			currentCallExpression.arguments[0] != null &&
			currentCallExpression.arguments[0].type === "CallExpression" &&
			currentCallExpression.arguments[0].callee.type === "Identifier" &&
			currentCallExpression.arguments[0].callee.name === "swagger"
		) {
			swagger = currentCallExpression.arguments[0];
			break;
		}
		if (
			currentCallExpression?.callee.type !== "MemberExpression" ||
			currentCallExpression?.callee?.object == null ||
			currentCallExpression?.callee?.object.type !== "CallExpression"
		) {
			break;
		}
		currentCallExpression = currentCallExpression.callee.object;
	} while (swagger == null && max-- > 0);

	return swagger;
}

function updateElysiaPluginSwaggerTitle(ast: Array<Node>, newTitle: string) {
	const swagger = findElysiaPluginSwaggerAst(ast);

	if (
		swagger == null ||
		swagger.arguments[0] == null ||
		swagger.arguments[0].type !== "ObjectExpression"
	) {
		throw new Error("Could not find swagger plugin");
	}

	const documentationProperties = swagger.arguments[0].properties.find(
		(node) =>
			node.type === "ObjectProperty" &&
			node.key.type === "Identifier" &&
			node.key.name === "documentation" &&
			node.value.type === "ObjectExpression",
	) as
		| (ObjectProperty & {
				value: ObjectExpression;
		  })
		| null;
	if (documentationProperties == null) {
		throw new Error("Could not find `documentation` in swagger plugin option");
	}
	const infoProperty = documentationProperties.value.properties.find(
		(node) =>
			node.type === "ObjectProperty" &&
			node.key.type === "Identifier" &&
			node.key.name === "info" &&
			node.value.type === "ObjectExpression",
	) as
		| (ObjectProperty & {
				value: ObjectExpression;
		  })
		| null;
	if (infoProperty == null) {
		throw new Error(
			"Could not find `documentation.info` in swagger plugin options",
		);
	}
	const titleProperty = infoProperty.value.properties.find(
		(node) =>
			node.type === "ObjectProperty" &&
			node.key.type === "Identifier" &&
			node.key.name === "title" &&
			node.value.type === "StringLiteral",
	) as ObjectProperty & {
		value: { type: "StringLiteral"; value: string };
	};
	if (titleProperty == null) {
		throw new Error(
			"Could not find `documentation.info.title` in swagger plugin options",
		);
	}
	titleProperty.value.value = newTitle;
}
