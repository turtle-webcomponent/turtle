class Turtle {

  constructor() {
    this.lastRender = 0
    this.width = 800
    this.height = 600
    this.position = new Point(0,0)
    this.speed = 15
    this.a = 10
    this.b = 10
    this.velX = 0
    this.velY = 0
    this.color = 'black'

    this.distance = 0
    this.move = false
    this.asdf = false
    this.angle = 0

    this.line = new Line(this.position, this.distance, this.angle)

    // Add canvas
    this.canvas = document.createElement("canvas");
    this.canvas.id = "mycanvas"
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style = "border: solid 1px black"
    this.context = this.canvas.getContext("2d")
    document.body.appendChild(this.canvas)

    this.turtle = this.turtle.bind(this)
    this.update = this.update.bind(this)
    this.draw = this.draw.bind(this)
    this.forward = this.forward.bind(this)
    this.right = this.right.bind(this)
    this.left = this.left.bind(this)

    var transX = this.canvas.width * 0.5, transY = this.canvas.height * 0.5;

    this.context.translate(transX, transY);
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
      let new_position = this.position.rotate(this.angle, this.distance)

      if(this.asdf) {
        this.velX = (new_position.x - this.position.x)/progress;
        this.velY = (new_position.y - this.position.y)/progress;
        this.asdf = false
      }

      this.position.x += this.velX;
      this.position.y += this.velY;

      this.distance -= Math.abs(this.velX);
      this.distance -= Math.abs(this.velY);

      if(this.distance <= 0) {
        this.position.x = new_position.x
        this.position.y = new_position.y
        this.move = false
      }
    }
  }

  forward(value) {
    this.move = true
    this.asdf = true
    this.distance = value
  }

  right(value) {
    this.angle = value + this.angle
  }

  left(value) {
    this.angle = 360 - value + this.angle
  }

  set_line_color(value) {
    this.color = value;
    this.context.beginPath();
  }

  set_position(x, y) {
    this.context.moveTo(x, y);
  }

  draw() {
    this.context.strokeStyle = this.color;
    this.context.lineTo(this.position.x, this.position.y)
    this.context.stroke();
  }
}

class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.rotate = this.rotate.bind(this)
    this.angle_in_degrees = this.angle_in_degrees.bind(this)
  }

  rotate(angle, distance) {
    return {
      x: this.x + distance * (Math.cos(this.angle_in_degrees(angle))),
      y: this.y + distance * (Math.sin(this.angle_in_degrees(angle)))
    }
  }

  angle_in_degrees(angle) {
    return angle * Math.PI / 180
  }
}

class Line {
  constructor(point, distance, angle) {
    this.point = point
    this.distance = distance
    this.angle = angle

    this.rotate = this.rotate.bind(this)
    this.angle_in_degrees = this.angle_in_degrees.bind(this)
  }

  rotate(angle, distance) {
    return {
      x: this.x + distance * (Math.cos(this.angle_in_degrees(angle))),
      y: this.y + distance * (Math.sin(this.angle_in_degrees(angle)))
    }
  }

  angle_in_degrees(angle) {
    return angle * Math.PI / 180
  }
}

window.onload = function() {
  turtle = new Turtle();
  turtle.run();
}