import React from 'react';
import BookIcon from '../../icons/icon7.png';

const BooksSection = ({ books, onPress, pressedItem, colors }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
        <img src={BookIcon} alt="books" style={{ width: '24px', height: '24px' }} />
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text }}>کتاب‌های من</h3>
      </div>
      
      <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '8px' }}>
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => onPress('/books', `book_${book.id}`)}
            style={{
              minWidth: '90px', width: '90px', cursor: 'pointer', transition: 'transform 0.08s linear',
              transform: pressedItem === `book_${book.id}` ? 'scale(0.97)' : 'scale(1)'
            }}
          >
            <div style={{
              width: '90px', height: '135px', borderRadius: '12px', overflow: 'hidden',
              backgroundColor: colors.primaryLight, marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <img src={book.cover} alt="book" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BooksSection;