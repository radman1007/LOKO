// src/components/luko-health/Garden.jsx
import React, { useState, useEffect } from 'react';
import { 
  loadGarden, 
  saveGarden, 
  plantFlower, 
  waterFlower, 
  harvestFlower, 
  getGardenStatus,
  getAvailableFlowers,
  FLOWERS 
} from '../../data/gardenData';
import { HiOutlineDroplet, HiOutlineGift, HiOutlineX } from 'react-icons/hi';

const Garden = ({ userXP, onXPChange, onTaskComplete }) => {
  const [garden, setGarden] = useState(null);
  const [gardenStatus, setGardenStatus] = useState([]);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableFlowers, setAvailableFlowers] = useState([]);
  const [message, setMessage] = useState(null);

  const colors = {
    primary: '#4DB6AC',
    primaryDark: '#80CBC4',
    primaryLight: '#E0F2F1',
    text: '#455A64',
    textSecondary: '#78909C',
    cardBg: '#FFFFFF',
    soil: '#8D6E63',
    soilLight: '#A1887F'
  };

  useEffect(() => {
    const loadedGarden = loadGarden();
    setGarden(loadedGarden);
    setGardenStatus(getGardenStatus(loadedGarden, userXP));
    setAvailableFlowers(getAvailableFlowers(userXP));
  }, [userXP]);

  const handleSlotClick = (slotId, slotStatus) => {
    if (slotStatus.isEmpty) {
      setSelectedSlot(slotId);
      setShowPlantModal(true);
    } else if (slotStatus.isComplete) {
      // برداشت گل
      const result = harvestFlower(garden, slotId);
      if (result.success) {
        setGarden(result.garden);
        setGardenStatus(getGardenStatus(result.garden, userXP));
        onXPChange(result.rewardXP);
        setMessage(`🎉 ${result.flowerName} را برداشت کردی! +${result.rewardXP} XP`);
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handlePlant = (flowerId) => {
    const result = plantFlower(garden, selectedSlot, flowerId, userXP);
    if (result.success) {
      setGarden(result.garden);
      setGardenStatus(getGardenStatus(result.garden, userXP - result.usedXP));
      onXPChange(-result.usedXP);
      setShowPlantModal(false);
      setSelectedSlot(null);
      setMessage(`🌱 گل ${FLOWERS[flowerId].name} کاشته شد!`);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage(result.error);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleWater = (slotId) => {
    // آبیاری = پیشرفت در تسک‌ها
    // این تابع توسط تسک‌ها صدا زده می‌شود
  };

  // آبیاری از طریق انجام تسک
  const waterFromTask = (slotId, xpGained) => {
    const result = waterFlower(garden, slotId, xpGained);
    if (result.success) {
      setGarden(result.garden);
      setGardenStatus(getGardenStatus(result.garden, userXP));
      if (result.stageChanged) {
        if (result.isComplete) {
          setMessage(`🌻 ${result.flowerName} کامل شد! می‌تونی برداشتش کنی`);
        } else {
          setMessage(`🌿 ${result.flowerName} به مرحله ${result.stageIcon} رسید!`);
        }
      }
      setTimeout(() => setMessage(null), 3000);
      return true;
    }
    return false;
  };

  return (
    <div style={{
      backgroundColor: colors.cardBg,
      borderRadius: '24px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text }}>
          🌱 باغچه من
        </h3>
        <div style={{
          backgroundColor: colors.primaryLight,
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          color: colors.primaryDark
        }}>
          {garden?.totalFlowers || 0} گل کاشته شده
        </div>
      </div>

      {/* پیام موقت */}
      {message && (
        <div style={{
          backgroundColor: colors.primaryLight,
          color: colors.primaryDark,
          padding: '10px 16px',
          borderRadius: '16px',
          marginBottom: '16px',
          textAlign: 'center',
          fontSize: '13px',
          animation: 'fadeInOut 3s ease'
        }}>
          {message}
        </div>
      )}

      {/* جایگاه‌های باغچه */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {gardenStatus.map((slot, index) => (
          <div
            key={index}
            onClick={() => handleSlotClick(index + 1, slot)}
            style={{
              backgroundColor: slot.isEmpty ? colors.soilLight : colors.soil,
              borderRadius: '20px',
              padding: '20px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              position: 'relative',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {slot.isEmpty ? (
              <>
                <div style={{
                  fontSize: '40px',
                  opacity: 0.5,
                  marginBottom: '8px'
                }}>
                  🌱
                </div>
                <span style={{
                  fontSize: '12px',
                  color: 'white',
                  opacity: 0.7
                }}>
                  کاشت گل
                </span>
              </>
            ) : (
              <>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '8px',
                  transition: 'all 0.3s ease'
                }}>
                  {slot.stageIcon}
                </div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '4px'
                }}>
                  {slot.flower.name}
                </p>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  borderRadius: '2px',
                  marginTop: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${slot.progress}%`,
                    height: '100%',
                    backgroundColor: colors.primary,
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.8)',
                  marginTop: '4px'
                }}>
                  {Math.round(slot.progress)}%
                </span>
                {slot.isComplete && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: colors.primary,
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HiOutlineGift size={14} color="white" />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <p style={{
        fontSize: '11px',
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: '8px'
      }}>
        💡 با انجام تسک‌ها به گلهات آب بده! هر تسک = یک آبیاری
      </p>

      {/* مودال کاشت گل */}
      {showPlantModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowPlantModal(false)}>
          <div style={{
            backgroundColor: colors.cardBg,
            borderRadius: '28px',
            padding: '24px',
            width: '90%',
            maxWidth: '320px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text }}>
                کاشت گل جدید
              </h3>
              <button
                onClick={() => setShowPlantModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: colors.textSecondary
                }}
              >
                <HiOutlineX size={24} />
              </button>
            </div>

            <p style={{
              fontSize: '12px',
              color: colors.textSecondary,
              marginBottom: '16px'
            }}>
              امتیاز موجود: {userXP} XP
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {availableFlowers.map(flower => (
                <button
                  key={flower.id}
                  onClick={() => handlePlant(flower.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: colors.primaryLight,
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryDark}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primaryLight}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{flower.icon}</span>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '600', color: colors.text }}>{flower.name}</p>
                      <p style={{ fontSize: '10px', color: colors.textSecondary }}>مراحل: {flower.stages.join(' → ')}</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: colors.primaryDark
                  }}>
                    {flower.xpNeeded} XP
                  </span>
                </button>
              ))}
            </div>

            {availableFlowers.length === 0 && (
              <p style={{
                textAlign: 'center',
                color: colors.textSecondary,
                padding: '20px'
              }}>
                برای کاشت گل جدید به امتیاز بیشتری نیاز داری!
                <br />
                با انجام ماموریت‌ها امتیاز جمع کن 🌟
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Garden;