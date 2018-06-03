const createInitData = () => {
  const initData = {
    local: {
      players: [0],
    },
    display: {
      chess: [
        {background: 'orange'},
        {background: 'pink'}
      ]
    },
    rule: {
      playerOrder: [0, 1],
      map: {
        width: 9,
        height: 9,
      },
      playerWallCount: 10,
      endLine: [
        {
          st: {x: 0, y: 0},
          ed: {x: 0, y: 8}
        },
        {
          st: {x: 8, y: 0},
          ed: {x: 8, y: 8}
        }
      ],
    },
    state: {
      nowPlayer: 0,
      round: 0,
      players: [
        {
          id: 0,
          x: 8,
          y: 4,
          wallCount: 9,
        }, {
          id: 1,
          x: 0,
          y: 4,
          wallCount: 10,
        },
      ],
      walls: [
        {
          round: -1,
          player: 0,
          st: {
            x: 4,
            y: 4,
          },
          ed: {
            x: 4,
            y: 6,
          },
        },
        {
          round: -1,
          player: 0,
          st: {
            x: 6,
            y: 4,
          },
          ed: {
            x: 4,
            y: 4,
          },
        },
      ],
      isGameOver: false,
      winner: undefined
    },
  };
  return initData;
};

const getAccessableBlockList = (preX, preY, width, height, stepCount, walls = []) => {
  const ret = [];
  if (stepCount === 0) return ret;
  const go = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];

  function wallsBlock(preX, preY, x, y, walls) {
    //判断直线AB是否与线段CD相交
    function lineIntersectSide(A, B, C, D) {
      // A(x1, y1), B(x2, y2)的直线方程为：
      // f(x, y) =  (y - y1) * (x1 - x2) - (x - x1) * (y1 - y2) = 0
      const fC = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
      const fD = (D.y - A.y) * (A.x - B.x) - (D.x - A.x) * (A.y - B.y);
      return fC * fD <= 0;
    }

    function sideIntersectSide(A, B, C, D) {
      if (!lineIntersectSide(A, B, C, D))
        return false;
      return lineIntersectSide(C, D, A, B);
    }

    let blockWalls = [];
    walls.forEach((wall) => {
      const {st, ed} = wall;
      if (sideIntersectSide({x: preX + 0.5, y: preY + 0.5}, {x: x + 0.5, y: y + 0.5}, st, ed)) blockWalls.push(wall);
    });
    return blockWalls.length > 0 ? blockWalls : false;
  }

  go.forEach(({x: gx, y: gy}) => {
    const x = preX + gx;
    const y = preY + gy;
    if (x >= 0 && x < height && y >= 0 && y < width) {
      if (wallsBlock(preX, preY, x, y, walls)) return;
      if (stepCount === 1) ret.push({x, y});
      else {
        const newBlock = getAccessableBlockList(x, y, width, height, stepCount - 1, walls);
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
    const {nowPlayer, walls} = this.data.state;
    const nowPlayerState = this.data.state.players[nowPlayer];
    const {x, y} = nowPlayerState;
    const {width, height} = this.data.rule.map;
    const accessBlockList = getAccessableBlockList(x, y, width, height, 1, walls);
    const moveActionList = accessBlockList.map(({x: nextX, y: nextY}) => ({
      type: 'MOVE',
      player: nowPlayer,
      x: nextX,
      y: nextY,
    }));
    const putWallActionList = [];// TODO:放墙actionList
    return moveActionList.concat(putWallActionList);
  }

  getEndPosOfPlayer(playerId) {
    const players = this.data.state.players;
    // const player = players[playerId];
    // const {x, y} = player;
    const endLine = this.data.rule.endLine[playerId];
    const xRange = (endLine.ed.x - endLine.st.x);
    const yRange = endLine.ed.y - endLine.st.y;
    const gx = xRange === 0 ? 0 : (xRange / Math.abs(xRange));
    const gy = yRange === 0 ? 0 : (yRange / Math.abs(yRange));
    let ret = [];
    for (let x = endLine.st.x, y = endLine.st.y; !(x === endLine.ed.x && y === endLine.ed.y); x += gx, y += gy) {
      ret.push({x, y});
    }
    return ret;
  }

  isGameOver() {
    const players = this.data.state.players;
    for (let i in players) {
      const player = players[i];
      const {x, y} = player;
      const endPos = this.getEndPosOfPlayer(i);
      const atEnd = endPos.filter(({x: xx, y: yy}) => xx === x && yy === y);
      console.log("endPos, atEnd", endPos, atEnd, x, y)
      if (atEnd.length > 0) return {gameOver: true, winner: i};
    }
    return {gameOver: false, winner: undefined};
  }

  doAction(action) {
    if (action.type === 'MOVE') {
      const {player, x, y} = action;
      const thePlayerState = this.data.state.players[player];
      thePlayerState.x = x;
      thePlayerState.y = y;
      this.data.state.nowPlayer = getNextPlayer(player, this.data.rule.playerOrder);
      const {gameOver, winner} = this.isGameOver();
      if (gameOver) {
        this.data.state.gameOver = true;
        this.data.state.winner = winner;
      }
    }
  }
}

export default GameControl;
