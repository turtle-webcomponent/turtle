import { JSDOM } from 'jsdom';
const dom = new JSDOM(`<body><div><canvas id="canvas"></canvas></div></body>`, { url: 'https://localhost' });
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = global.window.HTMLElement;
global.customElements = global.window.customElements;
