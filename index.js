class TurtleComponent extends HTMLElement {

  #backgroundCanvas
  #parentDiv

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

    this.initializeCanvas()
  }

  initializeCanvas() {
    this.#backgroundCanvas.width = this.width
    this.#backgroundCanvas.height = this.height
    this.#backgroundCanvas.style = "position: absolute !important"
    this.#backgroundCanvas.className = this.canvasClass

    this.#parentDiv.style = "position: relative;"

    this.#backgroundCanvas.getContext("2d").translate(this.#backgroundCanvas.width * 0.5,
                                                      this.#backgroundCanvas.height * 0.5);

    document.body.appendChild(this.#parentDiv)
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
      await turtle.init();
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
    if(idleSprite === null) {
      idleSprite = new Image();
      idleSprite.src = 'idle_turtle.png';
    }

    return new Sprite(1, 10, idleSprite, forwardCanvas, 0.2);
  }

  #moveSprite(moveSprite, forwardCanvas) {
    if(moveSprite === null) {
      moveSprite = new Image();
      moveSprite.src = 'turtle.png';
    }

    return new Sprite(1, 8, moveSprite, forwardCanvas, 0.2);
  }

  getTurtle(idleSprite = null, moveSprite = null) {

    let forwardCanvas = this.#buildForwardCanvas()

    let turtle = new Turtle(
      this.#backgroundCanvas.getContext("2d"),
      forwardCanvas,
      this.#idleSprite(idleSprite, forwardCanvas),
      this.#moveSprite(moveSprite, forwardCanvas),
      this.width,
      this.height
    );

    this.#update(turtle)

    return turtle
  }
}

customElements.define('x-turtle', TurtleComponent);

class Turtle {
  #position
  #angle
  #speed
  #actions
  #moving
  #width
  #height
  #color
  #penUp
  #invisibleColor

  #backgroundCanvas
  #foregroundCanvas

  #idleSprite
  #moveSprite
  #spritePosition

  constructor(backgroundCanvas, foregroundCanvas, spriteIdle, spriteMoving, width, height) {
    this.#position = { x: 0, y: 0 }
    this.#angle = 0
    this.#speed = 1
    this.#moving = false;
    this.#penUp = false;
    this.#width = width;
    this.#height = height;
    this.#color = 'black';
    this.#invisibleColor  = 'rgb(0, 0, 0, 0)';

    this.#backgroundCanvas = backgroundCanvas;
    this.#foregroundCanvas = foregroundCanvas;

    this.#idleSprite = spriteIdle
    this.#moveSprite = spriteMoving
    this.#spritePosition = { x: 0, y: 0 }

    this.#actions = []

    this.init = this.init.bind(this)
  }

  async init() {
    const FPS = 33

    let delayUpdate = await this.#update()
    let delayDraw =  await this.#draw()

    let delayTotal = (FPS - ((delayUpdate + delayDraw)*1000))

    if(delayTotal > 0) {
      await sleep(FPS - delayTotal)
    }
  }

