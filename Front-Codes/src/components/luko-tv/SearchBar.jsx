import React from 'react';
import { HiOutlineSearch } from 'react-icons/hi';

const SearchBar = ({ searchQuery, onSearchChange, colors, isMobile }) => {
  return (
    <div style={{
      flex: 1,
      maxWidth: isMobile ? '200px' : '300px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: colors.cardBg,
        borderRadius: '40px',
        border: `1px solid rgba(255,255,255,0.2)`
      }}>
        <HiOutlineSearch style={{ margin: '0 8px', color: colors.textSecondary }} size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="جستجو..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            padding: isMobile ? '8px 0' : '10px 0',
            paddingLeft: '16px',
            color: colors.text,
            fontSize: isMobile ? '13px' : '14px',
            outline: 'none',
            direction: 'rtl'
          }}
        />
      </div>
    </div>
  );
};

export default SearchBar;