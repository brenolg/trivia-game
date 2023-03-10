import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Quiz from '../components/Quiz';
import Header from '../components/Header';
import Timer from '../components/Timer';

class Game extends React.Component {
  render() {
    const { history, dispatch } = this.props;
    return (
      <>
        <Header />
        <Timer
          dispatch={ dispatch }
        />
        <Quiz
          history={ history }
        />
      </>
    );
  }
}

Game.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default connect()(Game);
