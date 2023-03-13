const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//__dirname : javascript 제공 상수, 경로 전체
//path.resolve() : 파트들을 모아 경로 생성
const path = require("path");

//console.log(path.resolve(__dirname, "assets", "js"));
// => C:\Users\pychb\OneDrive\문서\개인\노마드코더\wetube\assets\js

module.exports = {
    entry:"./src/client/js/main.js", //소스코드
    mode: 'development',//'development' or 'production'
    watch: true,
    plugins: [new MiniCssExtractPlugin({
        filename: "css/styles.css",
    })],
    output: {
        filename: "js/main.js",
        path: path.resolve(__dirname, "assets"),
        clean: true, //output folder를 build 시작전 clean
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', { targets: "defaults" }]],
                    },
                },
            },
            {
                test: /\.scss$/,
                //use: ["style-loader", "css-loader", "sass-loader"], //역순-webpack 실행 순서
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"], //역순-webpack 실행 순서
            }
        ],
    },
};