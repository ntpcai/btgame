import React, { useState, useEffect } from 'react';
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

  // Define pastel colors for each character
  const title = "聖經知識遊戲";
  const pastelColors = [
    "#FFB3BA", // Pastel red
    "#BAFFC9", // Pastel green
    "#BAE1FF", // Pastel blue
    "#FFFFBA", // Pastel yellow
    "#E0BBE4", // Pastel purple
    "#FFDFBA"  // Pastel orange
  ];

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
            teachings: [row.T1, row.T2, row.T3, row.T4, row.T5] // 👈 Added
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

  const navigateToId = (id) => {
    const card = cards.find(c => c.id === id);
    if (card) {
      setCurrentId(id);
      setCurrentCard(card);
    }
  };

  const handlePrev = () => {
    const currentIndex = cards.findIndex(c => c.id === currentId);
    const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
    navigateToId(cards[prevIndex].id);
  };

  const handleNext = () => {
    const currentIndex = cards.findIndex(c => c.id === currentId);
    const nextIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
    navigateToId(cards[nextIndex].id);
  };

  const handleJump = () => {
    const id = parseInt(jumpId, 10);
    if (!isNaN(id)) {
      navigateToId(id);
      setJumpId('');
    }
  };

  // ✅ Pass both answer and teaching to modal
  const openModal = (answer, teaching) => {
    setModalContent({ answer, teaching });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  if (!currentCard) {
    return (
      <div className="app">
        <div className="flashcard loading-card">
          <div className="loading">載入中…</div>
        </div>
      </div>
    );
  }

  const labels = ['教會生活', '使命旅程', '天國君王', '律法之約', '預言啟示'];
  const colors = ['green', 'red', 'purple', 'brown', 'blue'];

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

  return (
    <div className="app">
      {/* ✨ Colorful Title */}
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
        <div className="card-id">#{currentCard.id}</div>
        
        <div className="questions-container">
          {currentCard.questions.map((q, index) => (
            <div key={index} className="question-row">
              <button
                className={`color-button ${colors[index]}`}
                onClick={() => openModal(currentCard.answers[index], currentCard.teachings[index])}
                aria-label={`${labels[index]}：${q}`}
              >
                {labels[index]}
              </button>
              <div className="question-text">{q}</div>
            </div>
          ))}
        </div>
        
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
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              {/* ✅ Answer + Teaching */}
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