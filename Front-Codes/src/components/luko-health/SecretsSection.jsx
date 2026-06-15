// src/components/luko-health/SecretsSection.jsx
import React, { useState, useEffect } from 'react';
import { HiOutlineLockClosed, HiOutlineTrash, HiOutlinePlus, HiOutlineX, HiOutlineEye } from 'react-icons/hi';
import Icon49 from '../../icons/icon49.png';

const SecretsSection = ({ colors, isMobile }) => {
  const [secrets, setSecrets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSecretsModal, setShowSecretsModal] = useState(false);
  const [newSecret, setNewSecret] = useState('');
  const [selectedSecret, setSelectedSecret] = useState(null);
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'locked', 'unlocked'

  // بارگذاری رازها از localStorage
  useEffect(() => {
    const savedSecrets = localStorage.getItem('luko_secrets');
    if (savedSecrets) {
      try {
        setSecrets(JSON.parse(savedSecrets));
      } catch (e) {
        setSecrets([]);
      }
    } else {
      // رازهای نمونه برای شروع
      const sampleSecrets = [
        { id: 1, text: 'امروز تونستم به بهترین دوستم کمک کنم و خیلی خوشحالم', date: '۱۴۰۵/۰۲/۲۰', isLocked: false },
        { id: 2, text: 'از امتحان ریاضی میترسم ولی تمرین کردم', date: '۱۴۰۵/۰۲/۲۲', isLocked: true },
        { id: 3, text: 'امروز اولین باری بود که تونستم نقاشی قشنگی بکشم', date: '۱۴۰۵/۰۲/۲۳', isLocked: false }
      ];
      setSecrets(sampleSecrets);
      localStorage.setItem('luko_secrets', JSON.stringify(sampleSecrets));
    }
  }, []);

  // ذخیره رازها
  const saveSecrets = (newSecrets) => {
    setSecrets(newSecrets);
    localStorage.setItem('luko_secrets', JSON.stringify(newSecrets));
  };

  // اضافه کردن راز جدید
  const addSecret = () => {
    if (!newSecret.trim()) {
      alert('لطفاً یه چیزی بنویس...');
      return;
    }

    const newSecretObj = {
      id: Date.now(),
      text: newSecret,
      date: new Date().toLocaleDateString('fa-IR'),
      isLocked: true
    };

    saveSecrets([newSecretObj, ...secrets]);
    setNewSecret('');
    setShowAddModal(false);
    alert('✨ راز تو با موفقیت ذخیره شد!');
  };

  // حذف راز
  const deleteSecret = (id) => {
    if (window.confirm('آیا مطمئنی میخوای این راز رو پاک کنی؟')) {
      const newSecrets = secrets.filter(s => s.id !== id);
      saveSecrets(newSecrets);
    }
  };

  // باز کردن راز قفل شده
  const unlockSecret = (secret) => {
    if (password === '1234') {
      const updatedSecrets = secrets.map(s => 
        s.id === secret.id ? { ...s, isLocked: false } : s
      );
      saveSecrets(updatedSecrets);
      setShowPasswordModal(false);
      setPassword('');
      setSelectedSecret(null);
      alert('🔓 راز با موفقیت باز شد!');
    } else if (password) {
      alert('رمز اشتباه است!');
    }
  };

  const openUnlockModal = (secret) => {
    setSelectedSecret(secret);
    setShowPasswordModal(true);
    setPassword('');
  };

  const openSecretsModal = () => {
    setShowSecretsModal(true);
  };

  const closeSecretsModal = () => {
    setShowSecretsModal(false);
    setViewMode('all');
  };

  const lockedSecrets = secrets.filter(s => s.isLocked);
  const unlockedSecrets = secrets.filter(s => !s.isLocked);

  // کارت بنر رازها (قابل کلیک)
  const SecretsBanner = () => (
    <div 
      onClick={openSecretsModal}
      style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
      }}
    >
      <img 
        src={Icon49} 
        alt="secrets" 
        style={{ 
          width: '100%', 
          height: 'auto', 
          objectFit: 'contain',
          display: 'block'
        }} 
      />
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: '30px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <HiOutlineEye size={18} color="white" />
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>
          {secrets.length} راز
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* بنر رازها - قابل کلیک */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: isMobile ? '16px' : '18px',
          fontWeight: '700',
          color: colors.text,
          marginBottom: '16px'
        }}>
          🔒 رازهای من
        </h3>
        <SecretsBanner />
      </div>

      {/* مودال بزرگ رازها */}
      {showSecretsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease'
        }} onClick={closeSecretsModal}>
          <div style={{
            backgroundColor: colors.cardBg,
            borderRadius: '32px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* هدر مودال */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${colors.primary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🔒</span>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text }}>رازهای من</h2>
              </div>
              <button
                onClick={closeSecretsModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EEEEEE'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <HiOutlineX size={24} color={colors.text} />
              </button>
            </div>

            {/* تب‌ها */}
            <div style={{
              display: 'flex',
              borderBottom: `1px solid ${colors.primary}`,
              padding: '0 16px'
            }}>
              {[
                { id: 'all', label: 'همه', count: secrets.length },
                { id: 'unlocked', label: 'باز شده', count: unlockedSecrets.length },
                { id: 'locked', label: 'قفل شده', count: lockedSecrets.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: viewMode === tab.id ? `3px solid ${colors.blue}` : '3px solid transparent',
                    color: viewMode === tab.id ? colors.blue : colors.textSecondary,
                    fontSize: '14px',
                    fontWeight: viewMode === tab.id ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {tab.label}
                  <span style={{
                    backgroundColor: viewMode === tab.id ? colors.blue : '#E0E0E0',
                    color: viewMode === tab.id ? 'white' : colors.textSecondary,
                    borderRadius: '20px',
                    padding: '2px 8px',
                    fontSize: '11px'
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* دکمه اضافه کردن راز */}
            <div style={{ padding: '16px' }}>
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setShowSecretsModal(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: colors.blue,
                  border: 'none',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(77,182,172,0.3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <HiOutlinePlus size={18} color="white" />
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>راز جدید بنویس</span>
              </button>
            </div>

            {/* لیست رازها */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 16px 20px 16px',
              maxHeight: 'calc(85vh - 180px)'
            }}>
              {viewMode === 'all' && (
                <>
                  {unlockedSecrets.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: '12px',
                        paddingRight: '8px',
                        borderRight: `3px solid ${colors.blue}`
                      }}>
                        📖 رازهایی که خوندی
                      </p>
                      {unlockedSecrets.map(secret => (
                        <div
                          key={secret.id}
                          style={{
                            backgroundColor: '#F5F5F5',
                            borderRadius: '16px',
                            padding: '14px',
                            marginBottom: '10px'
                          }}
                        >
                          <p style={{
                            fontSize: '13px',
                            color: colors.text,
                            lineHeight: 1.5,
                            marginBottom: '8px'
                          }}>
                            {secret.text}
                          </p>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span style={{ fontSize: '10px', color: colors.textSecondary }}>
                              📅 {secret.date}
                            </span>
                            <button
                              onClick={() => deleteSecret(secret.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#F44336',
                                padding: '6px',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFEBEE'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <HiOutlineTrash size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {lockedSecrets.length > 0 && (
                    <div>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: '12px',
                        paddingRight: '8px',
                        borderRight: `3px solid ${colors.purple}`
                      }}>
                        🔐 رازهایی که نخوندی
                      </p>
                      {lockedSecrets.map(secret => (
                        <div
                          key={secret.id}
                          onClick={() => openUnlockModal(secret)}
                          style={{
                            backgroundColor: 'rgba(186,104,200,0.1)',
                            borderRadius: '16px',
                            padding: '14px',
                            marginBottom: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(186,104,200,0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(186,104,200,0.1)'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <HiOutlineLockClosed size={18} color={colors.purple} />
                            <span style={{ fontSize: '13px', color: colors.text }}>
                              راز - {secret.date}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: colors.purple }}>برای باز کردن بزن</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {viewMode === 'unlocked' && (
                <>
                  {unlockedSecrets.length > 0 ? (
                    unlockedSecrets.map(secret => (
                      <div
                        key={secret.id}
                        style={{
                          backgroundColor: '#F5F5F5',
                          borderRadius: '16px',
                          padding: '14px',
                          marginBottom: '10px'
                        }}
                      >
                        <p style={{
                          fontSize: '13px',
                          color: colors.text,
                          lineHeight: 1.5,
                          marginBottom: '8px'
                        }}>
                          {secret.text}
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span style={{ fontSize: '10px', color: colors.textSecondary }}>
                            📅 {secret.date}
                          </span>
                          <button
                            onClick={() => deleteSecret(secret.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#F44336',
                              padding: '6px',
                              borderRadius: '8px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFEBEE'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <HiOutlineTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: colors.textSecondary
                    }}>
                      <span style={{ fontSize: '48px', opacity: 0.5 }}>📖</span>
                      <p style={{ marginTop: '12px' }}>هنوز هیچ رازی باز نکردی</p>
                    </div>
                  )}
                </>
              )}

              {viewMode === 'locked' && (
                <>
                  {lockedSecrets.length > 0 ? (
                    lockedSecrets.map(secret => (
                      <div
                        key={secret.id}
                        onClick={() => openUnlockModal(secret)}
                        style={{
                          backgroundColor: 'rgba(186,104,200,0.1)',
                          borderRadius: '16px',
                          padding: '14px',
                          marginBottom: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(186,104,200,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(186,104,200,0.1)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <HiOutlineLockClosed size={18} color={colors.purple} />
                          <span style={{ fontSize: '13px', color: colors.text }}>
                            راز - {secret.date}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: colors.purple }}>برای باز کردن بزن</span>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: colors.textSecondary
                    }}>
                      <span style={{ fontSize: '48px', opacity: 0.5 }}>🔓</span>
                      <p style={{ marginTop: '12px' }}>همه رازها رو باز کردی!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* مودال اضافه کردن راز */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 2100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            backgroundColor: colors.cardBg,
            borderRadius: '28px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              نوشتن راز جدید
            </h3>
            
            <p style={{
              fontSize: '12px',
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              💭 هر چی دوست داری بنویس، اینجا فقط مال خودته
            </p>
            
            <textarea
              value={newSecret}
              onChange={(e) => setNewSecret(e.target.value)}
              placeholder="رازت رو اینجا بنویس..."
              rows={5}
              style={{
                width: '100%',
                padding: '14px',
                border: `2px solid ${colors.primary}`,
                borderRadius: '20px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                direction: 'rtl'
              }}
            />
            
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#E0E0E0',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                انصراف
              </button>
              <button
                onClick={addSecret}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: colors.blue,
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                ذخیره راز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال باز کردن راز قفل شده */}
      {showPasswordModal && selectedSecret && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 2100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }} onClick={() => {
          setShowPasswordModal(false);
          setPassword('');
          setSelectedSecret(null);
        }}>
          <div style={{
            backgroundColor: colors.cardBg,
            borderRadius: '28px',
            padding: '24px',
            width: '90%',
            maxWidth: '350px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              🔐 باز کردن راز
            </h3>
            
            <p style={{
              fontSize: '12px',
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              برای دیدن این راز باید رمز رو وارد کنی
            </p>
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز را وارد کن..."
              style={{
                width: '100%',
                padding: '14px',
                border: `2px solid ${colors.primary}`,
                borderRadius: '16px',
                fontSize: '14px',
                outline: 'none',
                textAlign: 'center',
                marginBottom: '20px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') unlockSecret(selectedSecret);
              }}
            />
            
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setSelectedSecret(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#E0E0E0',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                انصراف
              </button>
              <button
                onClick={() => unlockSecret(selectedSecret)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: colors.blue,
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                باز کردن
              </button>
            </div>
            
            <p style={{
              fontSize: '10px',
              color: colors.textSecondary,
              textAlign: 'center',
              marginTop: '16px'
            }}>
              💡 رمز پیش‌فرض: 1234
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default SecretsSection;