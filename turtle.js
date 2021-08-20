import { sleep, angleInRadians, positionWithAngle } from './utils.js';

export default class Turtle {
  #position
  #angle
  #speed
  #actions
  #penUp
  #penSize

  #backgroundCanvas
  #foregroundCanvas

  constructor(backgroundCanvas, foregroundCanvas, spriteIdle, spriteMoving, width, height) {
    this.#position = { x: 0, y: 0 };
    this.#angle = 0;
    this.#speed = 1;
    this.#penUp = false;
    this.#penSize = 1;
    this.deleted = false;
    this.moving = false;
    this.width = width;
    this.height = height;
    this.color = 'black';
    this.invisibleColor = 'rgb(0, 0, 0, 0)';

    this.#backgroundCanvas = backgroundCanvas;
    this.#foregroundCanvas = foregroundCanvas;

    this.idleSprite = spriteIdle
    this.moveSprite = spriteMoving
    this.spritePosition = { x: 0, y: 0 }

    this.#actions = []

    this.init = this.init.bind(this)
  }

  destroy() {
    this.clear();
    this.#foregroundCanvas.canvas.remove();
    this.deleted = true;
  }

  async init() {
    const FPS = 33

    var delayUpdate = await this.update()
    var delayDraw = await this.draw()

    let delayTotal = (FPS - ((delayUpdate + delayDraw) * 1000))

    if (delayTotal > 0) {
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
    this.#actions.push({ action: 'forwardAction', parameters: [distance] })
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

      this.#position = positionWithAngle(this.#angle, displacement, this.#position)
      this.spritePosition.x += displacement;
      this.#backgroundCanvas.lineWidth = this.#penSize;
      this.#backgroundCanvas.lineTo(this.#position.x, this.#position.y);

      this.#backgroundCanvas.stroke();
      this.draw();

      distance -= displacement

      await sleep(FPS);
    }
    this.moving = false;
  }

  backward(value) {
    this.#actions.push({ action: 'forwardAction', parameters: [-value] })
  }

  setLineColor(color) {
    this.#actions.push({ action: 'setLineColorAction', parameters: [color] })
  }

  async setLineColorAction(color) {
    this.color = color;

    if (!this.#penUp) {
      this.#backgroundCanvas.strokeStyle = color;
      this.#backgroundCanvas.beginPath();
    }
  }

  circle(radius) {
    this.#actions.push({ action: 'circleAction', parameters: [radius] })
  }

  async circleAction(radius) {
    this.#backgroundCanvas.beginPath();
    this.#backgroundCanvas.arc(this.#position.x, this.#position.y, radius, 0, 2 * Math.PI);
  }

  rectangle(width, height) {
    this.#actions.push({ action: 'rectangleAction', parameters: [width, height] })
  }

  async rectangleAction(width, height) {
    this.#backgroundCanvas.rect(this.#position.x, this.#position.y, width, height);
  }

  speed(speed) {
    this.#actions.push({ action: 'speedAction', parameters: [speed] })
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
    this.#actions.push({ action: 'rightAction', parameters: [value] })
  }

  async rightAction(value) {
    this.#angle += parseInt(value)

    while (this.angle > 360)
      this.#angle = this.#angle - 360

    this.rotateForegroundCanvas('right', value)
  }

  left(value) {
    this.#actions.push({ action: 'leftAction', parameters: [value] })
  }

  async leftAction(value) {
    this.#angle -= parseFloat(value) //360 - parseInt(value) + this.#angle

    while (this.angle < 360)
      this.#angle = this.#angle + 360

    this.rotateForegroundCanvas('left', value)
  }

  rotateForegroundCanvas(direction, value) {
    if (direction == 'left')
      value *= -1

    this.#foregroundCanvas.translate(this.spritePosition.x, this.spritePosition.y);
    this.#foregroundCanvas.rotate(angleInRadians(value))
    this.#foregroundCanvas.translate(-this.spritePosition.x, -this.spritePosition.y);
  }

  setPosition(x, y) {
    this.#actions.push({ action: 'setPositionAction', parameters: [x, y] })
  }

  async setPositionAction(x, y) {
    x = parseFloat(x)
    y = parseFloat(y)

    y = y * -1

    this.#backgroundCanvas.moveTo(x, y)
    this.#position = { x: x, y: y }

    this.#foregroundCanvas.setTransform(1, 0, 0, 1, this.width * 0.5, this.height * 0.5);
    this.spritePosition = { x: x, y: y }
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
    this.#actions.push({ action: 'getPositionAction', parameters: [] })
  }

  async getPositionAction() {
    console.log(this.#position, this.spritePosition)
    return this.#position
  }

  penUp() {
    this.#actions.push({ action: 'penUpAction', parameters: [] });
  }

  async penUpAction() {
    this.#penUp = true;
    this.#backgroundCanvas.strokeStyle = this.invisibleColor;
    this.#backgroundCanvas.beginPath();
  }

  penDown() {
    this.#actions.push({ action: 'penDownAction', parameters: [] });
  }

  async penDownAction() {
    this.#penUp = false;
    this.#backgroundCanvas.strokeStyle = this.color;
    this.#backgroundCanvas.beginPath();
  }

  penSize(size) {
    this.#actions.push({ action: 'penSizeAction', parameters: [size] });
  }

  async penSizeAction(size) {
    this.#penSize = size;
  }

  async draw() {
    var t0 = performance.now()
    this.#backgroundCanvas.stroke();

    this.#foregroundCanvas.clearRect(
      this.spritePosition.x - this.width,
      this.spritePosition.y - this.height,
      this.width * 3,
      this.height * 3
    );

    if (this.moving) {
      await this.moveSprite.run(this.spritePosition)
    }
    else {
      await this.idleSprite.run(this.spritePosition)
    }

    var t1 = performance.now()

    return t1 - t0
  }
}
