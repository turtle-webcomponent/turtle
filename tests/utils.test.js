const { sleep, angleInRadians, angleInDegrees, positionWithAngle } = require('../src/utils.js');

describe('sleep', () => {
  test('system sleeps by one second', () => {
    let timeToSleep = 1000;
    jest.useFakeTimers();

    sleep(timeToSleep).then(() => {
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), timeToSleep);
    });
  });
});

describe('angleInRadians', () => {
  test('calculates angle in radians', () => {
    let angle = 45; // in degrees

    expect(angleInRadians(angle)).toBe(0.7853981633974483);
  });
});

describe('angleInDegrees', () => {
  test('calculates angle in degrees', () => {
    let angle = 2; // in radians

    expect(angleInDegrees(angle)).toBe(114.59155902616465);
  });
});

describe('positionWithAngle', () => {
  test('calculates position with passed angle', () => {
    let angle = 50;
    let distance = 100;
    let position = { x: 0, y: 0 };
    let x = 0 + 100 * (Math.cos(angleInRadians(angle)));
    let y = 0 + 100 * (Math.sin(angleInRadians(angle)));
    let newPosition = { x: x, y: y };

    expect(positionWithAngle(angle, distance, position)).toMatchObject(newPosition);
  });
});