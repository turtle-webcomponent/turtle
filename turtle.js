class Turtle {

  constructor() {
    this.lastRender = 0
    this.width = 800
    this.height = 600
    this.position = new Point(0,0)
    this.color = 'black'

    this.distance = 0
    this.move = []
    this.draw_moves = [{x:0, y:0, type: 'move'}]
    this.new_position = {x:0, y:0}
    this.angle = 0

    // Add canvas
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style = "border: solid 1px black"
    this.context = this.canvas.getContext("2d")
    document.body.appendChild(this.canvas)

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
      while(this.move.length) {
        if(this.move[0].type === 'reposition') {
          this.draw_moves.push({x: this.move[0].x, y: this.move[0].y, type: this.move[0].type})
          this.new_position.x = this.move[0].x;
          this.new_position.y = this.move[0].y;
        }
        else if(this.move[0].type === 'move'){
          this.new_position = this.position.rotate(this.move[0].angle, this.move[0].distance, this.new_position)
          this.draw_moves.push({x: this.new_position.x, y: this.new_position.y, type: this.move[0].type})
        }
        else if(this.move[0].type === 'circle') {
          this.draw_moves.push({x: this.new_position.x, y: this.new_position.y, type: this.move[0].type, radius: this.move[0].radius})
        }
        this.move.splice(0, 1)
      }
    }
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
    this.move.push({x: x, y: y, type: 'reposition'})
  }

  draw() {
    this.context.strokeStyle = this.color;
    while(this.draw_moves.length) {
      if(this.draw_moves[0].type === 'reposition') {
        this.context.moveTo(this.draw_moves[0].x, this.draw_moves[0].y)
        this.context.stroke();
      }
      else if(this.draw_moves[0].type === 'move') {
        this.context.lineTo(this.draw_moves[0].x, this.draw_moves[0].y)
        this.context.stroke();
      }
      else if(this.draw_moves[0].type === 'circle') {
        this.context.beginPath();
        this.context.arc(this.draw_moves[0].x,this.draw_moves[0].y,this.draw_moves[0].radius,0,2*Math.PI);
        this.context.stroke();
      }
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

window.onload = function() {
  turtle = new Turtle();
  turtle.run();
}