  async #update() {
    let t0 = performance.now()
    if (this.#actions.length) {
      if(this.#allowedMethods(this.#actions[0].action)) {
        await eval(`this.${this.#actions[0].action}(${this.#actions[0].parameters.map(value => `"${value}"`)})`)
      }
      this.#actions.splice(0, 1)
    }
    let t1 = performance.now()
    return t1 - t0
  }

  forward(distance) {
    this.#actions.push({action: '#forwardAction', parameters: [distance]})
  }

  #allowedMethods(action) {
    return ['#forwardAction', '#setLineColorAction', '#setLineColorAction',
            '#circleAction', '#rectangleAction', '#speedAction', '#rightAction',
            '#leftAction', '#setPositionAction', '#penUpAction', '#penDownAction'].includes(action)
  }

  async #forwardAction(distance) {
    this.#backgroundCanvas.beginPath();

    this.#moving = true;
    distance = parseInt(distance)

    let displacement = null;
    const FPS = 66

    while (distance) {
      if (Math.abs(distance) < this.#speed / 10 * FPS) {
        displacement = distance;
      }
      else {
        if (distance > 0) {
          displacement = Math.round(this.#speed / 10 * FPS)
        }
        else {
          displacement = Math.round(this.#speed / 10 * FPS) * -1
        }
      }

      this.#backgroundCanvas.moveTo(this.#position.x, this.#position.y);

      this.#position = postionWithAngle(this.#angle, displacement, this.#position)
      this.#spritePosition.x += displacement;
      this.#backgroundCanvas.lineTo(this.#position.x, this.#position.y);

      this.#backgroundCanvas.stroke();
      this.#draw();

      distance -= displacement

      await sleep(FPS);
    }
    this.#moving = false;
  }

  backward(value) {
    this.#actions.push({action: '#forwardAction', parameters: [-value]})
  }

  setLineColor(color) {
    this.#actions.push({action: '#setLineColorAction', parameters: [color]})
  }

  async #setLineColorAction(color) {
    this.#color = color;

    if (!this.#penUp) {
      this.#backgroundCanvas.beginPath();
      this.#backgroundCanvas.strokeStyle = color;
    }
  }

  circle(radius) {
    this.#actions.push({action: '#circleAction', parameters: [radius]})
  }

  async #circleAction(radius) {
    this.#backgroundCanvas.beginPath();
    this.#backgroundCanvas.arc(this.#position.x, this.#position.y, radius, 0, 2 * Math.PI);
  }

  rectangle(width, height) {
    this.#actions.push({action: '#rectangleAction', parameters: [width, height]})
  }

  async #rectangleAction(width, height) {
    this.#backgroundCanvas.rect(this.#position.x, this.#position.y, width, height);
  }

  speed(speed) {
    this.#actions.push({action: '#speedAction', parameters: [speed]})
  }

  async clear() {
    this.#foregroundCanvas.fillStyle = "rgba(0,0,0,1)";
    this.#foregroundCanvas.globalCompositeOperation = "destination-out";
  }

  async #speedAction(speed) {
    this.#speed = speed
  }

  turtleCommandsList(commands) {
    this.#actions = commands
  }

  right(value) {
    this.#actions.push({action: '#rightAction', parameters: [value]})
  }

  async #rightAction(value) {
    this.#angle += parseInt(value)

    while(this.angle > 360)
      this.#angle = this.#angle - 360

    this.#rotateForegroundCanvas('right', value)
  }

  left(value) {
    this.#actions.push({action: '#leftAction', parameters: [value]})
  }

  async #leftAction(value) {
    this.#angle -= parseFloat(value)

    while(this.angle < 360)
      this.#angle = this.#angle + 360

    this.#rotateForegroundCanvas('left', value)
  }

  #rotateForegroundCanvas(direction, value) {
    if(direction == 'left')
      value *= -1

    this.#foregroundCanvas.translate(this.#spritePosition.x, this.#spritePosition.y);
    this.#foregroundCanvas.rotate(angleInRadians(value))
    this.#foregroundCanvas.translate(-this.#spritePosition.x, -this.#spritePosition.y);
  }

  setPosition(x, y) {
    this.#actions.push({action: '#setPositionAction', parameters: [x, y]})
  }

  async #setPositionAction(x, y) {
    x = parseFloat(x)
    y = parseFloat(y)

    y = y*-1

    this.#backgroundCanvas.moveTo(x, y)
    this.#position = {x: x, y: y}

    this.#foregroundCanvas.setTransform(1, 0, 0, 1, this.#width * 0.5, this.#height * 0.5);
    this.#spritePosition = {x: x, y: y}
    this.#rotateForegroundCanvas("", this.#angle)
  }

  async getPosition() {
    while(this.#actions.length !== 0)
      await sleep(33)

    return this.#position
  }

  penUp() {
    this.#actions.push({action: '#penUpAction', parameters: []});
  }

  async #penUpAction() {
    this.#penUp = true;
    this.#backgroundCanvas.strokeStyle = this.#invisibleColor;
    this.#backgroundCanvas.beginPath();
  }

  penDown() {
    this.#actions.push({action: '#penDownAction', parameters: []});
  }

  async #penDownAction() {
    this.#penUp = false;
    this.#backgroundCanvas.strokeStyle = this.color;
    this.#backgroundCanvas.beginPath();
    this.#backgroundCanvas.strokeStyle = this.#color;
  }

  async #draw() {
    var t0 = performance.now()
    this.#backgroundCanvas.stroke();

    this.#foregroundCanvas.clearRect(
      this.#spritePosition.x - this.#width,
      this.#spritePosition.y - this.#height,
      this.#width*3,
      this.#height*3
    );

    if(this.#moving) {
      await this.#moveSprite.run(this.#spritePosition)
    }
    else {
      await this.#idleSprite.run(this.#spritePosition)
    }

    var t1 = performance.now()

    return t1 - t0
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function angleInRadians(angle) {
  return angle * Math.PI / 180
}

function angleInDegrees(angle) {
  return angle * (180 / Math.PI)
}

function postionWithAngle(angle, distance, position) {
  return {
    x: position.x + distance * (Math.cos(angleInRadians(angle))),
    y: position.y + distance * (Math.sin(angleInRadians(angle)))
  }
}

class Sprite {
  #rows
  #columns
  #image
  #frameWidth
  #frameHeight
  #currentFrame
  #maxFrame
  #canvas
  #spriteScale

  constructor(rows, columns, image, canvas, spriteScale) {
    this.#rows = rows;
    this.#columns = columns;
    this.#image = image;
    this.#frameWidth = image.width / columns;
    this.#frameHeight = image.height / rows;
    this.#currentFrame = 0;
    this.#maxFrame = columns * rows - 1;
    this.#canvas = canvas;
    this.#spriteScale = {width: this.frameWidth*spriteScale, height: this.frameHeight*spriteScale};

    this.#loadImage(image, spriteScale);
  }

  #loadImage(image, spriteScale) {
    image.onload = () => {
      this.#image = image;
      this.#frameWidth = image.width / this.#columns;
      this.#frameHeight = image.height / this.#rows;
      this.#spriteScale = {width: this.#frameWidth*spriteScale, height: this.#frameHeight*spriteScale};
      this.#currentFrame = 0;
    }
  }

  async run(position) {
    this.#currentFrame++;

    if (this.#currentFrame > this.#maxFrame){
        this.#currentFrame = 0;
    }

    let column = this.#currentFrame % this.#columns;
    let row = Math.floor(this.#currentFrame / this.#columns);

    this.#canvas.drawImage(
      this.#image,
      column * this.#frameWidth,
      row * this.#frameHeight,
      this.#frameWidth,
      this.#frameHeight,
      position.x - this.#getCenterOffset().width,
      position.y - this.#getCenterOffset().height,
      this.#spriteScale.width,
      this.#spriteScale.height
    );

    await sleep(1000/this.#maxFrame)
  }

  #getCenterOffset() {
    return { width: (this.#spriteScale.width/2), height: (this.#spriteScale.height/2) }
  }
}

module.exports = {
  TurtleComponent: TurtleComponent,
  Turtle: Turtle,
  Sprite: Sprite
}