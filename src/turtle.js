import { sleep, angleInRadians, positionWithAngle } from './utils.js';

const FULL_CIRCUNFERENCE_ANGLE = 360
const INVISIBLE_COLOR = 'rgb(0, 0, 0, 0)';

export default class Turtle {
  #position
  #angle
  #speed
  #actions
  #moving
  #width
  #height
  #color
  #penUp

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

    this.#backgroundCanvas = backgroundCanvas;
    this.#foregroundCanvas = foregroundCanvas;

    this.#idleSprite = spriteIdle
    this.#moveSprite = spriteMoving
    this.#spritePosition = { x: 0, y: 0 }

    this.#actions = []

    this.runTurtleActionsAndAnimation = this.runTurtleActionsAndAnimation.bind(this)
  }

  async runTurtleActionsAndAnimation() {
    const FPS = 33

    let delayUpdate = await this.#update()
    let delayDraw = await this.#spriteAnimation()

    let delayTotal = (FPS - ((delayUpdate + delayDraw) * 1000))

    if (delayTotal > 0) {
      await sleep(FPS - delayTotal)
    }
  }

  forward(distance) {
    this.#actions.push({ action: 'forwardAction', parameters: [distance] })
  }

  backward(value) {
    this.#actions.push({ action: 'forwardAction', parameters: [-value] })
  }

  setLineColor(color) {
    this.#actions.push({ action: 'setLineColorAction', parameters: [color] })
  }

  circle(radius, circumferenceAngle = FULL_CIRCUNFERENCE_ANGLE) {
    this.#actions.push({ action: 'circleAction', parameters: [radius, circumferenceAngle] })
  }

  rectangle(width, height) {
    this.#actions.push({ action: 'rectangleAction', parameters: [width, height] })
  }

  async #rectangleAction(width, height) {
    await this.#backgroundCanvas.rect(this.#position.x, this.#position.y, width, height);
  }

  speed(speed) {
    if (speed) this.#actions.push({ action: 'speedAction', parameters: [speed] });
    else return this.#speed;
  }

  angle(angle) {
    if (angle) this.#actions.push({ action: 'angleAction', parameters: [angle] });
    else return this.#angle;
  }

  async clear() {
    this.#foregroundCanvas.fillStyle = "rgba(0,0,0,1)";
    this.#foregroundCanvas.globalCompositeOperation = "destination-out";
  }

  turtleCommandsList(commands) {
    this.#actions = commands
  }

  right(value) {
    this.#actions.push({ action: 'rightAction', parameters: [value] })
  }

  setPosition(x, y) {
    this.#actions.push({ action: 'setPositionAction', parameters: [x, y] })
  }

  async getPosition() {
    while (this.#actions.length !== 0)
      await sleep(33)

    return this.#position
  }

  penUp() {
    this.#actions.push({ action: 'penUpAction', parameters: [] });
  }

  penDown() {
    this.#actions.push({ action: 'penDownAction', parameters: [] });
  }

  setLineWidth(width) {
    this.#actions.push({ action: 'setLineWidthAction', parameters: [width] });
  }

  // Private Methods

  async #update() {
    let t0 = performance.now()
    if (this.#actions.length) {
      await this.#runAction()
      this.#actions.splice(0, 1)
    }
    let t1 = performance.now()
    return t1 - t0
  }

  async #runAction() {
    switch(this.#actions[0].action) {
      case "forwardAction":
        await this.#forwardAction(...this.#actions[0].parameters)
        break;
      case "setLineColorAction":
        await this.#setLineColorAction(...this.#actions[0].parameters)
        break;
      case "circleAction":
        await this.#circleAction(...this.#actions[0].parameters)
        break;
      case "rectangleAction":
        await this.#rectangleAction(...this.#actions[0].parameters)
        break;
      case "speedAction":
        this.#speedAction(...this.#actions[0].parameters)
        break;
      case "angleAction":
        this.#angleAction(...this.#actions[0].parameters)
        break;
      case "leftAction":
        await this.#leftAction(...this.#actions[0].parameters)
        break;
      case "rightAction":
        await this.#rightAction(...this.#actions[0].parameters)
        break;
      case "setPositionAction":
        await this.#setPositionAction(...this.#actions[0].parameters)
        break;
      case "penUpAction":
        await this.#penUpAction(...this.#actions[0].parameters)
        break;
      case "penDownAction":
        await this.#penDownAction(...this.#actions[0].parameters)
        break;
      case "setLineWidthAction":
        await this.#setLineWidthAction(...this.#actions[0].parameters)
        break;
    }
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

      this.#position = positionWithAngle(this.#angle, displacement, this.#position)
      this.#spritePosition.x += displacement;
      this.#backgroundCanvas.lineTo(this.#position.x, this.#position.y);

      this.#backgroundCanvas.stroke();
      this.#spriteAnimation();

      distance -= displacement

      await sleep(FPS);
    }
    this.#moving = false;
  }

  async #setLineColorAction(color) {
    this.#color = color;

    if (!this.#penUp) {
      this.#backgroundCanvas.beginPath();
      this.#backgroundCanvas.strokeStyle = color;
    }
  }

  async #circleAction(radius, circumferenceAngle) {
    this.#backgroundCanvas.beginPath();

    let circumferenceStartAngle = this.#angle
    let circumferenceEndAngle = circumferenceAngle+this.#angle

    if(circumferenceAngle < 0) {
      circumferenceStartAngle = circumferenceAngle+this.#angle
      circumferenceEndAngle = this.#angle
    }

    this.#backgroundCanvas.arc(this.#position.x, this.#position.y, radius, angleInRadians(circumferenceStartAngle), angleInRadians(circumferenceEndAngle));
  }

  async #speedAction(speed) {
    this.#speed = speed;
  }

  #angleAction(angle) {
    this.#angle = angle;
  }

  async #rightAction(value) {
    this.#rotateLine(value)
  }

  left(value) {
    this.#actions.push({ action: 'leftAction', parameters: [value] })
  }

  async #leftAction(value) {
    this.#rotateLine(-value)
  }

  async #rotateLine(value) {
    this.#angle += parseInt(value)

    while (this.#angle >= 360)
      this.#angle = this.#angle - 360

    this.#rotateForegroundCanvas('right', value)
  }

  #rotateForegroundCanvas(direction, value) {
    if (direction == 'left')
      value *= -1

      this.#foregroundCanvas.translate(this.#spritePosition.x, this.#spritePosition.y);
      // this rotate works using the center of the canvas defined on translate as reference
      this.#foregroundCanvas.rotate(angleInRadians(value))
      this.#foregroundCanvas.translate(-this.#spritePosition.x, -this.#spritePosition.y);
  }

  async #setPositionAction(x, y) {
    x = parseFloat(x)
    y = parseFloat(y)

    y = y * -1

    this.#backgroundCanvas.moveTo(x, y)
    this.#position = { x: x, y: y }

    this.#foregroundCanvas.setTransform(1, 0, 0, 1, this.#width * 0.5, this.#height * 0.5);
    this.#spritePosition = { x: x, y: y }
    this.#rotateForegroundCanvas("", this.#angle)
  }

  async #penDownAction() {
    this.#penUp = false;
    this.#backgroundCanvas.strokeStyle = this.color;
    this.#backgroundCanvas.beginPath();
    this.#backgroundCanvas.strokeStyle = this.#color;
  }

  async #penUpAction() {
    this.#penUp = true;
    this.#backgroundCanvas.strokeStyle = INVISIBLE_COLOR;
    this.#backgroundCanvas.beginPath();
  }

  async #setLineWidthAction(width) {
    this.#backgroundCanvas.lineWidth = width;
  }

  async #spriteAnimation() {
    var t0 = performance.now()
    this.#backgroundCanvas.stroke();

    // Implement a better clear thinkin in this magic numbers
    this.#foregroundCanvas.clearRect(
      this.#spritePosition.x - this.#width,
      this.#spritePosition.y - this.#height,
      this.#width * 3,
      this.#height * 3
    );

    if (this.#moving) {
      await this.#moveSprite.run(this.#spritePosition)
    }
    else {
      await this.#idleSprite.run(this.#spritePosition)
    }

    var t1 = performance.now()

    return t1 - t0
  }
}
