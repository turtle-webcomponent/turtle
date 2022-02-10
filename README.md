# Turtle

  Turtle is a way to create graphic elements on the screen with a cartesian plan(x, y) using commands, the original turtle was based on logo language that was used to move robots. Turtle is very popular to teach kids how to programming, and this library implements some of this turtle commands in javascrypt language to be used in any web application or even on jupyter notebook.

## Install

```sh
$ yarn install
$ yarn build
$ yarn start
```

## Add package on project

  To use turtle component you just need to add this lib on your package json:

  ```javascript
    "dependencies": {
      ...
      "turtle-component": "^0.9.2"
    }
  ```
   or use yarn:

   `yarn add turtle-component`
   
### Installing on jupyter notebook

See README in [ipyxturtle](https://github.com/x-turtle/ipyxturtle) implementation.

## How to Use

It's realy simple to use it, this turtle js lib is a HTML component so you justo need to add the `x-turtle` component to you HTML, like this:

![image](https://user-images.githubusercontent.com/20938232/141322294-3098e273-73a8-46d2-b84a-3f0c893000b1.png)

the HTML params `widht`, `heigth` and `canvas-class` are the only ones that the component receives. The `canvas-class` sets a class to the drawing canvas, what is usefull if you want to add some styles or even make some changes on the canvas.

The component has a method called createTurtle that retuns a new turtle on the canvas screen

![image](https://user-images.githubusercontent.com/20938232/141324518-36f2a24f-c5a6-49fb-a7cc-bf56747d8d31.png)

After use the create turtle the sprite of the turtle will pop up on the canvas, then just use the created turtle to execute the turtle commands, for example:

![image](https://user-images.githubusercontent.com/20938232/141324887-279592f2-871e-4f3a-a66f-d6ff3cd9a72c.png)

This way you cand draw many things on the screen, here down is a example:

with this code:

```javascript
turtle.setLineColor('blue')
for(let i = 0; i < 20; i++){
    turtle.forward(i * 10)
    turtle.right(144)
}
```
you can draw this:

![image](https://user-images.githubusercontent.com/20938232/141325463-5c952176-cd87-4fb2-8a57-3baf1fef9e65.png)

Have fun!

## Turtle functions

* forward(value): draw a line forward the size you define
* backward(value): draw a line backward the size you define
* setLineColor(color): changes the line color
* circle(radius): creates a circle on the screen wiht the defined radius
* rectangle(width, height): creats a retangle on the screen with the defined width and height
* speed(value): Changes the draw speed
* clear(): Cleans the canvas
* right(angle): Add a defined angle to right
* left(angle): Add a defined angle to left
* setPosition(x, y): Changes the turtle position
* getPosition(): Returns the turtle position
* penUp(): Unses the drawing mode
* penDown(): Sets the drawing mode
* turtleCommandsList(actionList): Receives a Json list of commands, the list mus be on this format:

```javascript
[
  { action: 'forwardAction',
    parameters: [100]
  },
  {
    action: 'leftAction',
    parameters: [90]
  },
  { action: 'forwardAction',
    parameters: [100]
  },
  {
    action: 'leftAction',
    parameters: [90]
  },
  { action: 'forwardAction',
    parameters: [100]
  },
  {
    action: 'leftAction',
    parameters: [90]
  },
  { action: 'forwardAction',
    parameters: [100]
  },
]
```

Note that the actions must have an `Action` suffix on the action name, and the parameters must be a list.
