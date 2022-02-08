import '../index';
import Turtle from '../src/turtle.js';
import { JSDOM } from 'jsdom';
import { TurtleComponent } from '../src/turtle_component.js';

describe('when component is created correctly', () => {
  const component = new TurtleComponent();
  const stubbedCanvas = new JSDOM(
    `<x-turtle width="300" height="300" canvas-class="border: solid 1px black;" />`,
    { url: 'https://localhost' }
  );
  component.width = 300;
  component.height = 300;
  component.canvasClass = 'border: solid 1px black;';

  test('create correctly a turtle component', () => {
    expect(component).toMatchObject(stubbedCanvas);
  });

  test('can get canvas width', () => {
    expect(component.width).toEqual('300');
  });

  test('can set canvas width', () => {
    expect(component.width).toEqual('300');
    component.width = 600;
    expect(component.width).toEqual('600');
  });

  test('can get canvas height', () => {
    expect(component.height).toEqual('300');
  });

  test('can set canvas height', () => {
    expect(component.height).toEqual('300');
    component.height = 600;
    expect(component.height).toEqual('600');
  });

  test('can get canvas canvasClass', () => {
    expect(component.canvasClass).toEqual('border: solid 1px black;');
  });

  test('can set canvas canvasClass', () => {
    expect(component.canvasClass).toEqual('border: solid 1px black;');
    component.canvasClass = 'border: dashed 1px blue;';
    expect(component.canvasClass).toEqual('border: dashed 1px blue;');
  });

  test('can initialize background canvas', () => {
    const document = global.document.cloneNode(true);
    component.initializeCanvas();

    expect(document).not.toMatchObject(global.document);
  });

  test('can create a new turtle', () => {
    const document = global.document.cloneNode(true);
    const turtle = component.createTurtle();

    expect(turtle instanceof Turtle).toBe(true);
    expect(document).not.toMatchObject(global.document);
  });

  test('can initialize component as tag', () => {
    global.document.body.innerHTML = '<x-turtle />';
    const turtle = global.document.getElementsByTagName('x-turtle')[0];

    expect(turtle).toMatchObject(stubbedCanvas);
    expect(turtle.width).toBe('300');
    expect(turtle.height).toBe('300');
    expect(turtle.canvasClass).toBe('border: solid 1px black;');
  });
});
