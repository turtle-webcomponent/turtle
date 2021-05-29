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

  initializeCanvas() {
    this.#backgroundCanvas.width = this.width
    this.#backgroundCanvas.height = this.height
    this.#backgroundCanvas.style = this.canvasStyle

    this.#parentDiv.style = "position: relative;"

    this.#backgroundCanvasContext.translate(this.#backgroundCanvas.width * 0.5, this.#backgroundCanvas.height * 0.5);

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
        case 'canvas-style':
          this.canvasStyle = newVal
          break;
      }
    }
  }

  async update(turtle){
    while(true) {
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
}

customElements.define('x-turtle', TurtleComponent);

class Turtle {
  #position
  #angle
  #speed
  #actions

  #backgroundCanvas
  #foregroundCanvas

  constructor(backgroundCanvas, foregroundCanvas, spriteIdle, spriteMoving, width, height) {
    this.#position = { x: 0, y: 0 }
    this.#angle = 0
    this.#speed = 1
    this.moving = false;
    this.width = width;
    this.height = height;
    this.color = 'black';

    this.#backgroundCanvas = backgroundCanvas;
    this.#foregroundCanvas = foregroundCanvas;

    this.idleSprite = spriteIdle
    this.moveSprite = spriteMoving
    this.spritePosition = { x: 0, y: 0 }

    this.#actions = []

    this.init = this.init.bind(this)
  }

  async init() {
    const FPS = 33

    var delayUpdate = await this.update()
    var delayDraw =  await this.draw()

    let delayTotal = (FPS - ((delayUpdate + delayDraw)*1000))

    if(delayTotal > 0) {
      await sleep(FPS - delayTotal)
    }
  }

  async update() {
    var t0 = performance.now()
    if (this.#actions.length) {
      await this[this.#actions[0].action](...this.#actions[0].parameters).finally(() => {
        this.#actions.splice(0, 1)
      });
    }
    var t1 = performance.now()
    return t1 - t0
  }

  forward(distance) {
    this.#actions.push({action: 'forwardAction', parameters: [distance]})
  }

  async forwardAction(distance) {
    this.#backgroundCanvas.beginPath();

    this.moving = true;
    distance = parseInt(distance)

    var displacement = null;
    const FPS = 66

    while (distance) {
      await this.setLineColorAction(this.color);

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
      this.spritePosition.x += displacement;
      this.#backgroundCanvas.lineTo(this.#position.x, this.#position.y);

      this.#backgroundCanvas.stroke();
      this.draw();

      distance -= displacement

      await sleep(FPS);
    }
    this.moving = false;
  }

  backward(value) {
    this.#actions.push({action: 'forwardAction', parameters: [-value]})
  }

  setLineColor(color) {
    this.#actions.push({action: 'setLineColorAction', parameters: [color]})
  }

  async setLineColorAction(color) {
    this.#backgroundCanvas.strokeStyle = color;
    this.color = color;
    this.#backgroundCanvas.beginPath();
  }

  circle(radius) {
    this.#actions.push({action: 'circleAction', parameters: [radius]})
  }

  async circleAction(radius) {
    this.#backgroundCanvas.beginPath();
    this.#backgroundCanvas.arc(this.#position.x, this.#position.y, radius, 0, 2 * Math.PI);
  }

  rectangle(width, height) {
    this.#actions.push({action: 'rectangleAction', parameters: [width, height]})
  }

  async rectangleAction(width, height) {
    this.#backgroundCanvas.rect(this.#position.x, this.#position.y, width, height);
  }

  speed(speed) {
    this.#actions.push({action: 'speedAction', parameters: [speed]})
  }

  async clear() {
    this.#foregroundCanvas.fillStyle = "rgba(0,0,0,1)";
    this.#foregroundCanvas.globalCompositeOperation = "destination-out";
  }

  async speedAction(speed) {
    this.#speed = speed
  }

  /*
    There is a limitation here, you can't call this methods together with anothers in a
    roll cause this one is synchronous ans all the other not.
  */
  turtleCommandsList(commands) {
    commands.actions.forEach(action => this.#actions.push(action))
  }

  right(value) {
    this.#actions.push({action: 'rightAction', parameters: [value]})
  }

  async rightAction(value) {
    this.#angle += parseInt(value)

    while(this.angle > 360)
      this.#angle = this.#angle - 360

    this.rotateForegroundCanvas('right', value)
  }

  left(value) {
    this.#actions.push({action: 'leftAction', parameters: [value]})
  }

  async leftAction(value) {
    this.#angle -= parseFloat(value) //360 - parseInt(value) + this.#angle

    while(this.angle < 360)
      this.#angle = this.#angle + 360

    this.rotateForegroundCanvas('left', value)
  }

  rotateForegroundCanvas(direction, value) {
    if(direction == 'left')
      value *= -1

    this.#foregroundCanvas.translate(this.spritePosition.x, this.spritePosition.y);
    this.#foregroundCanvas.rotate(angleInRadians(value))
    this.#foregroundCanvas.translate(-this.spritePosition.x, -this.spritePosition.y);
  }

  setPosition(x, y) {
    this.#actions.push({action: 'setPositionAction', parameters: [x, y]})
  }

  async setPositionAction(x, y) {
    x = parseFloat(x)
    y = parseFloat(y)

    y = y*-1

    this.#backgroundCanvas.moveTo(x, y)
    this.#position = {x: x, y: y}

    this.#foregroundCanvas.setTransform(1, 0, 0, 1, this.width * 0.5, this.height * 0.5);
    this.spritePosition = {x: x, y: y}
    this.rotateForegroundCanvas("", this.#angle)

    // let tangentAngle = angleInDegrees(Math.atan(x / y))
    // let betaAngle = this.#angle + tangentAngle
    // let distanceToOrigin = Math.hypot(x, y)

    // let newX = Math.sin(angleInRadians(betaAngle)) * distanceToOrigin
    // let newY = Math.cos(angleInRadians(betaAngle)) * distanceToOrigin

    // console.log(tangentAngle, betaAngle, distanceToOrigin, newX, newY)

    // this.spritePosition.x = newX
    // this.spritePosition.y = newY
  }

  getPosition() {
    this.#actions.push({action: 'getPositionAction', parameters: []})
  }

  async getPositionAction() {
    console.log(this.#position, this.spritePosition)
    return this.#position
  }

  async draw() {
    var t0 = performance.now()
    this.#backgroundCanvas.stroke();

    this.#foregroundCanvas.clearRect(
      this.spritePosition.x - this.width,
      this.spritePosition.y - this.height,
      this.width*3,
      this.height*3
    );

    if(this.moving) {
      await this.moveSprite.run(this.spritePosition)
    }
    else {
      await this.idleSprite.run(this.spritePosition)
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
  constructor(rows, columns, image, canvas, spriteScale) {
    this.rows = rows;
    this.columns = columns;
    this.image = image;
    this.frameWidth = image.width / columns;
    this.frameHeight = image.height / rows;
    this.currentFrame = 0;
    this.maxFrame = columns * rows - 1;
    this.canvas = canvas;
    this.spriteScaleValue = spriteScale
    this.spriteScale = {width: this.frameWidth*spriteScale, height: this.frameHeight*spriteScale};

    this.loadImage(image, spriteScale);
  }

  loadImage(image, spriteScale) {
    image.onload = () => {
      this.image = image;
      this.frameWidth = image.width / this.columns;
      this.frameHeight = image.height / this.rows;
      this.spriteScale = {width: this.frameWidth*spriteScale, height: this.frameHeight*spriteScale};
      this.currentFrame = 0;
    }
  }

  async run(position) {
    this.currentFrame++;

    if (this.currentFrame > this.maxFrame){
        this.currentFrame = 0;
    }

    let column = this.currentFrame % this.columns;
    let row = Math.floor(this.currentFrame / this.columns);

    this.canvas.drawImage(
      this.image,
      column * this.frameWidth,
      row * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      position.x - this.getCenterOffset().width,
      position.y - this.getCenterOffset().height,
      this.spriteScale.width,
      this.spriteScale.height
    );

    await sleep(1000/this.maxFrame)
  }

  getCenterOffset() {
    return { width: (this.spriteScale.width/2), height: (this.spriteScale.height/2) }
  }
}
