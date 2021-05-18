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
    this.#image.src = 'turtle.png';
    this.image2 = new Image();
    this.image2.src = 'ide_turtle.png';
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
    this.#foregroundCanvasContex.drawImage(this.image2, - 15, - 15, 40, 40)

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
    }
  }

  getTurtle() {
    var turtle = new Turtle(this.#backgroundCanvasContex, this.#foregroundCanvasContex, this.#image, this.image2, this.width, this.height)
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

  constructor(backgroundCanvas, foregroundCanvas, image, image2, width, height) {
    // this.#lastRender = 0
    this.#position = { x: 0, y: 0 }
    this.#angle = 0
    this.#speed = 1
    this.moving = false;
    this.width = width;
    this.height = height;

    // this.#canvas = canvas;
    // this.#drawCanvas = drawCanvas;
    this.#backgroundCanvas = backgroundCanvas;
    this.#foregroundCanvas = foregroundCanvas;
    this.sprite = new Sprite(1, 8, image, foregroundCanvas)
    this.sprite2 = new Sprite(1, 10, image2, foregroundCanvas)
    // this.#backgroundCanvas = this.#canvas.getContext("2d")
    // this.#foregroundCanvas = this.#drawCanvas.getContext("2d")
    this.#actions = []

    this.init = this.init.bind(this)

    //Remove from class

    // this.#backgroundCanvas.translate(this.#canvas.width * 0.5, this.#canvas.height * 0.5);
    // this.#foregroundCanvas.translate(this.#drawCanvas.width * 0.5, this.#drawCanvas.height * 0.5);

    // this.image = image
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
      console.log("parameters: ", `${this.#actions[0].parameters.toString()}`, "func", `${this.#actions[0].action}`)
      await this[this.#actions[0].action](...this.#actions[0].parameters).finally(() => {
        this.#actions.splice(0, 1)
      });
    }
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

    this.moving = true;
    distance = parseInt(distance)

    console.log("forward", distance)

    var displacement = null;
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

      //Check if context has the position
      this.#backgroundCanvas.lineTo(this.#position.x, this.#position.y);
      this.#position = postionWithAngle(this.#angle, displacement, this.#position)
      this.#backgroundCanvas.lineTo(this.#position.x, this.#position.y);
      console.log('forward while in')

      this.draw();

      distance -= displacement

      await sleep(FPS);
    }
    this.moving = false;
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
    this.#angle += parseInt(value)
  }

  left(value) {
    this.#actions.push({action: 'leftAction', parameters: [value]})
  }

  async leftAction(value) {
    this.#angle = 360 - parseInt(value) + this.#angle
  }

  setPosition(x, y) {
    this.#actions.push({action: 'setPositionAction', parameters: [x, y]})
  }

  async setPositionAction(x, y) {
    var newY = parseInt(y)
    var newX = parseInt(x)

    console.log(newX, newY, x, y)

    // this.#backgroundCanvas.beginPath();
    this.#backgroundCanvas.moveTo(newX, newY)
    // this.#backgroundCanvas.stroke();
    this.#position.x = newX
    this.#position.y = newY
  }

  // getPosition() {
  //   //
  // }

  // getPositionAction() {
  //   return this.#position
  // }

  //Move this draw to component
  async draw() {
    var t0 = performance.now()
    this.#backgroundCanvas.stroke();

    this.#foregroundCanvas.clearRect(
      this.width/2*-1,
      this.height/2*-1,
      this.width,
      this.height
    );
    // spriteMove(this.image, this.#foregroundCanvas)

    if(this.moving) {
      await this.sprite.run(this.#position)
    }
    else {
      await this.sprite2.run(this.#position)
    }

    // In the example a fragment of the image is picked from (100, 0), with a width of 200 and height of 50.
    // The fragment is drawn to (10, 30), with the same width and height as the source. The result will look like this
    // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
    // context.drawImage(img, 100, 0, 200, 50, 10, 30, 200, 50);

    // this.#foregroundCanvas.drawImage(this.image, this.#position.x - 15, this.#position.y - 15, 30, 30)
    var t1 = performance.now()

    return t1 - t0
  }
}

// Get a sprite image
// See the size and how to cut the image
// See what attribute can be passed

// Fix sprite move
// Try to put 2 on the canvas
// Make the turtle rotate
// Make the todo list

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function angleInDegrees(angle) {
  return angle * Math.PI / 180
}

function postionWithAngle(angle, distance, position) {
  return {
    x: position.x + distance * (Math.cos(angleInDegrees(angle))),
    y: position.y + distance * (Math.sin(angleInDegrees(angle)))
  }
}

class Sprite {
  constructor(rows, columns, sprite, canvas) {
    this.rows = rows;
    this.columns = columns;
    this.sprite = sprite;
    this.frameWidth = sprite.width / columns;
    this.frameHeight = sprite.height / rows;
    this.currentFrame = 0;
    this.maxFrame = columns * rows - 1;
    this.canvas = canvas;
    // console.log(canvas)
  }

  async run(position) {
    this.currentFrame++;

    if (this.currentFrame > this.maxFrame){
        this.currentFrame = 0;
    }

    // Update rows and columns
    let column = this.currentFrame % this.columns;
    let row = Math.floor(this.currentFrame / this.columns);

    console.log(this.frameWidth, this.frameHeight)
    // Clear and draw
    this.canvas.clearRect(0, 0, this.canvas.width*-1, this.canvas.height);
    this.canvas.drawImage(
      this.sprite,
      column * this.frameWidth,
      row * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      position.x - (100/2),
      position.y - (100/2),
      100,
      100);

    await sleep(1000/this.maxFrame)
  }
}



// function spriteMove(sprite, canvas) {
//   // Define the number of columns and rows in the sprite
//   let numColumns = 8;
//   let numRows = 1;

//   // Define the size of a frame
//   let frameWidth = sprite.width / numColumns;
//   let frameHeight = sprite.height / numRows;

//   // The sprite image frame starts from 0
//   let currentFrame = 0;

//   setInterval(function()
//   {
//       // Pick a new frame
//       currentFrame++;

//       // Make the frames loop
//       let maxFrame = numColumns * numRows - 1;
//       if (currentFrame > maxFrame){
//           currentFrame = 0;
//       }

//       // Update rows and columns
//       let column = currentFrame % numColumns;
//       let row = Math.floor(currentFrame / numColumns);

//       // Clear and draw
//       canvas.clearRect(0, 0, canvas.width, canvas.height);
//       canvas.drawImage(sprite, column * frameWidth, row * frameHeight, frameWidth, frameHeight, 10, 30, 100, 100);

//   //Wait for next step in the loop
//   }, 1000);
// }