class TurtleComponent extends HTMLElement {

  #backgroundCanvas
  #backgroundCanvasContext
  #parentDiv
  #moveSprite
  #idleSprite

  static get observedAttributes() {
    return ['width', 'height'];
  }

  constructor() {
    super()
    this.#parentDiv = document.createElement("div")
    this.#backgroundCanvas = document.createElement("canvas");

    this.#parentDiv.appendChild(this.#backgroundCanvas);

    this.#moveSprite = new Image();
    this.#moveSprite.src = 'turtle.png';
    this.#idleSprite = new Image();
    this.#idleSprite.src = 'idle_turtle.png';

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

  get spriteScale() {
    return this.getAttribute('sprite-scale');
  }

  set spriteScale(value) {
    this.setAttribute('sprite-scale', value);
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
        case 'idle-sprite':
          this.#idleSprite.src = newVal
          break;
        case 'moving-sprite':
          this.#moveSprite.src = newVal
          break;
        case 'sprite-scale':
          this.spriteScale = newVal
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
    console.log("new canvas")
    console.log(foregroundCanvas)
    let foregroundCanvasContext = foregroundCanvas.getContext("2d")

    foregroundCanvas.width = this.width
    foregroundCanvas.height = this.height

    console.log("values test", ((this.#moveSprite.width/8)*this.spriteScale))
    console.log("values test", (this.#idleSprite.height*this.spriteScale))
    foregroundCanvasContext.translate(
      foregroundCanvas.width * 0.5 - (((this.#moveSprite.width/8)*this.spriteScale)/2),
      foregroundCanvas.height * 0.5 - ((this.#idleSprite.height*this.spriteScale)/2)
    );

    return foregroundCanvasContext
  }

  getTurtle() {
    var turtle = new Turtle(
      this.#backgroundCanvasContext,
      this.buildForwardCanvas(),
      this.#moveSprite,
      this.#idleSprite,
      this.spriteScale,
      this.width,
      this.height
    )

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

  constructor(backgroundCanvas, foregroundCanvas, spriteIdle, spriteMoving, spriteScale, width, height) {
    this.#position = { x: 0, y: 0 }
    this.spritePosition = { x: 0, y: 0}
    this.#angle = 0
    this.#speed = 1
    this.moving = false;
    this.width = width;
    this.height = height;


    this.#backgroundCanvas = backgroundCanvas;
    this.#foregroundCanvas = foregroundCanvas;
    this.idleSprite = new Sprite(1, 8, spriteIdle, foregroundCanvas, spriteScale)
    this.moveSprite = new Sprite(1, 10, spriteMoving, foregroundCanvas, spriteScale)
    this.#actions = []

    console.log(backgroundCanvas)

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
      console.log("parameters: ", `${this.#actions[0].parameters.toString()}`, "func", `${this.#actions[0].action}`)
      await this[this.#actions[0].action](...this.#actions[0].parameters).finally(() => {
        this.#actions.splice(0, 1)
      });
    }
    var t1 = performance.now()
    return t1 - t0
  }

  forward(distance) {
    console.log('width', this.#backgroundCanvas.canvas.width)
    console.log('width', this.#backgroundCanvas.canvas)
    this.#actions.push({action: 'forwardAction', parameters: [distance]})
  }

  async forwardAction(distance) {
    this.moving = true;
    distance = parseInt(distance)

    console.log("forward", distance)

    var displacement = null;
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

      this.#backgroundCanvas.lineTo(this.#position.x, this.#position.y);
      this.#position = postionWithAngle(this.#angle, displacement, this.#position)
      this.spritePosition.x += displacement;
      this.#backgroundCanvas.lineTo(this.#position.x, this.#position.y);
      console.log('forward while in')

      this.draw();

      distance -= displacement

      await sleep(FPS);
    }
    this.moving = false;
  }

  backward(value) {
    this.#actions.push({action: 'backwardAction', parameters: [value]})
  }

  async backwardAction(value) {
    console.log("backward")

    await this.forward(value * -1)
  }

  setLineColor(color) {
    this.#actions.push({action: 'setLineColorAction', parameters: [color]})
  }

  async setLineColorAction(color) {
    this.#backgroundCanvas.beginPath();
    this.#backgroundCanvas.strokeStyle = color;
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

    console.log("sprite pos", this.spritePosition)
    console.log("pos", this.#position)

    this.rotateForegroundCanvas('right', value)
  }

  left(value) {
    this.#actions.push({action: 'leftAction', parameters: [value]})
  }

  async leftAction(value) {
    this.#angle = 360 - parseInt(value) + this.#angle

    this.rotateForegroundCanvas('left', value)
  }

  rotateForegroundCanvas(direction, value) {
    if(direction == 'left')
      value *= -1

    let idleSpriteCenterOffset = this.idleSprite.getCenterOffset()
    let movingSpriteCenterOffset = this.moveSprite.getCenterOffset()

    console.log("offset", idleSpriteCenterOffset, ((this.moveSprite.width/8)/2))
    console.log("offset", movingSpriteCenterOffset)
    console.log("value", value)

    this.#foregroundCanvas.translate(this.spritePosition.x + idleSpriteCenterOffset.width, this.spritePosition.y + idleSpriteCenterOffset.height);
    this.#foregroundCanvas.rotate(angleInDegrees(value))
    this.#foregroundCanvas.translate(-this.spritePosition.x - movingSpriteCenterOffset.width, -this.spritePosition.y - movingSpriteCenterOffset.height);
  }

  setPosition(x, y) {
    this.#actions.push({action: 'setPositionAction', parameters: [x, y]})
  }

  async setPositionAction(x, y) {
    var newY = parseInt(y)
    var newX = parseInt(x)

    console.log(newX, newY, x, y)

    this.#backgroundCanvas.moveTo(newX, newY)
    this.#position.x = newX
    this.#position.y = newY
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
      await this.idleSprite.run(this.spritePosition)
    }
    else {
      await this.moveSprite.run(this.spritePosition)
    }

    var t1 = performance.now()

    return t1 - t0
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function angleInDegrees(angle) {
  return angle * Math.PI / 180
}

function postionWithAngle(angle, distance, position) {
  return {
    x: position.x + distance * (Math.cos(angleInDegrees(angle))),
    y: position.y + distance * (Math.sin(angleInDegrees(angle)))
  }
}

class Sprite {
  constructor(rows, columns, sprite, canvas, spriteScale) {
    this.columns = columns;
    this.sprite = sprite;
    this.frameWidth = sprite.width / columns;
    this.frameHeight = sprite.height / rows;
    this.currentFrame = 0;
    this.maxFrame = columns * rows - 1;
    this.canvas = canvas;
    this.spriteScale = {width: this.frameWidth*spriteScale, height: this.frameHeight*spriteScale};
    console.log("sprite scale", spriteScale)
  }

  async run(position) {
    this.currentFrame++;

    if (this.currentFrame > this.maxFrame){
        this.currentFrame = 0;
    }

    let column = this.currentFrame % this.columns;
    let row = Math.floor(this.currentFrame / this.columns);

    this.canvas.drawImage(
      this.sprite,
      column * this.frameWidth,
      row * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      position.x,
      position.y,
      this.spriteScale.width,
      this.spriteScale.height);

    await sleep(1000/this.maxFrame)
  }

  getCenterOffset() {
    return { width: (this.spriteScale.width/2), height: (this.spriteScale.height/2) }
  }
}
