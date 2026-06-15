// src/game/game1.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Game1 = () => {
  const navigate = useNavigate();
  
  // State management
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [level, setLevel] = useState('simple');
  const [coloredLetters, setColoredLetters] = useState({});
  const [resetCount, setResetCount] = useState(0);
  const [colorChanges, setColorChanges] = useState(0);
  const [colorHistory, setColorHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(null);
  
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);

  // Letter definitions with SVG paths
  const letters = [
    { id: 'letter_ba', name: 'ب', path: 'M 150 200 Q 170 160 190 200 L 180 240 Q 160 250 150 240 Z' },
    { id: 'letter_seen', name: 'س', path: 'M 250 180 Q 270 170 280 190 Q 290 210 270 220 Q 250 210 250 190 Z' },
    { id: 'letter_meem', name: 'م', path: 'M 320 180 Q 340 160 360 180 L 350 230 Q 330 240 320 230 Z' },
    { id: 'letter_alif', name: 'ا', path: 'M 400 180 L 410 240 Q 400 250 390 240 Z' },
    { id: 'letter_lam_first', name: 'ل', path: 'M 450 170 L 440 240 Q 450 250 460 240 Z' },
    { id: 'letter_lam_second', name: 'ل', path: 'M 480 170 L 470 240 Q 480 250 490 240 Z' },
    { id: 'letter_ha', name: 'ه', path: 'M 530 190 Q 550 170 560 200 Q 550 230 530 210 Z' },
    { id: 'letter_ra', name: 'ر', path: 'M 600 190 Q 620 180 630 200 L 610 230 Z' },
    { id: 'letter_ha_rahman', name: 'ح', path: 'M 150 280 Q 170 260 190 280 Q 200 300 180 310 Q 160 300 150 280 Z' },
    { id: 'letter_meem_rahim', name: 'م', path: 'M 240 270 Q 260 250 280 270 L 270 320 Q 250 330 240 320 Z' },
    { id: 'letter_noon', name: 'ن', path: 'M 330 280 Q 350 270 360 290 L 340 320 Q 320 310 330 280 Z' }
  ];

  // Color palettes
  const simpleColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#F7DC6F', '#BB8FCE', 
    '#85C1E2', '#F1948A', '#7DCEA0', '#F9E79F'
  ];

  const advancedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F1948A', '#7DCEA0', '#F9E79F',
    '#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', '#1ABC9C',
    '#E67E22', '#E84393', '#2980B9', '#27AE60', '#F39C12', '#8E44AD'
  ];

  const currentColors = level === 'simple' ? simpleColors : advancedColors;

  // Initialize colored letters state
  useEffect(() => {
    const initialColors = {};
    letters.forEach(letter => {
      initialColors[letter.id] = '#E8E8E8';
    });
    setColoredLetters(initialColors);
  }, []);

  // Auto-play audio on load
  useEffect(() => {
    playAudio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Play audio using Web Speech API
  const playAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('بسم الله الرحمن الرحیم');
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => {
        if (audioRef.current?.loop) {
          playAudio();
        } else {
          setIsPlaying(false);
        }
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      // Fallback audio element
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  // Handle letter coloring
  const handleLetterClick = (letterId) => {
    setColoredLetters(prev => ({
      ...prev,
      [letterId]: selectedColor
    }));
    setColorChanges(prev => prev + 1);
    
    // Add to color history (only for advanced level)
    if (level === 'advanced') {
      setColorHistory(prev => {
        const newHistory = [selectedColor, ...prev.filter(c => c !== selectedColor)];
        return newHistory.slice(0, 5);
      });
    }

    // Add ripple animation
    const element = document.getElementById(letterId);
    if (element) {
      element.style.transform = 'scale(1.02)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 200);
    }
  };

  // Reset all colors
  const handleReset = () => {
    const resetColors = {};
    letters.forEach(letter => {
      resetColors[letter.id] = '#E8E8E8';
    });
    setColoredLetters(resetColors);
    setResetCount(prev => prev + 1);
  };

  // Calculate statistics
  const coloredCount = Object.values(coloredLetters).filter(color => color !== '#E8E8E8').length;
  const completionPercentage = (coloredCount / letters.length) * 100;
  const uniqueColorsUsed = [...new Set(Object.values(coloredLetters).filter(c => c !== '#E8E8E8'))];

  // Save final report
  const handleComplete = () => {
    const endTimeStamp = Date.now();
    setEndTime(endTimeStamp);
    
    const report = {
      grade: 1,
      lesson: 1,
      level: level,
      sessionId: sessionId,
      startTime: startTime,
      endTime: endTimeStamp,
      durationSeconds: Math.floor((endTimeStamp - startTime) / 1000),
      totalColoredParts: coloredCount,
      totalParts: letters.length,
      completionPercentage: completionPercentage,
      colorsUsedCount: uniqueColorsUsed.length,
      uniqueColorsUsed: uniqueColorsUsed,
      coloredPartsDetails: coloredLetters,
      resetCount: resetCount,
      colorChanges: colorChanges
    };
    
    console.log('Game Report:', report);
    alert(`تبریک! شما ${coloredCount} از ${letters.length} حرف را رنگ کردید!\nدرصد تکمیل: ${Math.round(completionPercentage)}%\nزمان سپری شده: ${report.durationSeconds} ثانیه`);
  };

  const getColoredCountText = () => {
    return `${coloredCount} از ${letters.length} حرف`;
  };

  return (
    <div style={styles.container}>
      {/* دکمه بازگشت */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          backgroundColor: '#FF6B6B',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          zIndex: 100
        }}
      >
        ← بازگشت
      </button>

      <audio ref={audioRef} loop>
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
      </audio>
      
      <div style={styles.gameCard}>
        <h1 style={styles.title}>🎨 نقاشی بسم الله الرحمن الرحیم 🎨</h1>
        
        {/* SVG Drawing Area */}
        <div style={styles.svgContainer}>
          <svg width="800" height="400" viewBox="0 0 800 400" style={styles.svg}>
            {/* Decorative frame */}
            <rect x="10" y="10" width="780" height="380" fill="none" stroke="#FFD700" strokeWidth="2" strokeDasharray="5,5" rx="10"/>
            
            {/* Corner flowers */}
            <circle cx="25" cy="25" r="8" fill="#FF6B6B" opacity="0.6"/>
            <circle cx="775" cy="25" r="8" fill="#4ECDC4" opacity="0.6"/>
            <circle cx="25" cy="375" r="8" fill="#45B7D1" opacity="0.6"/>
            <circle cx="775" cy="375" r="8" fill="#96CEB4" opacity="0.6"/>
            
            {/* Decorative bottom line */}
            <line x1="50" y1="370" x2="750" y2="370" stroke="#FFD700" strokeWidth="2" strokeDasharray="3,3"/>
            
            {/* Letters */}
            {letters.map((letter) => (
              <g
                key={letter.id}
                id={letter.id}
                onClick={() => handleLetterClick(letter.id)}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 5px rgba(0,0,0,0.2))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
                }}
              >
                <path
                  d={letter.path}
                  fill={coloredLetters[letter.id]}
                  stroke="#555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Statistics */}
        <div style={styles.statsContainer}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>حروف رنگ شده:</span>
            <span style={styles.statValue}>{getColoredCountText()}</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>درصد تکمیل:</span>
            <span style={styles.statValue}>{Math.round(completionPercentage)}%</span>
          </div>
        </div>

        {/* Color Palette */}
        <div style={styles.paletteContainer}>
          <div style={styles.colorsGrid}>
            {currentColors.map((color, index) => (
              <div
                key={index}
                onClick={() => setSelectedColor(color)}
                style={{
                  ...styles.colorCircle,
                  backgroundColor: color,
                  transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: selectedColor === color ? '0 0 0 3px white, 0 0 0 6px #FFD700' : '0 2px 4px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = selectedColor === color ? 'scale(1.1)' : 'scale(1)';
                  e.currentTarget.style.boxShadow = selectedColor === color ? '0 0 0 3px white, 0 0 0 6px #FFD700' : '0 2px 4px rgba(0,0,0,0.2)';
                }}
              />
            ))}
          </div>
          
          {level === 'advanced' && (
            <div style={styles.advancedTools}>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={styles.colorPicker}
              />
              {colorHistory.length > 0 && (
                <div style={styles.historyContainer}>
                  <span style={styles.historyLabel}>تاریخچه رنگ‌ها:</span>
                  <div style={styles.historyColors}>
                    {colorHistory.map((color, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          ...styles.historyColor,
                          backgroundColor: color
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div style={styles.buttonContainer}>
          <button onClick={handleReset} style={{...styles.button, backgroundColor: '#FF6B6B'}}>
            🔄 Reset
          </button>
          
          <button onClick={() => setLevel(level === 'simple' ? 'advanced' : 'simple')} style={{...styles.button, backgroundColor: '#4ECDC4'}}>
            {level === 'simple' ? '🌟 سطح پیشرفته' : '🎯 سطح ساده'}
          </button>
          
          <button onClick={handleComplete} style={{...styles.button, backgroundColor: '#96CEB4'}}>
            ✅ اتمام بازی
          </button>
          
          <button onClick={toggleAudio} style={{...styles.button, backgroundColor: '#DDA0DD'}}>
            {isPlaying ? '🔊' : '🔇'} پخش صدا
          </button>
        </div>

        {/* Animated speaker icon when playing */}
        {isPlaying && (
          <div style={styles.playingIndicator}>
            <span style={styles.waveEmoji}>📢</span>
            <span style={styles.playingText}>در حال پخش...</span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: "'Vazir', 'IRANSans', 'Tahoma', sans-serif",
    position: 'relative'
  },
  gameCard: {
    maxWidth: '1000px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '30px',
    textAlign: 'center'
  },
  title: {
    color: '#764ba2',
    fontSize: '28px',
    marginBottom: '20px',
    fontWeight: 'bold'
  },
  svgContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: '15px',
    padding: '10px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  svg: {
    width: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto'
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px'
  },
  statBox: {
    backgroundColor: '#F0F0F0',
    padding: '10px 20px',
    borderRadius: '10px',
    display: 'flex',
    gap: '10px'
  },
  statLabel: {
    fontWeight: 'bold',
    color: '#555'
  },
  statValue: {
    color: '#764ba2',
    fontWeight: 'bold'
  },
  paletteContainer: {
    marginBottom: '20px'
  },
  colorsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '15px'
  },
  colorCircle: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  advancedTools: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#F9F9F9',
    borderRadius: '10px'
  },
  colorPicker: {
    width: '50px',
    height: '50px',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '10px'
  },
  historyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px'
  },
  historyLabel: {
    fontSize: '14px',
    color: '#666'
  },
  historyColors: {
    display: 'flex',
    gap: '8px'
  },
  historyColor: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.2s ease'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  },
  button: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  playingIndicator: {
    marginTop: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  waveEmoji: {
    fontSize: '20px',
    animation: 'wave 1s ease-in-out infinite'
  },
  playingText: {
    color: '#4ECDC4',
    fontSize: '14px'
  }
};

// Add keyframes for wave animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(20deg); }
    75% { transform: rotate(-20deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Game1;