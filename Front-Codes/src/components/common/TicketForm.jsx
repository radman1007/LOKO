// src/components/common/TicketForm.jsx
import React, { useState } from 'react';
import { HiOutlineX } from 'react-icons/hi';
import { createTicket } from '../../data/ticketData';

const TicketForm = ({ isOpen, onClose, user, onTicketCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('technical');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'technical', label: 'مشکل فنی', color: '#F44336' },
    { id: 'request', label: 'درخواست جدید', color: '#4CAF50' },
    { id: 'question', label: 'سوال', color: '#2196F3' },
    { id: 'other', label: 'سایر', color: '#9C27B0' }
  ];

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      alert('لطفاً عنوان و توضیحات را وارد کنید');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const newTicket = createTicket(user, title, description, category);
      alert('✅ تیکت شما با موفقیت ارسال شد');
      onTicketCreated?.(newTicket);
      setTitle('');
      setDescription('');
      setCategory('technical');
      onClose();
      setIsSubmitting(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
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
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '28px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '85vh',
        overflowY: 'auto',
        animation: 'slideUp 0.3s ease'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E0E0E0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#333' }}>تیکت جدید</h2>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%'
          }}>
            <HiOutlineX size={22} color="#999" />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* دسته‌بندی */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#555',
              marginBottom: '8px'
            }}>
              دسته‌بندی
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '30px',
                    border: category === cat.id ? `2px solid ${cat.color}` : '1px solid #DDD',
                    background: category === cat.id ? `${cat.color}10` : 'transparent',
                    color: category === cat.id ? cat.color : '#888',
                    fontSize: '13px',
                    fontWeight: category === cat.id ? '600' : '400',
                    cursor: 'pointer'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* عنوان */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#555',
              marginBottom: '8px'
            }}>
              عنوان
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="موضوع تیکت را وارد کنید..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #DDD',
                borderRadius: '16px',
                fontSize: '14px',
                outline: 'none',
                direction: 'rtl'
              }}
            />
          </div>

          {/* توضیحات */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#555',
              marginBottom: '8px'
            }}>
              توضیحات
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مشکل یا درخواست خود را با جزئیات بنویسید..."
              rows={5}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #DDD',
                borderRadius: '16px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                direction: 'rtl'
              }}
            />
          </div>

          {/* دکمه ارسال */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#4DB6AC',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'در حال ارسال...' : 'ارسال تیکت'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TicketForm;