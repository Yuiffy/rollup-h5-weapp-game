'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const createInitData = () => {
  const initData = {
    local: {
      players: [0]
    },
    rule: {
      playerOrder: [0, 1],
      map: {
        width: 9,
        height: 9
      },
      playerWallCount: 10
    },
    state: {
      nowPlayer: 0,
      round: 0,
      players: [{
        id: 0,
        x: 8,
        y: 4,
        wallCount: 9
      }, {
        id: 1,
        x: 0,
        y: 4,
        wallCount: 10
      }],
      walls: [{
        round: -1,
        player: 0,
        st: {
          x: 4,
          y: 4
        },
        ed: {
          x: 4,
          y: 6
        }
      }]
    }
  };
  return initData;
};

const getAccessableBlockList = (preX, preY, width, height, stepCount) => {
  const ret = [];
  if (stepCount === 0) return ret;
  const go = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
  go.forEach(({ x: gx, y: gy }) => {
    const x = preX + gx;
    const y = preY + gy;
    if (x >= 0 && x < height && y >= 0 && y < width) {
      if (stepCount === 1) ret.push({ x, y });else {
        const newBlock = getAccessableBlockList(x, y, width, height, stepCount);
        // TODO: 去重然后concat进ret列表。
      }
    }
  });
  return ret;
};

function getNextPlayer(player, playerOrder) {
  let index = playerOrder.indexOf(player);
  index += 1;
  if (index >= playerOrder.length) index = 0;
  return playerOrder[index];
}

class GameControl {
  constructor() {
    this.init();
  }

  init() {
    this.data = createInitData();
    return this;
  }

  setLocalPlayers(players) {
    this.data.local.players = players;
    return this;
  }

  getActionList() {
    const { nowPlayer } = this.data.state;
    const nowPlayerState = this.data.state.players[nowPlayer];
    const { x, y } = nowPlayerState;
    const { width, height } = this.data.rule.map;
    const accessBlockList = getAccessableBlockList(x, y, width, height, 1);
    const moveActionList = accessBlockList.map(({ x: nextX, y: nextY }) => ({
      type: 'MOVE',
      player: nowPlayer,
      x: nextX,
      y: nextY
    }));
    const putWallActionList = []; // TODO:放墙actionList
    return moveActionList.concat(putWallActionList);
  }

  doAction(action) {
    if (action.type === 'MOVE') {
      const { player, x, y } = action;
      const thePlayerState = this.data.state.players[player];
      thePlayerState.x = x;
      thePlayerState.y = y;
      this.data.state.nowPlayer = getNextPlayer(player, this.data.rule.playerOrder);
    }
  }
}

const drawBoard = (canvas, width = 800, height = 800, wSize = 9, hSize = 9, lineSize = 3, lineColor = 'black') => {
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = lineSize; //线条的宽度
  ctx.strokeStyle = lineColor; //线条的颜色
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
  const linePercent = 3.0 / 800 * 100; //TODO:搞定这个
  const xb = (100.0 - linePercent) / wSize,
        yb = (100.0 - linePercent) / hSize;
  return {
    top: linePercent / 2 + x * xb + '%',
    left: linePercent / 2 + y * yb + '%',
    width: xb + '%',
    height: yb + '%'
  };
};

var GameDrawUtil = /*#__PURE__*/Object.freeze({
  drawBoard: drawBoard,
  getPercentPos: getPercentPos
});

// import WxCameraHolder from './WxCameraHolder';

exports.GameControl = GameControl;
exports.GameDrawUtil = GameDrawUtil;
