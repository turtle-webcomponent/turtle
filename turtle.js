class Turtle {

  //Add turtle picture
  constructor(canvas) {
    this.lastRender = 0
    this.position = new Point(0,0)
    this.color = 'black'

    this.distance = 0
    this.move = []
    this.draw_moves = []
    this.new_position = {x:0, y:0}
    this.angle = 0
    this.line_width = 2
    this.speed = 1

    // Make this private
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d")

    // binds
    this.turtle = this.turtle.bind(this)
    this.update = this.update.bind(this)
    this.draw = this.draw.bind(this)
    this.forward = this.forward.bind(this)
    this.right = this.right.bind(this)
    this.left = this.left.bind(this)

    this.context.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
  }

  run() {
    window.requestAnimationFrame(this.turtle)
  }

  turtle(timestamp) {
    var progress = timestamp - this.lastRender

    this.update(progress)
    this.draw()

    this.lastRender = timestamp
    window.requestAnimationFrame(this.turtle)
  }

  update(progress) {
    if(this.move) {
      if(this.move.length) {
        if (this.move[0].type === 'reposition') this.reposition_move()
        else if (this.move[0].type === 'move') this.simple_move(progress)
        else if (this.move[0].type === 'circle') this.circle_move()
        else if (this.move[0].type === 'rectangle') this.rectangle_move()
        else if(this.move[0].type === 'change_color') {
          this.draw_moves.push({type: this.move[0].type, color: this.move[0].color})
        }

        if (this.move[0].type !== 'move' || Math.round(this.move[0].distance) === 0) this.move.splice(0, 1)
      }
    }
  }

  reposition_move() {
    this.draw_moves.push({ x: this.move[0].x, y: this.move[0].y, type: this.move[0].type })
    this.new_position = { x: this.move[0].x, y: this.move[0].y }
  }

  simple_move(fps) {
    var displacement = null;

    if (this.move[0].distance < this.speed/10 * fps) displacement = this.move[0].distance;
    else displacement = Math.round(this.speed/10 * fps)

    this.move[0].distance -= displacement
    this.new_position = this.position.rotate(this.move[0].angle, displacement, this.new_position)
    // this.new_position = this.position.rotate(this.move[0].angle, this.move[0].distance, this.new_position)
    this.draw_moves.push({ x: this.new_position.x, y: this.new_position.y, type: this.move[0].type })
  }

  circle_move() {
    this.draw_moves.push({ x: this.new_position.x, y: this.new_position.y, type: this.move[0].type, radius: this.move[0].radius })
  }

  rectangle_move() {
    this.draw_moves.push({
      x: this.new_position.x,
      y: this.new_position.y,
      width: this.move[0].width,
      height: this.move[0].height,
      type: this.move[0].type
    })
  }

  forward(value) {
    this.move.push({distance: value, angle: this.angle, type: 'move'})
  }

  backward(value) {
    this.forward(value*-1)
  }

  circle(radius) {
    this.move.push({radius: radius, type: 'circle'})
  }

  rectangle(width, height) {
    this.move.push({width: width, height: height, type: 'rectangle'})
  }

  right(value) {
    this.angle = value + this.angle
  }

  left(value) {
    this.angle = 360 - value + this.angle
  }

  set_line_color(color) {
    this.move.push({color: color, type: 'change_color'})
  }

  set_position(x, y) {
    this.move.push({x: x, y: y, type: 'reposition'})
  }

  set_line_width(value) {
    this.line_width = value;
  }

  draw() {
    this.context.lineWidth = this.line_width
    if(this.draw_moves.length) {
      if(this.draw_moves[0].type === 'reposition') {
        this.context.moveTo(this.draw_moves[0].x, this.draw_moves[0].y)
      }
      else if(this.draw_moves[0].type === 'move') {
        this.context.lineTo(this.draw_moves[0].x, this.draw_moves[0].y)
      }
      else if(this.draw_moves[0].type === 'circle') {
        this.context.beginPath();
        this.context.arc(this.draw_moves[0].x,this.draw_moves[0].y,this.draw_moves[0].radius,0,2*Math.PI);
      }
      else if(this.draw_moves[0].type === 'rectangle') {
        this.context.beginPath();
        this.context.rect(this.draw_moves[0].x, this.draw_moves[0].y, this.draw_moves[0].width, this.draw_moves[0].height);
      }
      else if(this.draw_moves[0].type === 'change_color') {
        this.context.beginPath();
        this.context.strokeStyle = this.draw_moves[0].color;
      }
      this.context.stroke();

      this.draw_moves.splice(0, 1);
    }
  }
}

class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.rotate = this.rotate.bind(this)
    this.angle_in_degrees = this.angle_in_degrees.bind(this)
  }

  rotate(angle, distance, position) {
    return {
      x: position.x + distance * (Math.cos(this.angle_in_degrees(angle))),
      y: position.y + distance * (Math.sin(this.angle_in_degrees(angle)))
    }
  }

   angle_in_degrees(angle) {
    return angle * Math.PI / 180
  }
}


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
