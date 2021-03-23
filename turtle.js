class TurtleComponent extends HTMLElement {
  //TODO: Change drawCanvas TurtleCanvas or ForegroundCanvas
  //Componente chamar os updates das tartarugas.(fazer um comando global na classe turtle)

  #canvas
  #drawCanvas
  #parentDiv

  static get observedAttributes() {
    return ['width', 'height'];
  }

  constructor() {
    super()
    this.#parentDiv = document.createElement("div")
    this.#canvas = document.createElement("canvas");
    this.#drawCanvas = document.createElement("canvas");

    this.turtles = [];

    this.#parentDiv.appendChild(this.#canvas);
    this.#parentDiv.appendChild(this.#drawCanvas);
    this.#parentDiv.style.cssText = "{position: 'relative'}";
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
    this.#canvas.width = this.width
    this.#canvas.height = this.height
    this.#canvas.style = this.canvasStyle

    this.#drawCanvas.width = this.width
    this.#drawCanvas.height = this.height
    this.#parentDiv.style = "position: relative;"

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

  getTurtle() {
    //Passar componente ao invés dos canvas
    var turtle = new Turtle(this.#canvas, this.#drawCanvas)
    this.turtles.push(turtle)
    turtle.run()
    return turtle
  }
}

customElements.define('x-turtle', TurtleComponent);


// Deixar mais claro o que é publico e o que é privado

class Turtle {

  #lastRender
  #position
  #angle
  #speed
  #canvas
  #context
  #actions
  #drawCanvas
  #drawCanvasContext

  constructor(canvas, drawCanvas) {
    this.#lastRender = 0
    this.#position = { x: 0, y: 0 }
    this.#angle = 0
    this.#speed = 1

    this.#canvas = canvas;
    this.#drawCanvas = drawCanvas;
    this.#context = this.#canvas.getContext("2d")
    this.#drawCanvasContext = this.#drawCanvas.getContext("2d")
    this.#actions = []

    this.turtle = this.turtle.bind(this)

    this.angleInDegrees = this.angleInDegrees.bind(this)

    this.#context.translate(this.#canvas.width * 0.5, this.#canvas.height * 0.5);
    this.#drawCanvasContext.translate(this.#drawCanvas.width * 0.5, this.#drawCanvas.height * 0.5);

    this.image = new Image();
    this.image.src = 'turtle.jpg';
  }

  run() {
    window.requestAnimationFrame(this.turtle)
  }

  async turtle(timestamp) {
    var progress = timestamp - this.#lastRender

    await this.update(progress)
    this.draw()

    this.#lastRender = timestamp
    window.requestAnimationFrame(this.turtle)
  }

  async update(progress) {
    if (this.#actions.length) {
      await eval(`this.${this.#actions[0].action}(${this.#actions[0].parameters.toString()})`)
      this.#actions.splice(0, 1)
    }
  }

  async forward(distance) {
    console.log("forward")

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

      this.#context.lineTo(this.#position.x, this.#position.y);
      this.#context.stroke();

      this.#position = this.rotate(this.#angle, displacement, this.#position)
      this.#context.lineTo(this.#position.x, this.#position.y);

      distance -= displacement

      await this.sleep(FPS);
    }
  }

  async backward(value) {
    console.log("backward")

    await this.forward(value * -1)
  }

  async setLineColor(color) {
    console.log("setColor")

    this.#context.beginPath();
    this.#context.strokeStyle = color;
  }

  async circle(radius) {
    console.log("circle")
    this.#context.beginPath();
    this.#context.arc(this.#position.x, this.#position.y, radius, 0, 2 * Math.PI);
  }

  async rectangle(width, height) {
    console.log("reactangle")

    this.#context.rect(this.#position.x, this.#position.y, width, height);
  }

  async speed(speed) {
    console.log("speed")

    this.#speed = speed
  }

  async turtleCommandsList(commands) {
    commands.actions.forEach(action => this.#actions.push(action))
  }

  async right(value) {
    console.log("right")

    this.#angle = value + this.#angle
  }

  async left(value) {
    console.log("left")

    this.#angle = 360 - value + this.#angle
  }

  async setPosition(x, y) {
    console.log("setPosition")

    this.#context.moveTo(x, y * -1)
    this.#position.x = x
    this.#position.y = y * -1
  }

  async getPosition() {
    return this.#position
  }

  //Move this draw to component
  draw() {
    this.#context.stroke();

    this.#drawCanvasContext.clearRect(-225, -300, 450, 600);
    this.#drawCanvasContext.drawImage(this.image, this.#position.x - 15, this.#position.y - 15, 30, 30)
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
