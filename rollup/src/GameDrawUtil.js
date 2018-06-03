const drawBoard = (canvas, width = 800, height = 800, wSize = 9, hSize = 9, lineSize = 3, lineColor = 'black') => {
  const ctx = canvas.getContext('2d');
  ctx.save();
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
  ctx.restore();
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

const drawLine = (canvas, x1, y1, x2, y2, width = 800, height = 800, wSize = 9, hSize = 9, lineSize = 20, lineColor = 'green') => {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.lineWidth = lineSize; //线条的宽度
  ctx.strokeStyle = lineColor; //线条的颜色
  const blockWidth = (width - lineSize) / wSize;
  const blockHeight = (height - lineSize) / hSize;

  const blockToPix = (x, y, width = 800, height = 800, wSize = 9, hSize = 9, lineSize = 20) => {
    const blockWidth = (width - lineSize) / wSize;
    const blockHeight = (height - lineSize) / hSize;
    const xPos = lineSize / 2 + y * blockWidth;
    const yPos = lineSize / 2 + x * blockHeight;
    return {x: xPos, y: yPos};
  };

  const {x: stX, y: stY} =  blockToPix(x1, y1, width, height, wSize, hSize, lineSize);
  const {x: edX, y: edY} =  blockToPix(x2, y2, width, height, wSize, hSize, lineSize);
  ctx.beginPath();
  ctx.moveTo(stX, stY);
  ctx.lineTo(edX, edY);
  ctx.stroke();

  ctx.restore();
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

export {drawBoard, getPercentPos, drawLine};
