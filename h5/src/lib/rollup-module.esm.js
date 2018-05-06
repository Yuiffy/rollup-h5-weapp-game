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

// import WxCameraHolder from './WxCameraHolder';

export default GameControl;
