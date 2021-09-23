import { JSDOM } from "jsdom"
const dom = new JSDOM(`<body><canvas id="canvas"></canvas></body>`)
global.document = dom.window.document
global.window = dom.window
