import React from 'react';
import BookIcon from '../../icons/icon7.png';

const BooksSection = ({ books, onPress, pressedItem, colors }) => {
  return (
    <div style={{ marginBottom: 24, direction: 'rtl', marginTop: 26 }}>
      
      {/* HEADER - کاملاً هماهنگ */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <img src={BookIcon} alt="books" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1F2544' }}>
            کتاب‌های من
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#7B8199', paddingRight: 30 }}>
          کتاب‌های اختصاصی خودت رو بخون
        </p>
      </div>
      
      <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '8px' }}>
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => onPress('/books', `book_${book.id}`)}
            style={{ minWidth: '90px', width: '90px', cursor: 'pointer', transition: 'transform 0.08s linear', transform: pressedItem === `book_${book.id}` ? 'scale(0.97)' : 'scale(1)' }}
          >
            <div style={{ width: '90px', height: '135px', borderRadius: '12px', overflow: 'hidden', backgroundColor: colors.primaryLight, marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <img src={book.cover} alt="book" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BooksSection;