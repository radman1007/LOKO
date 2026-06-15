// src/components/common/TicketList.jsx
import React, { useState, useEffect } from 'react';
import { HiOutlineChat, HiOutlineCheckCircle, HiOutlineClock, HiOutlinePlus } from 'react-icons/hi';
import { getTicketsByUser, answerTicket, getTicketStats } from '../../data/ticketData';
import TicketForm from './TicketForm';

const TicketList = ({ user, colors, isMobile }) => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0 });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'answered'

  const loadTickets = () => {
    const userTickets = getTicketsByUser(user);
    setTickets(userTickets);
    setStats(getTicketStats(user));
  };

  useEffect(() => {
    loadTickets();
  }, [user]);

  const handleAnswer = (ticket) => {
    if (user.role !== 'admin') return;
    setSelectedTicket(ticket);
    setAnswerText(ticket.answer || '');
    setShowAnswerModal(true);
  };

  const submitAnswer = () => {
    if (!answerText.trim()) {
      alert('لطفاً پاسخ را وارد کنید');
      return;
    }
    
    answerTicket(selectedTicket.id, answerText);
    loadTickets();
    setShowAnswerModal(false);
    setSelectedTicket(null);
    setAnswerText('');
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'answered') return t.status === 'answered';
    return true;
  });

  const getCategoryLabel = (category) => {
    const labels = {
      technical: 'مشکل فنی',
      request: 'درخواست',
      question: 'سوال',
      other: 'سایر'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      technical: '#F44336',
      request: '#4CAF50',
      question: '#2196F3',
      other: '#9C27B0'
    };
    return colors[category] || '#888';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'مدیر تیم',
      school_manager: 'مدیر مدرسه',
      teacher: 'معلم',
      student: 'دانش‌آموز'
    };
    return labels[role] || role;
  };

  // نمایش دکمه تیکت جدید برای: دانش‌آموز، معلم، مدیر مدرسه
  const canCreateTicket = user && (user.role === 'student' || user.role === 'teacher' || user.role === 'school_manager');

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text }}>
          🎫 تیکت‌های من
        </h3>
        
        {/* آمار تیکت‌ها */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            backgroundColor: '#E3F2FD',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '12px',
            color: '#1976D2'
          }}>
            کل: {stats.total}
          </div>
          <div style={{
            backgroundColor: '#FFF3E0',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '12px',
            color: '#FF9800'
          }}>
            در انتظار: {stats.pending}
          </div>
          <div style={{
            backgroundColor: '#E8F5E9',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '12px',
            color: '#4CAF50'
          }}>
            پاسخ داده: {stats.answered}
          </div>
        </div>
      </div>

      {/* دکمه تیکت جدید */}
      {canCreateTicket && (
        <button
          onClick={() => setShowTicketForm(true)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: colors.primary || '#4DB6AC',
            border: 'none',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            marginBottom: '16px',
            color: 'white',
            fontWeight: '600'
          }}
        >
          <HiOutlinePlus size={18} />
          <span>تیکت جدید</span>
        </button>
      )}

      {/* فیلترها */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        borderBottom: `1px solid ${colors.border || '#E0E0E0'}`,
        paddingBottom: '8px'
      }}>
        {[
          { id: 'all', label: 'همه' },
          { id: 'pending', label: 'در انتظار' },
          { id: 'answered', label: 'پاسخ داده شده' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 0',
              fontSize: '13px',
              fontWeight: filter === f.id ? '600' : '400',
              color: filter === f.id ? colors.primary || '#4DB6AC' : '#888',
              cursor: 'pointer',
              borderBottom: filter === f.id ? `2px solid ${colors.primary || '#4DB6AC'}` : 'none'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* لیست تیکت‌ها */}
      {filteredTickets.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: '#F5F5F5',
          borderRadius: '20px',
          color: '#999'
        }}>
          <HiOutlineChat size={40} opacity={0.5} />
          <p style={{ marginTop: '12px' }}>تیکتی وجود ندارد</p>
          {canCreateTicket && (
            <button
              onClick={() => setShowTicketForm(true)}
              style={{
                marginTop: '16px',
                background: 'transparent',
                border: 'none',
                color: colors.primary || '#4DB6AC',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              + اولین تیکت خود را بزنید
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => user.role === 'admin' && handleAnswer(ticket)}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '16px',
                border: `1px solid ${ticket.status === 'pending' ? '#FFE0B2' : '#C8E6C9'}`,
                cursor: user.role === 'admin' ? 'pointer' : 'default',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    backgroundColor: getCategoryColor(ticket.category),
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    display: 'inline-block'
                  }} />
                  <span style={{ fontSize: '12px', color: getCategoryColor(ticket.category) }}>
                    {getCategoryLabel(ticket.category)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '10px',
                    backgroundColor: '#E8E8E8',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    color: '#666'
                  }}>
                    {getRoleLabel(ticket.createdByRole)}
                  </span>
                  {ticket.status === 'pending' ? (
                    <span style={{ fontSize: '11px', color: '#FF9800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HiOutlineClock size={12} /> در انتظار پاسخ
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HiOutlineCheckCircle size={12} /> پاسخ داده شد
                    </span>
                  )}
                  <span style={{ fontSize: '10px', color: '#999' }}>{ticket.createdAt}</span>
                </div>
              </div>
              
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                {ticket.title}
              </h4>
              
              <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, marginBottom: '12px' }}>
                {ticket.description}
              </p>
              
              {ticket.answer && (
                <div style={{
                  backgroundColor: '#F5F5F5',
                  borderRadius: '12px',
                  padding: '12px',
                  marginTop: '8px',
                  borderRight: `3px solid ${colors.primary || '#4DB6AC'}`
                }}>
                  <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>پاسخ مدیر:</p>
                  <p style={{ fontSize: '13px', color: '#555' }}>{ticket.answer}</p>
                  <p style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>{ticket.answeredAt}</p>
                </div>
              )}
              
              {user.role === 'admin' && ticket.status === 'pending' && (
                <div style={{ marginTop: '12px', textAlign: 'left' }}>
                  <span style={{ fontSize: '11px', color: colors.primary }}>برای پاسخ کلیک کنید</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* مودال پاسخ به تیکت (فقط مدیر) */}
      {showAnswerModal && selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowAnswerModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '28px',
            width: '90%',
            maxWidth: '500px',
            padding: '24px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>پاسخ به تیکت</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              از: {selectedTicket.createdByName} ({getRoleLabel(selectedTicket.createdByRole)})
            </p>
            
            <div style={{
              backgroundColor: '#F5F5F5',
              borderRadius: '16px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>{selectedTicket.title}</p>
              <p style={{ fontSize: '13px', color: '#666' }}>{selectedTicket.description}</p>
            </div>
            
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="پاسخ خود را بنویسید..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #DDD',
                borderRadius: '16px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                marginBottom: '16px'
              }}
            />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowAnswerModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#E0E0E0',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer'
                }}
              >
                انصراف
              </button>
              <button
                onClick={submitAnswer}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: colors.primary || '#4DB6AC',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ارسال پاسخ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* فرم تیکت جدید */}
      <TicketForm
        isOpen={showTicketForm}
        onClose={() => setShowTicketForm(false)}
        user={user}
        onTicketCreated={loadTickets}
      />
    </div>
  );
};

export default TicketList;