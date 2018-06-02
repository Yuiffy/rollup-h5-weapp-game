import React, {Component} from 'react';
import {connect} from 'react-redux';
import './style.css';
import {Link, Switch, Route} from 'react-router-dom';
import SocketClient, {gameMessage} from '../../utils/SocketClient';
import {socketContainer} from '../../utils';
import {GameControl, GameDrawUtil} from "../../lib/rollup-module.esm";

class PlayControl extends Component {
  constructor(props, context) {
    super(props, context);
    this.game = null;
    this.canvas = null;
    this.game = new GameControl();
    this.state = {
      players: this.game.data.state.players,
      actionList: []
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    GameDrawUtil.drawBoard(this.canvas, this.canvas.width, this.canvas.height);
    this.updateActionList();
  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps) {
  }

  updateActionList() {
    this.setState({actionList: this.game.getActionList()});
  }

  doAction(obj) {
    console.log("doAction!", obj);
    this.game.doAction(obj);
    this.setState({
      players: this.game.data.state.players,
      actionList: this.game.getActionList()
    });
  }

  render() {
    const {
      player, roomId,
    } = this.props;

    const {players, actionList} = this.state;

    return (
      <div className="full-window">
        <div>{roomId ? <div>房间{roomId}</div> : ''}</div>
        <div className='board'>
          <canvas width={800} height={800} ref={(canvas) => {
            this.canvas = canvas;
          }}></canvas>
          <div className="overlay">
            {players.map((obj, index) => {
                const {top, left, width, height} = GameDrawUtil.getPercentPos(obj.x, obj.y);
                return (<div key={index} style={{top, left, width, height}}
                             className="chess-item player-chess">{JSON.stringify(obj)}</div>);
              }
            )}
            {actionList.filter((obj) => obj.type === 'MOVE').map((obj, index) => {
                const {top, left, width, height} = GameDrawUtil.getPercentPos(obj.x, obj.y);
                return (<div key={index} style={{top, left, width, height}}
                             onClick={() => this.doAction(obj)}
                             className="chess-item action-chess">{JSON.stringify(obj)}</div>);
              }
            )}
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
