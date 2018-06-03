import React, {Component} from 'react';
import {connect} from 'react-redux';
import './style.css';
import {Link, Switch, Route} from 'react-router-dom';
import SocketClient, {gameMessage} from '../../utils/SocketClient';
import {socketContainer} from '../../utils';
import {GameControl, GameDrawUtil} from "../../lib/rollup-module.esm";

const inArray = (obj, arr) => {
  let isIn = false;
  arr.forEach((item) => {
    if (item.x === obj.x && item.y === obj.y) isIn = true;
  });
  return isIn;
};

const getAllPoints = (width, height, ignore = []) => {
  const ret = [];
  for (let i = 0; i <= width; i++) {
    for (let j = 0; j <= height; j++) {
      let shouldIgnore = inArray({x: i, y: j}, ignore);
      if (shouldIgnore) continue;
      ret.push({x: i, y: j});
    }
  }
  return ret;
};

class PlayControl extends Component {
  constructor(props, context) {
    super(props, context);
    this.game = null;
    this.canvas = null;
    this.canvasWall = null;
    this.game = new GameControl(9, 9);
    this.state = {
      display: this.game.data.display,
      players: this.game.data.state.players,
      walls: this.game.data.state.walls,
      actionList: this.game.getActionList(),
      gameOver: this.game.data.state.gameOver,
      winner: this.game.data.state.winner,
      pointClick: []
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    GameDrawUtil.drawBoard(this.canvas, this.canvas.width, this.canvas.height, this.game.data.rule.map.width, this.game.data.rule.map.height);
    this.updateWalls();
  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps) {
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateWalls();
  }

  updateWalls() {
    const {walls} = this.state;
    walls.forEach(wall => {
      const {st, ed} = wall;
      console.log("st->ed", st, ed);
      GameDrawUtil.drawLine(this.canvasWall, st.x, st.y, ed.x, ed.y, this.canvas.width, this.canvas.height, this.game.data.rule.map.width, this.game.data.rule.map.height);
    });
  }

  updateActionList() {
    this.setState({actionList: this.game.getActionList()});
  }

  pointClick(x, y) {
    //临时用于放墙的
    if (this.state.pointClick.length < 1) {
      this.setState({pointClick: [...this.state.pointClick, {x, y}]});
    } else {
      console.log(this.state.pointClick, x, y);
      if (this.state.pointClick[0].x === x && this.state.pointClick[0].y === y) return;
      this.doAction({
        type: 'WALL',
        st: this.state.pointClick[0], ed: {x, y}
      });
      this.setState({pointClick: []});
    }
  }

  doAction(obj) {
    console.log("doAction!", obj);
    this.game.doAction(obj);
    const {gameOver, winner, walls} = this.game.data.state;
    if (gameOver)
      alert(winner + "赢了！");
    this.setState({
      players: this.game.data.state.players,
      actionList: this.game.getActionList(),
      walls,
      gameOver,
      winner,
      pointClick: []
    });
  }

  render() {
    const {
      player, roomId,
    } = this.props;

    const {players, actionList, gameOver, display, pointClick} = this.state;

    return (
      <div className="full-window">
        <div>{roomId ? <div>房间{roomId}</div> : ''}</div>
        <div className='board'>
          <canvas width={800} height={800} ref={(canvas) => {
            this.canvas = canvas;
          }}></canvas>
          <div className="overlay wall-overlay">
            <canvas width={800} height={800} ref={(canvas) => {
              this.canvasWall = canvas;
            }}/>
          </div>
          <div className="overlay">
            {players.map((obj, index) => {
                const {top, left, width, height} = GameDrawUtil.getPercentPos(obj.x, obj.y, this.game.data.rule.map.width, this.game.data.rule.map.height);
                return (<div key={index} style={{...display.chess[obj.id], top, left, width, height}}
                             className="chess-item player-chess">{JSON.stringify(obj)}</div>);
              }
            )}
            {!gameOver ? (
              getAllPoints(this.game.data.rule.map.width, this.game.data.rule.map.height).map((obj, index) => {
                  const {top, left, width, height} = GameDrawUtil.getPercentPos(obj.x, obj.y, this.game.data.rule.map.width, this.game.data.rule.map.height).number;
                  return (
                    <div key={index} style={{top: (top - 1) + '%', left: (left - 1) + '%', width: '2%', height: '2%'}}
                         onClick={() => this.pointClick(obj.x, obj.y)}
                         className={`chess-item click-point ${inArray(obj, pointClick) ? 'already-click' : null}`}></div>);
                }
              )) : null}
            {!gameOver ? (
              actionList.filter((obj) => obj.type === 'MOVE').map((obj, index) => {
                  const {top, left, width, height} = GameDrawUtil.getPercentPos(obj.x, obj.y, this.game.data.rule.map.width, this.game.data.rule.map.height);
                  return (<div key={index} style={{top, left, width, height}}
                               onClick={() => this.doAction(obj)}
                               className="chess-item action-chess">{JSON.stringify(obj)}</div>);
                }
              )
            ) : null}
          </div>
        </div>
        <div>{player}</div>
      </div>
    );
  }
}


const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(PlayControl);
