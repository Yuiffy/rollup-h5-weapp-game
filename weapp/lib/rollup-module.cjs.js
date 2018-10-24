'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const createInitData = () => {
  const initData = {
    local: {
      players: [0]
    },
    display: {
      chess: [{ background: 'orange' }, { background: 'pink' }]
    },
    rule: {
      playerOrder: [0, 1],
      map: {
        width: 9,
        height: 9
      },
      playerWallCount: 10,
      endLine: [{
        st: { x: 0, y: 0 },
        ed: { x: 0, y: 9 }
      }, {
        st: { x: 8, y: 0 },
        ed: { x: 8, y: 9 }
      }]
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
      walls: [
        // {
        //   round: -1,
        //   player: 0,
        //   st: {
        //     x: 4,
        //     y: 4,
        //   },
        //   ed: {
        //     x: 4,
        //     y: 6,
        //   },
        // },
        // {
        //   round: -1,
        //   player: 0,
        //   st: {
        //     x: 6,
        //     y: 4,
        //   },
        //   ed: {
        //     x: 4,
        //     y: 4,
        //   },
        // },
      ],
      isGameOver: false,
      winner: undefined
    }
  };
  return initData;
};

// {st:{x,y}, ed:{x,y}} to [{x1,y1}, {x2,y2}, ...] ，支持水平线和垂直线。
function lineToBlocks(endLine) {
  const xRange = endLine.ed.x - endLine.st.x;
  const yRange = endLine.ed.y - endLine.st.y;
  const gx = xRange === 0 ? 0 : xRange / Math.abs(xRange);
  const gy = yRange === 0 ? 0 : yRange / Math.abs(yRange);
  let ret = [];
  for (let x = endLine.st.x, y = endLine.st.y; !(x === endLine.ed.x && y === endLine.ed.y); x += gx, y += gy) {
    ret.push({ x, y });
  }
  return ret;
}

//判断直线AB是否与线段CD相交
function lineIntersectSide(A, B, C, D) {
  // A(x1, y1), B(x2, y2)的直线方程为：
  // f(x, y) =  (y - y1) * (x1 - x2) - (x - x1) * (y1 - y2) = 0
  const fC = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const fD = (D.y - A.y) * (A.x - B.x) - (D.x - A.x) * (A.y - B.y);
  return fC * fD <= 0;
}

//判断线段AB与线段CD是否相交
function sideIntersectSide(A, B, C, D) {
  if (!lineIntersectSide(A, B, C, D)) return false;
  return lineIntersectSide(C, D, A, B);
}

const getAccessableBlockList = (preX, preY, width, height, stepCount, walls = []) => {
  const ret = [];
  if (stepCount === 0) return ret;
  const go = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];

  function wallsBlock(preX, preY, x, y, walls) {
    let blockWalls = [];
    walls.forEach(wall => {
      const { st, ed } = wall;
      if (sideIntersectSide({ x: preX + 0.5, y: preY + 0.5 }, {
        x: x + 0.5,
        y: y + 0.5
      }, st, ed)) blockWalls.push(wall);
    });
    return blockWalls.length > 0 ? blockWalls : false;
  }

  class VisitMap {
    constructor() {
      this.visitMap = {};
    }

    xy2key(x, y) {
      return `${x},${y}`;
    }

    add(x, y) {
      this.visitMap[this.xy2key(x, y)] = { x, y };
    }

    check(x, y) {
      return this.visitMap.hasOwnProperty(this.xy2key(x, y));
    }

    del(x, y) {
      delete this.visitMap[this.xy2key(x, y)];
    }

    toList() {
      const ret = [];
      Object.keys(this.visitMap).forEach(k => {
        ret.push(this.visitMap[k]);
      });
      return ret;
    }
  }

  const alreadyVisit = new VisitMap();

  const dfs = (px, py, step) => {
    if (step === 0) return;
    go.forEach(({ x: gx, y: gy }) => {
      const x = px + gx;
      const y = py + gy;
      if (x >= 0 && x < height && y >= 0 && y < width) {
        if (wallsBlock(px, py, x, y, walls)) return;
        if (alreadyVisit.check(x, y)) return;

        alreadyVisit.add(x, y);
        dfs(x, y, step - 1);
      }
    });
  };
  alreadyVisit.add(preX, preY);
  dfs(preX, preY, stepCount);

  return alreadyVisit.toList().filter(({ x, y }) => !(x === preX && y === preY));
};

