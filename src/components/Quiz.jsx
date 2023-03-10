import React from 'react';
import PropTypes from 'prop-types';
import './Quiz.css';
import { connect } from 'react-redux';
import requestQuiz from '../services/quizAPI';
import { saveAssertion, saveScore } from '../redux/actions';
import { addPlayer } from '../services/localStorage';

class Quiz extends React.Component {
  constructor() {
    super();
    this.state = {
      id: 0,
      questions: [],
      buttonDisable: false,
      click: false,
      buttonNext: false,
      randomAlternatives: [],
    };
  }

  async componentDidMount() {
    const { history } = this.props;
    const gameToken = localStorage.getItem('token');
    const response = await requestQuiz(gameToken);
    if (response.response_code === 0) {
      this.setState({
        questions: response.results,
      }, () => {
        const randomAlternatives = this.handleAnswers();
        this.setState({
          randomAlternatives,
        });
      });
    } else {
      localStorage.removeItem('token');
      history.push('/');
    } this.handleTimeBtn();
  }

  handleTimeBtn = () => {
    setTimeout(() => {
      this.setState({
        buttonDisable: true,
      });
    }, '30000');
  };

  handleAnswers = () => {
    const { id, questions } = this.state;

    const getAlternatives = [questions[id].correct_answer,
      ...questions[id].incorrect_answers];
    const randomAlternatives = this.shuffleArray(getAlternatives);
    return randomAlternatives;
  };

  // fonte: https://www.horadecodar.com.br/2021/05/10/como-embaralhar-um-array-em-javascript-shuffle/
  shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  handleAlternative = ({ target }) => {
    const point = 10;
    const pointHard = 3;
    const { id, questions } = this.state;
    const { dispatch, timer } = this.props;
    const { value } = target;
    const questionDifficulty = questions[id].difficulty;
    if (value.includes('correct') && questionDifficulty.includes('easy')) {
      const total = point + timer;
      dispatch(saveScore(total));
      dispatch(saveAssertion(1));
    }
    if (value.includes('correct') && questionDifficulty.includes('medium')) {
      const total = point + (timer * 2);
      dispatch(saveScore(total));
      dispatch(saveAssertion(1));
    }
    if (value.includes('correct') && questionDifficulty.includes('hard')) {
      const total = point + (timer * pointHard);
      dispatch(saveScore(total));
      dispatch(saveAssertion(1));
    }
    this.handleClick();
    this.setState({
      buttonNext: true });
  };

  handleClick = () => {
    this.setState({
      click: true, buttonDisable: true,
    });
  };

  handleClickNext = () => {
    const lastId = 4;
    const { history, score, name } = this.props;
    const { id } = this.state;
    this.setState((previousState) => ({
      id: (previousState.id + 1),
      click: false,
      buttonDisable: false,
      buttonNext: false,
    }), () => {
      const random = this.handleAnswers();
      this.setState({
        randomAlternatives: random,
      });
    });
    if (id === lastId) {
      history.push('/feedback');
      addPlayer({ score, name });
    }
  };

  render() {
    const { questions, id, buttonDisable, click, buttonNext,
      randomAlternatives } = this.state;
    if (questions.length === 0) return <p>Loading...</p>;

    return (
      <>

        <h1>Quiz</h1>

        <h2 data-testid="question-category">
          { questions[id].category }
        </h2>
        <h3 data-testid="question-text">
          { questions[id].question }
        </h3>
        <div data-testid="answer-options">
          {
            randomAlternatives.map((alt, i) => {
              if (alt === questions[id].correct_answer) {
                return (
                  <button
                    type="button"
                    value="correct"
                    data-testid="correct-answer"
                    disabled={ buttonDisable }
                    className={ click ? 'correctAnswer' : null }
                    onClick={ this.handleAlternative }
                  >
                    { alt }
                  </button>
                );
              }
              return (
                <button
                  key={ `${i} - ${alt}` }
                  type="button"
                  value="wrong"
                  data-testid={ `wrong-answer-${i}` }
                  disabled={ buttonDisable }
                  className={ click ? 'incorrectAnswer' : null }
                  onClick={ this.handleAlternative }
                >
                  { alt }
                </button>
              );
            })
          }
        </div>

        {buttonNext
        && (
          <button
            data-testid="btn-next"
            type="button"
            onClick={ this.handleClickNext }
          >
            Proximo
          </button>
        )}
      </>

    );
  }
}

Quiz.propTypes = {
  score: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  timer: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  score: state.player.score,
  timer: state.player.timer,
  name: state.player.name,
});

export default connect(mapStateToProps)(Quiz);
