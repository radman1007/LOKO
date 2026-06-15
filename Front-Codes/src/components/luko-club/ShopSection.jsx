import React from 'react';

const ShopSection = ({ rewards, purchasedItems, onPurchase, colors, isMobile, pressedItem, setPressedItem }) => {
  return (
    <div style={{ marginTop: '32px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, marginBottom: '16px' }}>فروشگاه جوایز</h3>
      <div style={{ display: 'flex', overflowX: 'auto', gap: '16px', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '8px' }}>
        {rewards.map((reward) => {
          const isPurchased = purchasedItems.includes(reward.id);
          return (
            <div
              key={reward.id}
              onClick={() => !isPurchased && onPurchase(reward.id, reward.price)}
              style={{
                minWidth: isMobile ? '110px' : '120px',
                width: isMobile ? '110px' : '120px',
                cursor: isPurchased ? 'default' : 'pointer',
                opacity: isPurchased ? 0.6 : 1,
                transition: 'transform 0.08s linear',
                transform: pressedItem === `reward_${reward.id}` ? 'scale(0.97)' : 'scale(1)',
                backgroundColor: colors.cardBg,
                borderRadius: '20px',
                padding: '12px 8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
              onMouseDown={() => !isPurchased && setPressedItem(`reward_${reward.id}`)}
              onMouseUp={() => setTimeout(() => setPressedItem(null), 100)}
            >
              <div style={{
                width: '65px',
                height: '65px',
                margin: '0 auto 8px auto',
                backgroundColor: colors.iconBg,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img src={reward.icon} alt={reward.title} style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
              </div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: '4px', lineHeight: 1.3 }}>{reward.title}</p>
              <p style={{ fontSize: '9px', color: colors.textSecondary, textAlign: 'center', marginBottom: '8px' }}>{reward.description}</p>
              {isPurchased ? (
                <div style={{ backgroundColor: colors.primaryDark, borderRadius: '16px', padding: '4px 8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'white' }}>خریداری شد</span>
                </div>
              ) : (
                <div style={{ backgroundColor: colors.xpBg, borderRadius: '16px', padding: '4px 8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: colors.text }}>{reward.price} XP</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShopSection;