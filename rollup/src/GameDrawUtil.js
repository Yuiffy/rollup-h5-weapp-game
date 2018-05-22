const drawBoard = (canvas, width = 800, height = 800, wSize = 9, hSize = 9, lineSize = 3, lineColor = 'black') => {
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = lineSize;//线条的宽度
  ctx.strokeStyle = lineColor;//线条的颜色
  const blockWidth = (width - lineSize) / wSize;
  const blockHeight = (height - lineSize) / hSize;
  for (let i = 0; i < wSize + 1; i++) {
    const pos = lineSize / 2 + i * blockWidth;
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, height);
    ctx.stroke();
  }
  for (let i = 0; i < hSize + 1; i++) {
    const pos = lineSize / 2 + i * blockHeight;
    ctx.moveTo(0, pos);
    ctx.lineTo(width, pos);
    ctx.stroke();
  }
};

const getPercentPos = (x, y, wSize = 9, hSize = 9) => {
  const linePercent = 3.0 / 800 * 100;//TODO:搞定这个
  const xb = (100.0 - linePercent) / wSize, yb = (100.0 - linePercent) / hSize;
  return {
    top: (linePercent / 2 + x * xb) + '%',
    left: (linePercent / 2 + y * yb) + '%',
    width: xb + '%',
    height: yb + '%'
  };
};


//下面的类暂未使用
class GameBoard {
  constructor(canvas, width = 800, height = 800, wSize = 9, hSize = 9, lineSize = 3, lineColor = 'black') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.wSize = wSize;
    this.hSize = hSize;
    this.lineSize = lineSize;
    this.lineColor = lineColor;
    this.init();
  }

  init() {
    const {ctx, width, height, wSize, hSize, lineSize, lineColor} = this;
    ctx.lineWidth = lineSize;//线条的宽度
    ctx.strokeStyle = lineColor;//线条的颜色
    this.blockWidth = (width - lineSize) / wSize;
    this.blockHeight = (height - lineSize) / hSize;
    for (let i = 0; i < wSize + 1; i++) {
      const pos = lineSize / 2 + i * this.blockWidth;
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, height);
      ctx.stroke();
    }
    for (let i = 0; i < hSize + 1; i++) {
      const pos = lineSize / 2 + i * this.blockHeight;
      ctx.moveTo(0, pos);
      ctx.lineTo(width, pos);
      ctx.stroke();
    }
  }

  getPos(blockX, blockY) {
    const {ctx, width, height, wSize, hSize, lineSize, lineColor, blockWidth, blockHeight} = this;
    return {
      x: lineSize / 2 + blockX * blockWidth,
      y: lineSize / 2 + blockY * blockHeight,
      width: blockWidth,
      height: blockHeight
    };
  }
}

export {drawBoard, getPercentPos};
