module.exports = function (api) {
    api.cache(true);

    const presets = [
        [
            "@babel/env",
            {
                targets: {
                    chrome: "58",
                    ie: "11"
                },
                // "amd" | "umd" | "systemjs" | "commonjs" | "cjs" | "auto" | false
                modules: "auto"
            }
        ]
    ];
    const plugins = [
        [
            "@babel/plugin-proposal-decorators",
            {
                "legacy": true
            }
        ],
        [
            "@babel/plugin-proposal-class-properties",
            {
                "loose": true
            }
        ]
    ];

    return {
        presets,
        plugins
    };
}