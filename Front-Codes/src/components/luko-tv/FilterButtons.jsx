import React from 'react';

const FilterButtons = ({ filters, activeFilters, onToggleFilter, colors, isMobile }) => {
  return (
    <div style={{
      display: 'flex',
      overflowX: 'auto',
      gap: '12px',
      marginBottom: '24px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      paddingBottom: '8px'
    }}>
      {filters.map((btn) => (
        <button
          key={btn.id}
          onClick={() => onToggleFilter(btn.id)}
          style={{
            padding: isMobile ? '8px 16px' : '10px 24px',
            borderRadius: '40px',
            border: 'none',
            background: activeFilters.includes(btn.id) ? btn.color : 'rgba(255,255,255,0.15)',
            color: activeFilters.includes(btn.id) ? '#110A2C' : colors.text,
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          {btn.title}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;