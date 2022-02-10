import idleTurtle from '../assets/idle_turtle.png';
import moveTurtle from '../assets/turtle.png';
import Sprite from './sprite.js';
import Turtle from './turtle.js';

class TurtleComponent extends HTMLElement {
  #backgroundCanvas
  #parentDiv
  #forwardCanvas

  static get observedAttributes() {
    return ['width', 'height'];
  }

  constructor() {
    super()
    this.#parentDiv = document.createElement("div")
    this.#backgroundCanvas = document.createElement("canvas");
    this.#parentDiv.appendChild(this.#backgroundCanvas);
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

  get canvasClass() {
    return this.getAttribute('canvas-class');
  }

  set canvasClass(value) {
    this.setAttribute('canvas-class', value);
  }

  connectedCallback() {
    if (!this.width) {
      this.width = 300;
    }
    if (!this.height) {
      this.height = 300;
    }
    if (!this.canvasClass) {
      this.canvasClass = "border: solid 1px black;";
    }

    this.initializeCanvas();
  }

  initializeCanvas(parent = document.body) {
    this.#backgroundCanvas.width = this.width
    this.#backgroundCanvas.height = this.height
    this.#backgroundCanvas.style = "position: absolute !important"
    this.#backgroundCanvas.className = this.canvasClass

    this.#parentDiv.style = "position: relative;"

    this.#backgroundCanvas.getContext("2d").translate(this.#backgroundCanvas.width * 0.5,
                                                      this.#backgroundCanvas.height * 0.5);

    parent.appendChild(this.#parentDiv);
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
        case 'canvas-class':
          this.canvasClass = newVal
          break;
      }
    }
  }

  async #update(turtle){
    while(true) {
      await turtle.runTurtleActionsAndAnimation();
    }
  }

  #buildForwardCanvas() {
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

  #idleSprite(idleSprite, forwardCanvas) {
    idleSprite = new Image();
    idleSprite.src = idleTurtle;

    return new Sprite(1, 10, idleSprite, forwardCanvas, 0.2);
  }

  #moveSprite(moveSprite, forwardCanvas) {
    moveSprite = new Image();
    moveSprite.src = moveTurtle;

    return new Sprite(1, 8, moveSprite, forwardCanvas, 0.2);
  }

  buildSprite(rows, colums, image, scale) {
    return new Sprite(rows, colums, image, null, scale);
  }

  createTurtle(idleSprite = null, moveSprite = null) {
    let forwardCanvas = this.#buildForwardCanvas();

    if (idleSprite) idleSprite.setCanvas(forwardCanvas);
    if (moveSprite) moveSprite.setCanvas(forwardCanvas);

    let turtle = new Turtle(
      this.#backgroundCanvas.getContext("2d"),
      forwardCanvas,
      (idleSprite == null) ? this.#idleSprite(idleSprite, forwardCanvas) : idleSprite,
      (moveSprite == null) ? this.#moveSprite(moveSprite, forwardCanvas) : moveSprite,
      this.width,
      this.height
    );

    this.#update(turtle);

    return turtle;
  }

  getImageData(x, y, width, height) {
    return this.#backgroundCanvas.getContext('2d').getImageData(x, y, width, height);
  }
}

export { TurtleComponent, Sprite }
