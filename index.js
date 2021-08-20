import Sprite from './sprite.js';
import Turtle from './turtle.js';

class TurtleComponent extends HTMLElement {

  #backgroundCanvas
  #backgroundCanvasContext
  #parentDiv

  static get observedAttributes() {
    return ['width', 'height'];
  }

  constructor() {
    super()
    this.#parentDiv = document.createElement("div")
    this.#backgroundCanvas = document.createElement("canvas");

    this.#parentDiv.appendChild(this.#backgroundCanvas);

    this.#backgroundCanvasContext = this.#backgroundCanvas.getContext("2d")
  }

  get width() {
    return this.getAttribute('width');
  }

  set width(value) {
    this.setAttribute('width', value);
  }

  get height() {
    return this.getAttribute('height');
  }

  set height(value) {
    this.setAttribute('height', value);
  }

  get canvasStyle() {
    return this.getAttribute('canvas-style');
  }

  set canvasStyle(value) {
    this.setAttribute('canvas-style', value);
  }

  connectedCallback() {
    if (!this.width) {
      this.rating = 300;
    }
    if (!this.height) {
      this.maxRating = 300;
    }
    if (!this.canvasStyle) {
      this.maxRating = "border: solid 1px black;";
    }
    if (!this.spriteScale) {
      this.spriteScale = 1;
    }

    this.initializeCanvas()
  }

  initializeCanvas(parent = document.body) {
    this.#backgroundCanvas.width = this.width
    this.#backgroundCanvas.height = this.height
    this.#backgroundCanvas.style = this.canvasStyle

    this.#parentDiv.style = "position: relative;"

    this.#backgroundCanvasContext.translate(this.#backgroundCanvas.width * 0.5, this.#backgroundCanvas.height * 0.5);

    parent.appendChild(this.#parentDiv)
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) {
      switch (name) {
        case 'width':
          this.width = newVal;
          break;
        case 'height':
          this.height = newVal;
          break;
        case 'canvas-style':
          this.canvasStyle = newVal
          break;
      }
    }
  }

  async update(turtle){
    while(!turtle.deleted) {
      await turtle.init();
    }
  }

  buildForwardCanvas() {
    let foregroundCanvas = document.createElement("canvas");
    foregroundCanvas.style = "position: absolute;"
    this.#parentDiv.appendChild(foregroundCanvas);
    let foregroundCanvasContext = foregroundCanvas.getContext("2d")

    foregroundCanvas.width = this.width
    foregroundCanvas.height = this.height

    foregroundCanvasContext.translate(
      foregroundCanvas.width * 0.5,
      foregroundCanvas.height * 0.5
    );

    return foregroundCanvasContext
  }

  idleSprite(idleSprite, forwardCanvas) {
    if(idleSprite === null) {
      idleSprite = new Image();
      idleSprite.src = 'idle_turtle.png';
    }

    return new Sprite(1, 10, idleSprite, forwardCanvas, 0.2);
  }

  moveSprite(moveSprite, forwardCanvas) {
    if(moveSprite === null) {
      moveSprite = new Image();
      moveSprite.src = 'turtle.png';
    }

    return new Sprite(1, 8, moveSprite, forwardCanvas, 0.2);
  }

  getTurtle(idleSprite = null, moveSprite = null) {

    let forwardCanvas = this.buildForwardCanvas()

    let turtle = new Turtle(
      this.#backgroundCanvasContext,
      forwardCanvas,
      this.idleSprite(idleSprite, forwardCanvas),
      this.moveSprite(moveSprite, forwardCanvas),
      this.width,
      this.height
    );

    this.update(turtle)

    return turtle
  }

  bgColor(color) {
    this.#backgroundCanvas.style.background = color;
  }
}

customElements.define('x-turtle', TurtleComponent);


// module.exports = {
//   TurtleComponent: TurtleComponent,
//   Turtle: Turtle,
//   Sprite: Sprite
// }
