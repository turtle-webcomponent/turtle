import Sprite from '../src/sprite.js';

const idleSprite = new global.window.Image();
idleSprite.src = './assets/idle_turtle.png';

describe('#run', () => {
  test('creates a sprite object correctly', () => {
    let timeToSleep = 1000;
    const canvas = global.document.getElementById('canvas').getContext('2d');
    const sprite = new Sprite(1, 1, idleSprite, canvas, 0.2);

    jest.mock('../src/sprite.js');
    jest.useFakeTimers();

    expect(typeof sprite).toBe('object');

    sprite.run(10).then(() => {
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), timeToSleep);
    });
  });
});
