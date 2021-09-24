import { Turtle } from '../src/turtle.js';
import { JSDOM } from 'jsdom';
import { TurtleComponent } from '../src/turtle_component.js';

describe('when component is created correctly', () => {
  const component = new TurtleComponent();
  const stubbedCanvas = new JSDOM(
    `<x-turtle width="500" height="500" canvas-class="border: solid 1px black;" />`,
    { url: 'https://localhost' }
  );
  component.width = 500;
  component.height = 500;
  component.canvasClass = 'border: solid 1px black';

  test('create correctly a turtle component', () => {
    expect(component).toMatchObject(stubbedCanvas);
  });

  test('can get canvas width', () => {
    expect(component.width).toEqual('500');
  });

  test('can set canvas width', () => {
    expect(component.width).toEqual('500');
    component.width = 600;
    expect(component.width).toEqual('600');
  });

  test('can get canvas height', () => {
    expect(component.height).toEqual('500');
  });

  test('can set canvas height', () => {
    expect(component.height).toEqual('500');
    component.height = 600;
    expect(component.height).toEqual('600');
  });

  test('can get canvas canvasClass', () => {
    expect(component.canvasClass).toEqual('border: solid 1px black');
  });

  test('can set canvas canvasClass', () => {
    expect(component.canvasClass).toEqual('border: solid 1px black');
    component.canvasClass = 'border: dashed 1px blue';
    expect(component.canvasClass).toEqual('border: dashed 1px blue');
  });
});
