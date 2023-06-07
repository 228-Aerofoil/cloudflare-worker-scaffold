module.exports = {
	root: true,
	extends: ["aerofoil/base"],
	parserOptions: {
		sourceType: "module",
		project: "./tsconfig.json",
	},
	settings: {
		"import/resolver": {
			typescript: {
				alwaysTryTypes: true,
				project: "./tsconfig.json",
			},
		},
	},
};
