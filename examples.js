// TurtleCommandList Example

turtle = document.getElementById('canvas').createTurtle()
commands = [
  { action: 'circleAction',
    parameters: [40]
  },
  {
    action: 'penUpAction',
    parameters: []
  },
  { action: 'forwardAction',
    parameters: [100]
  },
  { action: 'penDownAction',
    parameters: []
  },
  {
    action: 'rectangleAction',
    parameters: [80, 80]
  }
]
turtle.turtleCommandsList(commands)

// Example of start with 36 points

turtle = document.getElementById('canvas').createTurtle()
for(let i = 0; i < 36; i++){
    turtle.forward(200)
    turtle.left(170)
}

// Example of Octagram

turtle = document.getElementById('canvas').createTurtle()
turtle.speed(40)
turtle.setLineColor("greenyellow")
turtle.setLineWidth(5)

for(i=0; i<8;i++){
    turtle.left(45)
    for(j=0; j<8;j++) {
        turtle.forward(100)
        turtle.right(45)
    }
}

// Example of spiral with many colors

colors = ['red', 'purple', 'blue', 'green', 'orange', 'yellow']
turtle = document.getElementById('canvas').createTurtle()
turtle.speed(100)
turtle.setLineColor('black')
for(x = 0; x<360; x++) {
    turtle.setLineColor(colors[x%6])
    turtle.forward(x)
    turtle.left(59)
}

// Example of spiral squares

turtle = document.getElementById('canvas').createTurtle()
turtle.setLineColor("red")

function drawSquare(length) {
  for(let i = 0; i < 4; i++) {
    turtle.forward(length)
    turtle.left(90)
  }
}

function drawSquareSpiral(num, angle, length, scale) {
  for(let i = 0; i < num; i++) {
    drawSquare(length)
    turtle.left(angle)
    length = scale * length
  }
}

turtle.setPosition(-5, -53)
drawSquareSpiral(90, 10, 200, 0.97)

// Example of Multple spiral of saquares with multiple colors

function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

function valueToHex(c) {
  var hex = c.toString(16);
  return hex
}

function rgbToHex(r, g, b) {
  return(valueToHex(r) + valueToHex(g) + valueToHex(b));
}

turtle = document.getElementById('canvas').createTurtle()
turtle.speed(100) 
for(x = 1;  x<=400; x++) {
 r = between(0,255) 
 g = between(0,255)  
 b = between(0,255) 
 turtle.setLineColor(`\#\${rgbToHex(valueToHex(r),valueToHex(g),valueToHex(b))}`)
 turtle.forward(50 + x) 
 turtle.right(91) 
}

// Example of binary tree

turtle = document.getElementById('canvas').createTurtle()
turtle.left(90)
turtle.speed(20)
turtle.setLineColor('green')
turtle.setLineWidth(5)
 
function draw_fractal(blen) {
    sfcolor = ["black", "blue", "purple", "grey", "magenta"]
    const randIndex = Math.floor(Math.random() * sfcolor.length);
    turtle.setLineColor(sfcolor[randIndex])
 
    if(blen<10){
        return
    }
    else{
        turtle.forward(blen)
        turtle.left(30)
        draw_fractal(3*blen/4)
        turtle.right(60)
        draw_fractal(3*blen/4)
        turtle.left(30)
        turtle.backward(blen)
    }
 }
draw_fractal(80)

// Example of rainbow

turtle = document.getElementById('canvas').createTurtle()
turtle.setLineWidth(15)

col = ['violet', 'indigo', 'blue',
       'green', 'yellow', 'orange', 'red']

for (let i = 0; i < 7; i++) {
    turtle.setLineColor(col[i])

    turtle.circle((10*(i + 8)), -180)
}

// Example of a Start

turtle = document.getElementById('canvas').createTurtle()

for(let i = 0; i < 20; i ++) {
    turtle.forward(i * 10)
    turtle.right(144)
}

// Example of multiple turtles

turtle = document.getElementById('canvas').createTurtle()
turtle2 =document.getElementById('canvas').createTurtle()

turtle.speed(50)
turtle2.speed(50)

for(let i = 0; i < 20; i++) {
    turtle2.forward(i * 10)
    turtle2.right(80)
    turtle.forward(i * 10)
    turtle.right(144)
}