//在多个blockList里判断是否有重复的block
const IfDuplicateBetweenBlockLists = blockLists => {
  const blockMap = {};
  const blk2key = ({ x, y }) => `${x},${y}`;
  for (let i in blockLists) {
    const list = blockLists[i];
    for (let j in list) {
      const block = list[j];
      if (blockMap.hasOwnProperty(blk2key(block))) {
        console.log("repeat!", block, blk2key(block), blockMap);
        return true;
      }
      blockMap[blk2key(block)] = block;
    }
  }
  return false;
};

/*
* newWall: {st:{x,y}, ed:{x,y}},
* players: [{x,y}, {x,y}],
* endLine: [{st:{x,y}, ed:{x,y}}, ... ]
* 判断新墙能不能放，如果放下去会导致有人到不了终点就不能放。和以前的线有交叉也不能放。
* */
const judgeNewWallCanBePut = (newWall, width, height, players, endLines, walls) => {
  //判断一个玩家能否到达它的终点
  const ifOneCanArriveEndLine = (width, height, player, endLine, walls) => {
    const { x, y } = player;
    const arrBlocks = getAccessableBlockList(x, y, width, height, width * height, walls);
    const endBlocks = lineToBlocks(endLine);
    if (IfDuplicateBetweenBlockLists([arrBlocks, endBlocks])) return true;
    return false;
  };
  const newWalls = [...walls, newWall];
  for (let i in players) {
    const player = players[i];
    const endLine = endLines[i];
    if (!ifOneCanArriveEndLine(width, height, player, endLine, newWalls)) return false;
  }

  //将线段变短一点点防止端点相交
  const shorterTheLine = (st, ed) => {
    const xRange = ed.x - st.x;
    const yRange = ed.y - st.y;
    const gx = xRange === 0 ? 0 : xRange / Math.abs(xRange);
    const gy = yRange === 0 ? 0 : yRange / Math.abs(yRange);
    const littleX = gx * 0.1;
    const littleY = gy * 0.1;
    const newLine = {
      st: { x: st.x + littleX, y: st.y + littleY },
      ed: { x: ed.x - littleX, y: ed.y - littleY }
    };
    return newLine;
  };

  //判断线是否交叉
  const ifNewWallCrossWalls = (newWall, walls) => {
    const littleNew = shorterTheLine(newWall.st, newWall.ed);
    for (let i in walls) {
      const oldWall = walls[i];
      const littleOld = shorterTheLine(oldWall.st, oldWall.ed);
      if (sideIntersectSide(littleOld.st, littleOld.ed, littleNew.st, littleNew.ed)) {
        console.log("线相交了！", littleNew, littleOld);
        //TODO:修复同一直线上的两条线段被判定为相交的问题
        return true;
      }
    }
    return false;
  };
  if (ifNewWallCrossWalls(newWall, walls)) return false;
  return true;
};

function getNextPlayer(player, playerOrder) {
  let index = playerOrder.indexOf(player);
  index += 1;
  if (index >= playerOrder.length) index = 0;
  return playerOrder[index];
}

class GameControl {
  constructor(width = 9, height = 9) {
    this.init(width, height);
  }

  init(width, height) {
    this.data = createInitData();
    this.data.rule.map = { width, height };
    return this;
  }

  setLocalPlayers(players) {
    this.data.local.players = players;
    return this;
  }

  getActionList() {
    const { nowPlayer, walls } = this.data.state;
    const nowPlayerState = this.data.state.players[nowPlayer];
    const { x, y } = nowPlayerState;
    const { width, height } = this.data.rule.map;
    const accessBlockList = getAccessableBlockList(x, y, width, height, 1, walls);
    const moveActionList = accessBlockList.map(({ x: nextX, y: nextY }) => ({
      type: 'MOVE',
      player: nowPlayer,
      x: nextX,
      y: nextY
    }));
    const putWallActionList = []; // TODO:放墙actionList
    return moveActionList.concat(putWallActionList);
  }

