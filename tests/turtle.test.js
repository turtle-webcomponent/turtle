import TurtleComponent from '../src/turtle_component.js';
import '../index';
const { sleep } = require('../src/utils.js');

jest.setTimeout(10000);

describe('when turtle is correctly instanced', () => {
  let canvas = global.document.createElement('x-turtle');
  global.document.body.appendChild(canvas);
  let component = global.document.getElementsByTagName('x-turtle')[0].createTurtle();

  const resetTurtle = () => {
    global.document.body.innerHTML = '';
    canvas = global.document.createElement('x-turtle');
    global.document.body.appendChild(canvas);
    component = global.document.getElementsByTagName('x-turtle')[0].createTurtle();
  };

  const getPosition = async () => {
    return await component.getPosition().then((position) => {
      return position;
    });
  }

  test('draw 100 pixel forward with default degrees', async () => {
    const initialPosition = await getPosition();
    component.forward(100);
    const finalPosition = await getPosition();

    expect(initialPosition).not.toEqual(finalPosition);
    expect(component.angle()).toEqual(0);
    expect(finalPosition.x).toEqual(100);

    resetTurtle();
  });

  test('draw 100 pixel backward with default degrees', async () => {
    const initialPosition = await getPosition();
    component.backward(100);
    const finalPosition = await getPosition();

    expect(initialPosition).not.toEqual(finalPosition);
    expect(component.angle()).toEqual(0);
    expect(finalPosition.x).toEqual(-100);

    resetTurtle();
  });

  test('draw a circle stamp into canvas', async () => {
    component.circle(10);
    await sleep(1000);

    expect(canvas.getImageData(0, 0, canvas.width, canvas.height)).toMatchSnapshot();

    resetTurtle();
  });

  test('draw a rectangle stamp into canvas', async () => {
    component.rectangle(50, 100);
    await sleep(1000);

    expect(canvas.getImageData(0, 0, canvas.width, canvas.height)).toMatchSnapshot();

    resetTurtle();
  });

  test('change turtle speed', async () => {
    const initialSpeed = component.speed();
    component.speed(100);
    await sleep(1000);
    const finalSpeed = component.speed();

    expect(initialSpeed).not.toEqual(finalSpeed);

    resetTurtle();
  });

  test('change turtle angle in right direction', async () => {
    const initialAngle = component.angle();

    component.right(45);
    await sleep(1000);

    const finalAngle = component.angle();

    expect(initialAngle).not.toEqual(finalAngle);
    expect(finalAngle).toEqual(45);

    resetTurtle();
  });

  test('change turtle angle in right direction with complete rotation', async () => {
    component.right(315);
    await sleep(1000);

    const initialAngle = component.angle();

    component.right(45);
    await sleep(1000);

    const finalAngle = component.angle();

    expect(initialAngle).not.toEqual(finalAngle);
    expect(finalAngle).toEqual(0);

    resetTurtle();
  });

  test('change turtle angle in left direction', async () => {
    const initialAngle = component.angle();

    component.left(45);
    await sleep(1000);

    const finalAngle = component.angle();

    expect(initialAngle).not.toEqual(finalAngle);
    expect(finalAngle).toEqual(-45);

    resetTurtle();
  });

  test('change turtle line color when drawing', async () => {
    component.forward(100);
    await sleep(1000);

    const blackLineInCanvas = canvas.getImageData(0, 0, canvas.width, canvas.height);

    resetTurtle();

    component.setLineColor('blue');
    component.forward(100);
    await sleep(1000);

    const blueLineInCanvas = canvas.getImageData(0, 0, canvas.width, canvas.height);

    expect(blackLineInCanvas).not.toEqual(blueLineInCanvas);

    resetTurtle();
  });

  test('move turtle without draw', async () => {
    const initialCanvas = canvas.getImageData(0, 0, canvas.width, canvas.height);

    component.penUp();
    component.forward(100);
    await sleep(1000);

    resetTurtle();

    const finalCanvas = canvas.getImageData(0, 0, canvas.width, canvas.height);

    expect(initialCanvas).toEqual(finalCanvas);

    resetTurtle();
  });

  test('move turtle without draw', async () => {
    const initialCanvas = canvas.getImageData(0, 0, canvas.width, canvas.height);

    component.penUp();
    component.forward(100);
    component.penDown();
    await sleep(1000);

    resetTurtle();

    const finalCanvas = canvas.getImageData(0, 0, canvas.width, canvas.height);

    expect(initialCanvas).toEqual(finalCanvas);

    resetTurtle();
  });

  test('use setPosition as drawable action', async () => {
    component.penUp();
    component.forward(50);
    component.penDown();
    component.forward(50);
    await sleep(2000);

    const movingCanvas = canvas.getImageData(0, 0, canvas.width, canvas.height);

    component.setPosition(50, 0);
    component.forward(50);
    await sleep(1000);

    const positioningCanvas = canvas.getImageData(0, 0, canvas.width, canvas.height);

    expect(movingCanvas).toEqual(positioningCanvas);

    resetTurtle();
  });

  test('compare that single commands is similar to use a list of commands to draw', async () => {
    component.forward(50);
    component.left(90);
    component.forward(50);
    await sleep(2000);

    const canvasBySingleCommands = canvas.getImageData(0, 0, canvas.width, canvas.height);
    const commandsList = [
      {action: 'forwardAction', parameters: [50]},
      {action: 'leftAction', parameters: [90]},
      {action: 'forwardAction', parameters: [50]},
    ];

    resetTurtle();

    component.turtleCommandsList(commandsList);
    await sleep(2000);

    const canvasByCommandsList = canvas.getImageData(0, 0, canvas.width, canvas.height);

    expect(canvasBySingleCommands).toEqual(canvasByCommandsList);

    resetTurtle();
  });
});