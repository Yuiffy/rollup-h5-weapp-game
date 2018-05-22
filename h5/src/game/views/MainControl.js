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
      players: this.game.data.state.players
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    GameDrawUtil.drawBoard(this.canvas, this.canvas.width, this.canvas.height);
  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    const {
      player, roomId,
    } = this.props;

    const {players} = this.state;

    return (
      <div className="full-window">
        <div>{roomId ? <div>房间{roomId}</div> : ''}</div>
        <div className='board'>
          <canvas width={800} height={800} ref={(canvas) => {
            this.canvas = canvas;
          }}></canvas>
          <div class="overlay">
            {players.map((obj) => {
                const {top, left, width, height} = GameDrawUtil.getPercentPos(obj.x, obj.y);
                return (<div style={{top, left, width, height}} className="player-chess">{JSON.stringify(obj)}</div>);
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
