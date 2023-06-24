const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
    },
    // externalsType: "script",
    externals: {
        "@novorender/webgl-api": "self.NovoRender",
    },
    devServer: {
        static: './dist',
        watchFiles: {
            paths: ['src/**/*'],
            options: {
                usePolling: false,
            }
        }
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                "index.html",
                { from: "node_modules/@novorender/webgl-api/*.js", to: "novorender/[name][ext]" }
            ],
        }),
    ],
};