class TurtleComponent extends HTMLElement {
  static get observedAttributes() {
    return [ 'width', 'height' ];
  }

  constructor() {
    super()
    this.canvas = document.createElement("canvas");
    this.turtle = {}

    this.initializeCanvas = this.initializeCanvas.bind(this)
    this.initializeTurtle = this.initializeTurtle.bind(this)
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
      this.maxRating = "border: solid 1px black";
    }

    this.initializeCanvas()
    this.initializeTurtle()
  }

  initializeCanvas() {
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style = this.canvasStyle
    document.body.appendChild(this.canvas)
  }

  initializeTurtle() {
    this.turtle = new Turtle(this.canvas);
    this.turtle.run();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) {
      switch(name) {
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

  getContext() {
    return this.turtle
  }
}

customElements.define('x-turtle', TurtleComponent);



class Turtle {

  constructor(canvas) {
    this.lastRender = 0
    // this.#speed = 1

    this.position = {x:0, y:0}
    this.angle = 0
//     this.#line_width = 1
    this.speed = 1


    this.canvas = canvas;
    this.context = this.canvas.getContext("2d")
    this.actions = []


    // binds
    this.turtle = this.turtle.bind(this)
    this.run = this.run.bind(this)
//     this.update = this.update.bind(this)
    this.draw = this.draw.bind(this)
//     this.forward = this.forward.bind(this)
//     this.simpleMove = this.simpleMove.bind(this)
//     this.right = this.right.bind(this)
    this.sleep = this.sleep.bind(this)
    this.rotate = this.rotate.bind(this)
    this.angleInDegrees = this.angleInDegrees.bind(this)

    this.context.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
  }

  run() {
    window.requestAnimationFrame(this.turtle)
  }

  async turtle(timestamp) {
    var progress = timestamp - this.lastRender

    await this.update(progress)
    this.draw()

    this.lastRender = timestamp
    window.requestAnimationFrame(this.turtle)
  }

  async update(progress) {
    if(this.actions.length) {
      await eval(`this.${this.actions[0].action}(${this.actions[0].parameters.toString()})`)
      this.actions.splice(0, 1)
    }
  }

  async forward(distance) {
    var displacement = null;
    const FPS = 16.6

    while(distance) {
      if (Math.abs(distance) < this.speed/10 * FPS) {
        displacement = distance;
      }
      else {
        if(distance > 0) {
          displacement = Math.round(this.speed/10 * FPS)
        }
        else {
          displacement = Math.round(this.speed/10 * FPS) * -1
        }
      }

      this.context.lineTo(this.position.x, this.position.y);
      this.context.stroke();

      this.position = this.rotate(this.angle, displacement, this.position)
      this.context.lineTo(this.position.x, this.position.y);

      distance -= displacement

      await this.sleep(33);
    }
  }

  async backward(value) {
    await this.forward(value*-1)
  }

  async setLineColor(color) {
    this.context.beginPath();
    this.context.strokeStyle = color;
  }

  async turtleCommandsList(commands) {
    commands.actions.forEach(action => this.actions.push(action))
  }

  rotate(angle, distance, position) {
    return {
      x: position.x + distance * (Math.cos(this.angleInDegrees(angle))),
      y: position.y + distance * (Math.sin(this.angleInDegrees(angle)))
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  draw() {
    this.context.stroke();
  }

  angleInDegrees(angle) {
    return angle * Math.PI / 180
  }
}
