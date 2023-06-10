import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const QUIZ_THRESHOLD = 0.5;
const COLOR_GREEN = 'green';
const COLOR_RED = 'red';

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizNext, setQuizNext] = useState(false);
  const [color, setColor] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [quizStats, setQuizStats] = useState({
    correctAnswers: 0,
    totalTime: 0,
    passed: false,
  });
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:4000/questions');
        setQuestions(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuestions();
  }, []);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setQuizStats({
      correctAnswers: 0,
      totalTime: 0,
      passed: false,
    });
    const newStartTime = new Date().getTime();
    setStartTime(newStartTime);
  };

  useEffect(() => {
    console.log(startTime);
  }, [startTime]);

  useEffect(() => {
    console.log(endTime);
  }, [endTime]);

  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    const currentAnswer = selectedAnswer;
    const currentQuestionData = questions[currentQuestion];

    const isAnswerCorrect = isCorrectAnswer(currentQuestionData, currentAnswer);

    setQuizNext(true);
    setColor(isAnswerCorrect ? COLOR_GREEN : COLOR_RED);

    if (isAnswerCorrect) {
      setQuizStats((prevStats) => ({
        ...prevStats,
        correctAnswers: prevStats.correctAnswers + 1,
      }));
    } else {
      setIncorrectAnswers((prevIncorrectAnswers) => [
        ...prevIncorrectAnswers,
        {
          question: currentQuestionData.question,
          selectedAnswer: currentAnswer,
          correctAnswer: currentQuestionData.answers[currentQuestionData.correctAnswerIndex],
        },
      ]);
    }
  };

  const isCorrectAnswer = (question, answer) => {
    return question.answers[question.correctAnswerIndex] === answer;
  };

  const nextAnswer = () => {
    setQuizNext(false);
    setColor('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prevQuestion) => prevQuestion + 1);
      setSelectedAnswer('');
    } else {
      endQuiz();
    }
  };

  useEffect(() => {
    const totalTimeInSeconds = calculateTotalTime();
    setQuizStats((prevStats) => ({
      ...prevStats,
      totalTime: totalTimeInSeconds,
    }));
  }, [endTime]);

  const endQuiz = () => {
    const newEndTime = new Date().getTime();
    setEndTime(newEndTime);
    const totalQuestions = questions.length;
    const totalTime = calculateTotalTime();

    const passed = quizStats.correctAnswers >= totalQuestions * QUIZ_THRESHOLD;

    setQuizCompleted(true);
    setQuizStats((prevStats) => ({
      ...prevStats,
      totalTime,
      passed,
    }));
  };

  const calculateTotalTime = () => {
    if (startTime && endTime) {
      return Math.floor((endTime - startTime) / 1000);
    }
    return 0;
  };

  const reviewAnswers = () => {
    setReviewMode(true);
  };
  const exitReviewMode = () => {
    setReviewMode(false);
  };

  const replayQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
  };

  const exitApp = () => {
    alert("Exiting the Quiz App");
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setQuizStats({
      correctAnswers: 0,
      totalTime: 0,
      passed: false,
    });
    setStartTime(null);
    setEndTime(null);
    setColor('');
  };

  if (!quizStarted) {
    return (
      <div>
        <h1>Quiz App!</h1>
        <button onClick={startQuiz} className='startBtn'>Start Quiz!</button>
      </div>
    );
  }

  if (quizCompleted) {
    if (!reviewMode) {
      return (
        <div className='container'>
          <h1>{quizStats.passed ? 'Congratulations!!' : 'Completed!'}</h1>
          <p>{quizStats.passed ? 'You are amazing!!' : 'Better luck next time!'}</p>
          <p>{quizStats.correctAnswers}/10 correct answers in {quizStats.totalTime} seconds</p>
          {!reviewMode && (
            <button onClick={reviewAnswers} className='reviewBtn'>Review</button>
          )}
          <button onClick={replayQuiz} className='replayBtn'>Play Again</button>
          <button onClick={exitApp} className='exitBtn'>Exit App</button>
        </div>
      );
    }
    else {
      return (
        <div className='container'>
          <h1>{quizStats.passed ? 'Congratulations!!' : 'Completed!'}</h1>
          <p>{quizStats.passed ? 'You are amazing!!' : 'Better luck next time!'}</p>
          <p>{quizStats.correctAnswers}/10 correct answers in {quizStats.totalTime} seconds</p>
          {reviewMode && (
            <button onClick={exitReviewMode} className='exitReviewBtn'>Exit Review</button>
          )}
          <button onClick={replayQuiz} className='replayBtn'>Play Again</button>
          <button onClick={exitApp} className='exitBtn'>Exit App</button>
          {incorrectAnswers.length > 0 && (
            <>
              <h3 className='inCorrectAnswer'>Incorrect Answers:</h3>
              <ul>
                {incorrectAnswers.map((incorrectAnswer, index) => (
                  <li key={index} className='inCorrectAnswerItem'>
                    <p>Question: {incorrectAnswer.question}</p>
                    <p>Your Answer: {incorrectAnswer.selectedAnswer}</p>
                    <p>Correct Answer: {incorrectAnswer.correctAnswer}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )
    }
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className='container'>
      <h1>Quiz App</h1>
      <h2>Question {currentQuestion + 1}/10</h2>
      <p className='question'>{currentQuestionData.question}</p>
      <ul>
        {currentQuestionData.answers.map((answer) => (
          <li key={answer}>
            <label style={{ borderColor: selectedAnswer === answer && color !== '' ? color : '' }}>
              <span style={{ color: selectedAnswer === answer && color !== '' ? color : '' }}>
                {answer}
              </span>
              <input
                type="radio"
                value={answer}
                checked={selectedAnswer === answer}
                onChange={() => handleAnswerSelection(answer)}
              />
            </label>
          </li>
        ))}
      </ul>
      {quizNext ? (
        <button onClick={nextAnswer} disabled={!selectedAnswer} className='submitBtn'>
          Next
        </button>
      ) : (
        <button onClick={submitAnswer} disabled={!selectedAnswer} className='nextBtn'>
          Next
        </button>
      )}
    </div>
  );
};

export default QuizApp;
