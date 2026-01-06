import React, { useState, useEffect, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import './App.css';

const CSV_URL = '/questions.csv';

function App() {
  const [cards, setCards] = useState([]);
  const [currentId, setCurrentId] = useState(1);
  const [currentCard, setCurrentCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ answer: '', teaching: '' });
  const [jumpId, setJumpId] = useState('');
  
  const [timer, setTimer] = useState(60);
  const [bgState, setBgState] = useState('');
  const [activeButtonIndex, setActiveButtonIndex] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const intervalRef = useRef(null);
  const flashRef = useRef(null);

  // Mask question text with dashes
  const maskQuestion = (question) => {
    return '—'.repeat(35);
//    return '—'.repeat(question.length);
  };

  // CSV loading
  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedCards = results.data
          .filter(row => row.ID && row.Q1)
          .map(row => ({
            id: parseInt(row.ID, 10),
            questions: [row.Q1, row.Q2, row.Q3, row.Q4, row.Q5],
            answers: [row.A1, row.A2, row.A3, row.A4, row.A5],
            teachings: [row.T1, row.T2, row.T3, row.T4, row.T5]
          }))
          .sort((a, b) => a.id - b.id);

        if (parsedCards.length > 0) {
          setCards(parsedCards);
          setCurrentCard(parsedCards[0]);
          setCurrentId(parsedCards[0].id);
        }
      },
      error: (error) => console.error('CSV 載入錯誤:', error)
    });
  }, []);

  // Timer logic
  useEffect(() => {
    if (!isTimerRunning || timer <= 0) return;

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (activeButtonIndex !== null && currentCard) {
            setModalContent({
              answer: currentCard.answers[activeButtonIndex],
              teaching: currentCard.teachings[activeButtonIndex]
            });
            setShowModal(true);
          }
          setBgState('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning, timer, activeButtonIndex, currentCard]);

  // Flashing effect
  useEffect(() => {
    if (flashRef.current) clearInterval(flashRef.current);
    setBgState('');

    if (timer <= 5 && timer > 0) {
      setBgState('flash');
      flashRef.current = setInterval(() => {
        setBgState(prev => (prev === 'flash' ? 'flash-off' : 'flash'));
      }, 500);
    } else if (timer === 0) {
      setBgState('complete');
    }

    return () => {
      if (flashRef.current) clearInterval(flashRef.current);
    };
  }, [timer]);

  // Reset state for new card
  const resetCardState = useCallback(() => {
    setTimer(60);
    setBgState('');
    setActiveButtonIndex(null);
    setIsTimerRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (flashRef.current) clearInterval(flashRef.current);
  }, []);

  // Navigation
  const navigateToId = useCallback((id) => {
    const card = cards.find(c => c.id === id);
    if (card) {
      setCurrentId(id);
      setCurrentCard(card);
      resetCardState();
    }
  }, [cards, resetCardState]);

  const handlePrev = useCallback(() => {
    const currentIndex = cards.findIndex(c => c.id === currentId);
    const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
    navigateToId(cards[prevIndex].id);
  }, [cards, currentId, navigateToId]);

  const handleNext = useCallback(() => {
    const currentIndex = cards.findIndex(c => c.id === currentId);
    const nextIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
    navigateToId(cards[nextIndex].id);
  }, [cards, currentId, navigateToId]);

  const handleJump = useCallback(() => {
    const id = parseInt(jumpId, 10);
    if (!isNaN(id)) {
      navigateToId(id);
      setJumpId('');
    }
  }, [jumpId, navigateToId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  }, [handleJump]);

  // Handle button press
  const handleButtonPress = useCallback((index) => {
    if (activeButtonIndex === index) {
      // If same button pressed again, open modal
      if (currentCard) {
        setModalContent({
          answer: currentCard.answers[index],
          teaching: currentCard.teachings[index]
        });
        setShowModal(true);
      }
    } else {
      // First press: activate this button and start timer
      setActiveButtonIndex(index);
      setIsTimerRunning(true);
      setTimer(60);
      setBgState('');
      if (flashRef.current) clearInterval(flashRef.current);
    }
  }, [activeButtonIndex, currentCard]);

  // Handle answer button press
  const handleAnswerPress = useCallback(() => {
    if (activeButtonIndex !== null && currentCard) {
      setModalContent({
        answer: currentCard.answers[activeButtonIndex],
        teaching: currentCard.teachings[activeButtonIndex]
      });
      setShowModal(true);
    }
  }, [activeButtonIndex, currentCard]);

  // Close modal and go to next card
  const closeModal = useCallback(() => {
    setShowModal(false);
    handleNext();
  }, [handleNext]);

  // Cleanup intervals
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (flashRef.current) clearInterval(flashRef.current);
    };
  }, []);

  // Title
  const title = "聖經知識遊戲";
  const pastelColors = ["#FFB3BA", "#BAFFC9", "#BAE1FF", "#FFFFBA", "#E0BBE4", "#FFDFBA"];

  // Icons
  const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
      <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
      <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.106-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
    </svg>
  );

  const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="close-icon">
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
  );

  if (!currentCard) {
    return (
      <div className="app">
        <div className="flashcard loading-card">
          <div className="loading">載入中…</div>
        </div>
      </div>
    );
  }

  const labels = ['人物', '地點', '經文', '物件', '數字'];
  const colors = ['green', 'red', 'purple', 'brown', 'blue'];

  return (
    <div className="app" data-bg-state={bgState}>
      <div className="game-title">
        {title.split('').map((char, index) => (
          <span
            key={index}
            className="title-char"
            style={{ color: pastelColors[index % pastelColors.length] }}
          >
            {char}
          </span>
        ))}
      </div>

      <div className="flashcard">
        <div className="timer-display">{timer}</div>
        <div className="card-id">#{currentCard.id}</div>
        
        <div className="card-content">
          <div className="questions-container">
            {currentCard.questions.map((q, index) => {
              const isVisible = activeButtonIndex === index;
              const isDimmed = activeButtonIndex !== null && activeButtonIndex !== index;
              
              return (
                <div 
                  key={index} 
                  className={`question-row ${isDimmed ? 'dimmed' : ''}`}
                >
                  <button
                    className={`color-button ${colors[index]} ${isDimmed ? 'dimmed' : ''}`}
                    onClick={() => handleButtonPress(index)}
                    disabled={isDimmed}
                    aria-label={`${labels[index]}：${q}`}
                  >
                    {labels[index]}
                  </button>
                  <div className="question-text">
                    {isVisible ? q : maskQuestion(q)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conditional rendering: Navigation vs Answer button */}
        {activeButtonIndex === null ? (
          <div className="navigation">
            <button 
              className="nav-button wide prev" 
              onClick={handlePrev}
              aria-label="上一題"
            >
              <ChevronLeftIcon />
            </button>
            
            <div className="jump-container">
              <input
                type="number"
                inputMode="numeric"
                value={jumpId}
                onChange={(e) => setJumpId(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ID"
                className="jump-input"
                aria-label="跳轉題目編號"
              />
              <button className="nav-button jump" onClick={handleJump} aria-label="跳轉">
                跳轉
              </button>
            </div>
            
            <button 
              className="nav-button wide next" 
              onClick={handleNext}
              aria-label="下一題"
            >
              <ChevronRightIcon />
            </button>
          </div>
        ) : (
          <div className="answer-button-container">
            <button 
              className="answer-button" 
              onClick={handleAnswerPress}
            >
              回答
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="answer-text">{modalContent.answer}</div>
              {modalContent.teaching && (
                <div className="teaching-text">{modalContent.teaching}</div>
              )}
            </div>
            <button className="modal-close" onClick={closeModal} aria-label="關閉">
              <CloseIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;