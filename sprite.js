import { sleep } from './utils.js';

export default class Sprite {
  constructor(rows, columns, image, canvas, spriteScale) {
    this.rows = rows;
    this.columns = columns;
    this.image = image;
    this.frameWidth = image.width / columns;
    this.frameHeight = image.height / rows;
    this.currentFrame = 0;
    this.maxFrame = columns * rows - 1;
    this.canvas = canvas;
    this.spriteScaleValue = spriteScale
    this.spriteScale = { width: this.frameWidth * spriteScale, height: this.frameHeight * spriteScale };

    this.loadImage(image, spriteScale);
  }

  loadImage(image, spriteScale) {
    image.onload = () => {
      this.image = image;
      this.frameWidth = image.width / this.columns;
      this.frameHeight = image.height / this.rows;
      this.spriteScale = { width: this.frameWidth * spriteScale, height: this.frameHeight * spriteScale };
      this.currentFrame = 0;
    }
  }

  async run(position) {
    this.currentFrame++;

    if (this.currentFrame > this.maxFrame) {
      this.currentFrame = 0;
    }

    let column = this.currentFrame % this.columns;
    let row = Math.floor(this.currentFrame / this.columns);

    this.canvas.drawImage(
      this.image,
      column * this.frameWidth,
      row * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      position.x - this.getCenterOffset().width,
      position.y - this.getCenterOffset().height,
      this.spriteScale.width,
      this.spriteScale.height
    );

    await sleep(1000 / this.maxFrame)
  }

  getCenterOffset() {
    return { width: (this.spriteScale.width / 2), height: (this.spriteScale.height / 2) }
  }
}
