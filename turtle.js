class TurtleComponent extends HTMLElement {
  //Componente chamar os updates das tartarugas.(fazer um comando global na classe turtle)

  #backgroundCanvas
  #foregroundCanvas
  #backgroundCanvasContex
  #foregroundCanvasContex
  #parentDiv
  #image

  static get observedAttributes() {
    return ['width', 'height'];
  }

  constructor() {
    super()
    this.#parentDiv = document.createElement("div")
    this.#backgroundCanvas = document.createElement("canvas");
    this.#foregroundCanvas = document.createElement("canvas");

    this.turtles = [];

    this.#parentDiv.appendChild(this.#backgroundCanvas);
    this.#parentDiv.appendChild(this.#foregroundCanvas);
    this.#parentDiv.style.cssText = "{position: 'relative'}";

    this.#backgroundCanvasContex = this.#backgroundCanvas.getContext("2d")
    this.#foregroundCanvasContex = this.#foregroundCanvas.getContext("2d")

    this.#image = new Image();
    this.#image.src = 'turtle.jpg';
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

    this.initializeCanvas()
  }

  initializeCanvas() {
    this.#backgroundCanvas.width = this.width
    this.#backgroundCanvas.height = this.height
    this.#backgroundCanvas.style = this.canvasStyle

    this.#foregroundCanvas.width = this.width
    this.#foregroundCanvas.height = this.height
    this.#parentDiv.style = "position: relative;"

    this.#backgroundCanvasContex.translate(this.#backgroundCanvas.width * 0.5, this.#backgroundCanvas.height * 0.5);
    this.#foregroundCanvasContex.translate(this.#foregroundCanvas.width * 0.5, this.#foregroundCanvas.height * 0.5);

    this.#foregroundCanvasContex.drawImage(this.#image, - 15, - 15, 40, 40)

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
      await turtle.init()
      // await sleep(33)
    }
  }

  getTurtle() {
    var turtle = new Turtle(this.#backgroundCanvasContex, this.#foregroundCanvasContex, this.#image)
    this.turtles.push(turtle)
    // turtle.run()
    this.update(turtle)
    return turtle
  }
}

customElements.define('x-turtle', TurtleComponent);


// Deixar mais claro o que é publico e o que é privado
// Remover a quantidade grande de variáveis

class Turtle {

  // #lastRender
  #position
  #angle
  #speed
  #actions

  #backgroundCanvas
  #foregroundCanvas

  // Para fazer mais uma turtle:
      // Checar a troca de contexto

  constructor(backgroundCanvas, foregroundCanvas, image) {
    // this.#lastRender = 0
    this.#position = { x: 0, y: 0 }
    this.#angle = 0
    this.#speed = 1

    // this.#canvas = canvas;
    // this.#drawCanvas = drawCanvas;
    this.#backgroundCanvas = backgroundCanvas;
    this.#foregroundCanvas = foregroundCanvas;
    // this.#backgroundCanvas = this.#canvas.getContext("2d")
    // this.#foregroundCanvas = this.#drawCanvas.getContext("2d")
    this.#actions = []

    this.init = this.init.bind(this)

    //Remove from class
    this.angleInDegrees = this.angleInDegrees.bind(this)

    // this.#backgroundCanvas.translate(this.#canvas.width * 0.5, this.#canvas.height * 0.5);
    // this.#foregroundCanvas.translate(this.#drawCanvas.width * 0.5, this.#drawCanvas.height * 0.5);

    this.image = image
  }

  // run() {
  //   window.requestAnimationFrame(this.turtle)
  // }

  async init() {
  //   var progress = timestamp - this.#lastRender
    const FPS = 33

    var delayUpdate = await this.update()
    var delayDraw =  await this.draw()

    let delayTotal = (FPS - ((delayUpdate + delayDraw)*1000))

    if(delayTotal > 0) {
      await sleep(FPS - delayTotal)
    }

    // this.#lastRender = timestamp
    // window.requestAnimationFrame(this.turtle)
  }

  async update() {
    var t0 = performance.now()
    if (this.#actions.length) {
      // console.log(this[this.#actions[0].action](this.#actions[0].parameters.toString()))
      await this[this.#actions[0].action](this.#actions[0].parameters.toString())//.finally(() => {
      this.#actions.splice(0, 1)
      //});
    }
    // await sleep(33)
    var t1 = performance.now()
    return t1 - t0
  }

  forward(distance) {
    this.#actions.push({action: 'forwardAction', parameters: [distance]})
    // `this.${this.#actions[0].action}(${this.#actions[0].parameters.toString()})`
  }

  //Check a way to add actions to a list and run all the time one by one
  async forwardAction(distance) {
    // console.log("------")
    // console.log("forward")
    // console.log("------")


    var displacement = null;
    const FPS = 33

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

      //Check if context has the position
      this.#backgroundCanvas.lineTo(this.#position.x, this.#position.y);

      this.#position = this.rotate(this.#angle, displacement, this.#position)
      this.#backgroundCanvas.lineTo(this.#position.x, this.#position.y);

      this.#backgroundCanvas.stroke();

      distance -= displacement

      await sleep(FPS);
    }

    return 'forward'
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
    this.#angle = value + this.#angle
  }

  left(value) {
    this.#actions.push({action: 'leftAction', parameters: [value]})
  }

  async leftAction(value) {
    this.#angle = 360 - value + this.#angle
  }

  setPosition(x, y) {
    this.#actions.push({action: 'setPositionAction', parameters: [x, y]})
  }

  async setPositionAction(x, y) {
    this.#backgroundCanvas.moveTo(x, y * -1)
    this.#position.x = x
    this.#position.y = y * -1
  }

  getPosition() {
    return this.#position
  }

  //Move this draw to component
  async draw() {
    var t0 = performance.now()
    this.#backgroundCanvas.stroke();

    this.#foregroundCanvas.clearRect(-225, -300, 450, 600);
    // this.#foregroundCanvas.drawImage(this.image, this.#position.x - 15, this.#position.y - 15, 30, 30)
    var t1 = performance.now()

    return t1 - t0
  }

  angleInDegrees(angle) {
    return angle * Math.PI / 180
  }

  rotate(angle, distance, position) {
    return {
      x: position.x + distance * (Math.cos(this.angleInDegrees(angle))),
      y: position.y + distance * (Math.sin(this.angleInDegrees(angle)))
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function executeFunctionByName(functionName, context /*, args */) {
  var args = Array.prototype.slice.call(arguments, 2);
  var namespaces = functionName.split(".");
  var func = namespaces.pop();
  // for(var i = 0; i < namespaces.length; i++) {
  //   context = context[namespaces[i]];
  // }
  return context[func].apply(context, args);
}