  getEndPosOfPlayer(playerId) {
    // const players = this.data.state.players;
    // const player = players[playerId];
    // const {x, y} = player;
    const endLine = this.data.rule.endLine[playerId];
    let ret = lineToBlocks(endLine);
    return ret;
  }

  isGameOver() {
    const players = this.data.state.players;
    for (let i in players) {
      const player = players[i];
      const { x, y } = player;
      const endPos = this.getEndPosOfPlayer(i);
      const atEnd = endPos.filter(({ x: xx, y: yy }) => xx === x && yy === y);
      console.log("endPos, atEnd", endPos, atEnd, x, y);
      if (atEnd.length > 0) return { gameOver: true, winner: i };
    }
    return { gameOver: false, winner: undefined };
  }

  doAction(action) {
    const { player = this.data.state.nowPlayer } = action;
    let actionDone = false;
    if (action.type === 'MOVE') {
      const { x, y } = action;
      const thePlayerState = this.data.state.players[player];
      thePlayerState.x = x;
      thePlayerState.y = y;
      actionDone = true;
    }

    if (action.type === 'WALL') {
      const { st, ed } = action;
      const { walls, players } = this.data.state;
      const newWall = {
        round: this.data.state.round,
        player,
        st, ed
      };
      const { width, height } = this.data.rule.map;
      const endLines = this.data.rule.endLine;
      if (judgeNewWallCanBePut(newWall, width, height, players, endLines, walls)) {
        walls.push(newWall);
        actionDone = true;
      } else {
        console.log("判断墙不能放！");
        actionDone = false;
      }
    }

    if (actionDone) {
      this.data.state.nowPlayer = getNextPlayer(player, this.data.rule.playerOrder);
      const { gameOver, winner } = this.isGameOver();
      if (gameOver) {
        this.data.state.gameOver = true;
        this.data.state.winner = winner;
      }
    }
    return actionDone;
  }
}

const drawBoard = (canvas, width = 800, height = 800, wSize = 9, hSize = 9, lineSize = 3, lineColor = 'black') => {
  const ctx = canvas.getContext('2d');
  ctx.save();
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
  ctx.restore();
};

const getPercentPos = (x, y, wSize = 9, hSize = 9) => {
  const linePercent = 3.0 / 800 * 100; //TODO:搞定这个
  const xb = (100.0 - linePercent) / wSize,
        yb = (100.0 - linePercent) / hSize;
  const number = {
    top: linePercent / 2 + x * xb,
    left: linePercent / 2 + y * yb,
    width: xb,
    height: yb
  };
  return {
    top: number.top + '%',
    left: number.left + '%',
    width: number.width + '%',
    height: number.height + '%',
    number
  };
};

const drawLine = (canvas, x1, y1, x2, y2, width = 800, height = 800, wSize = 9, hSize = 9, lineSize = 20, lineColor = 'green') => {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.lineWidth = lineSize; //线条的宽度
  ctx.strokeStyle = lineColor; //线条的颜色

  const blockToPix = (x, y, width = 800, height = 800, wSize = 9, hSize = 9, lineSize = 20) => {
    const blockWidth = (width - lineSize) / wSize;
    const blockHeight = (height - lineSize) / hSize;
    const xPos = lineSize / 2 + y * blockWidth;
    const yPos = lineSize / 2 + x * blockHeight;
    return { x: xPos, y: yPos };
  };

  const { x: stX, y: stY } = blockToPix(x1, y1, width, height, wSize, hSize, lineSize);
  const { x: edX, y: edY } = blockToPix(x2, y2, width, height, wSize, hSize, lineSize);
  ctx.beginPath();
  ctx.moveTo(stX, stY);
  ctx.lineTo(edX, edY);
  ctx.stroke();

  ctx.restore();
};

var GameDrawUtil = /*#__PURE__*/Object.freeze({
  drawBoard: drawBoard,
  getPercentPos: getPercentPos,
  drawLine: drawLine
});

// import WxCameraHolder from './WxCameraHolder';

exports.GameControl = GameControl;
exports.GameDrawUtil = GameDrawUtil;
