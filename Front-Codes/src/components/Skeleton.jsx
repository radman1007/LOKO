import React from 'react';

const Skeleton = ({ type = 'card', count = 1 }) => {
  const colors = {
    bg: '#E8F5E9',
    skeletonDark: '#D0E0D0',
    skeletonLight: '#E8F5E9'
  };

  const shimmerStyle = {
    background: `linear-gradient(90deg, 
      ${colors.skeletonDark} 0%, 
      ${colors.skeletonLight} 50%, 
      ${colors.skeletonDark} 100%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  };

  // اسکلت بنر
  const BannerSkeleton = () => (
    <div style={{
      width: '100%',
      height: '140px',
      borderRadius: '18px',
      ...shimmerStyle,
      marginBottom: '12px'
    }} />
  );

  // اسکلت دکمه ۴ تایی
  const ActionButtonSkeleton = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '24px'
    }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          background: colors.skeletonDark,
          borderRadius: '18px',
          padding: '14px 12px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            ...shimmerStyle,
            margin: '0 auto 8px'
          }} />
          <div style={{
            width: '60%',
            height: '10px',
            borderRadius: '5px',
            ...shimmerStyle,
            margin: '0 auto'
          }} />
        </div>
      ))}
    </div>
  );

  // اسکلت کارت (برای ویدیوها، افتخارات، کتاب‌ها)
  const CardSkeleton = () => (
    <div style={{
      minWidth: type === 'book' ? '90px' : '150px',
      width: type === 'book' ? '90px' : '150px',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '100%',
        height: type === 'book' ? '135px' : '90px',
        borderRadius: type === 'book' ? '12px' : '12px',
        ...shimmerStyle,
        marginBottom: '8px'
      }} />
      <div style={{
        width: '80%',
        height: '12px',
        borderRadius: '6px',
        ...shimmerStyle,
        margin: '0 auto'
      }} />
    </div>
  );

  // اسکلت بخش سلامت
  const HealthSkeleton = () => (
    <div style={{
      backgroundColor: '#B2DFDB',
      borderRadius: '20px',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '12px 16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', ...shimmerStyle }} />
          <div style={{ width: '100px', height: '12px', borderRadius: '6px', ...shimmerStyle }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', ...shimmerStyle }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: '10px 8px', borderRadius: '16px', ...shimmerStyle, textAlign: 'center' }}>
            <div style={{ width: '50%', height: '11px', borderRadius: '6px', ...shimmerStyle, margin: '0 auto' }} />
          </div>
        ))}
      </div>
    </div>
  );

  // اسکلت باشگاه لوکو
  const ClubSkeleton = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '16px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', ...shimmerStyle }} />
        <div style={{ width: '100px', height: '16px', borderRadius: '8px', ...shimmerStyle }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', ...shimmerStyle }} />
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', ...shimmerStyle }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: '8px', borderRadius: '8px', ...shimmerStyle }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <div style={{ width: '60px', height: '10px', borderRadius: '5px', ...shimmerStyle }} />
            <div style={{ width: '40px', height: '10px', borderRadius: '5px', ...shimmerStyle }} />
          </div>
        </div>
      </div>
      <div style={{ borderRadius: '16px', padding: '12px 16px', ...shimmerStyle }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', ...shimmerStyle }} />
            <div style={{ width: '130px', height: '13px', borderRadius: '6px', ...shimmerStyle }} />
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ width: '30px', height: '12px', borderRadius: '6px', ...shimmerStyle }} />
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', ...shimmerStyle }} />
          </div>
        </div>
      </div>
    </div>
  );

  // اسکلت اسکرول افقی
  const ScrollSkeleton = () => (
    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} type={type} />
      ))}
    </div>
  );

  if (type === 'banner') return <BannerSkeleton />;
  if (type === 'actions') return <ActionButtonSkeleton />;
  if (type === 'club') return <ClubSkeleton />;
  if (type === 'health') return <HealthSkeleton />;
  if (type === 'scroll') return <ScrollSkeleton />;
  return <CardSkeleton />;
};

// اضافه کردن استایل global
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
document.head.appendChild(style);

export default Skeleton;