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
    this.move = []
    this.draw_moves = [{x:0, y:0}]
    this.new_position = {x:0, y:0}
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
      while(this.move.length) {
        // while(true) {
          this.new_position = this.position.rotate(this.move[0].angle, this.move[0].distance, this.new_position)
          console.log('***********************')
          console.log(this.move[0])
          console.log(this.new_position)
          console.log('***********************')

          // if(this.asdf) {
            // this.velX = 1*progress;
            // this.velY = 1*progress;
            // this.asdf = false
          // }

          // this.position.x += this.velX;
          // this.position.y += this.velY;

          // this.move[i].distance -= Math.abs(this.velX);
          // this.move[i].distance -= Math.abs(this.velY);

          // if(this.distance <= 0) {
            // this.position.x = new_position.x
            // this.position.y = new_position.y

            this.draw_moves.push(this.new_position)
            this.move.splice(0, 1)
            // break;
          // }
        // }
      }
    }
  }

  forward(value) {
    this.move.push({distance: value, angle: this.angle})
    this.asdf = true

    // this.distance = value
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
    while(this.draw_moves.length) {
      this.context.lineTo(this.draw_moves[0].x, this.draw_moves[0].y)
      this.draw_moves.splice(0, 1);
    }
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

class Line {
  constructor(point, distance, angle) {
    this.point = point
    this.distance = distance
    this.angle = angle

    this.rotate = this.rotate.bind(this)
    this.angle_in_degrees = this.angle_in_degrees.bind(this)
  }

  rotate(angle, distance, position) {
    return {
      x: position[0].x + distance * (Math.cos(this.angle_in_degrees(angle))),
      y: position[0].y + distance * (Math.sin(this.angle_in_degrees(angle)))
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