# Turtle

  Turtle is a way to create graphic elements on the screen with a cartesian plan(x, y) using commands, the original turtle was based on logo language that was used to move robots. Turtle is very popular to teach kids how to programming, and this library implements some of this turtle commands in javascrypt language to be used in any web application or even on jupyter notebook.

## How to install

  To use turtle component you just need to add this lib on your package json:

  ```
    "dependencies": {
      ...
      "turtle-component": "^0.9.2"
    }
  ```
   or use yarn:

   `yarn add turtle-component`
   
### Installing on jupyter notebook

  ...

## How to Use

It's realy simple to use it, this turtle js lib is a HTML component so you justo need to add the `x-turtle` component to you HTML, like this:

![image](https://user-images.githubusercontent.com/20938232/141322294-3098e273-73a8-46d2-b84a-3f0c893000b1.png)


![image](https://user-images.githubusercontent.com/20938232/141025190-c2b3e88c-dce1-49ec-8396-ba7f8069a791.png)

## Turtle functions

* forward(value)
* backward(value)
* setLineColor(color)
* circle(radius)
* rectangle(width, height)
* speed(value)
* clear()
* right(angle)
* left(angle)
* turtleCommandsList(actionList)
* setPosition(x, y)
* getPosition()
* penUp()
* penDown()
