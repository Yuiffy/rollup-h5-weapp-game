import React, { Component } from 'react';
import './App.css';
import { connect } from 'react-redux';
import { Link, Route, Switch, withRouter } from 'react-router-dom';
import MainControl from './game/views/MainControl';

// const mainControl = ({ match }) => (<MainControl
//   roomId={match.params.roomId}
//   player={match.params.playerId}
// />);

const getOneControl = (gameMode) => {
  return (props) => {
    const { match } = props;
    return (<MainControl {...props} gameMode={gameMode}
                         roomId={match.params.roomId}
                         player={match.params.playerId} />)
  }
};

const menuPage = () => (<div className="menuPage">
  <div><Link to="/local">本地双人</Link></div>
  <div><Link to="/localai">本地对战AI</Link></div>
  {/*<div><Link to="/online/123/0">在线双人-南位</Link></div>*/}
  {/*<div><Link to="/online/123/1">在线双人-北位</Link></div>*/}
  {/* <div><Link to="/">主菜单</Link></div> */}
</div>);

class App extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={menuPage} />
        <Route path="/local" render={getOneControl("LOCAL_VS")} />
        <Route path="/localai" render={getOneControl("LOCAL_AI")} />
        <Route path="/online/:roomId/:playerId" render={getOneControl("ONLINE_VS")} />
      </Switch>
    );
  }
}

export default withRouter(connect()(App));
