import React from 'react';
import { useNavigate } from 'react-router-dom';
import carcter from "../../icons/icon54.png";

const PodcastIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 17V21" stroke="#7B57E8" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M8.5 9.5C8.5 7.57 10.07 6 12 6C13.93 6 15.5 7.57 15.5 9.5V11C15.5 12.93 13.93 14.5 12 14.5C10.07 14.5 8.5 12.93 8.5 11V9.5Z" stroke="#7B57E8" strokeWidth="2.2" />
    <path d="M5 11.5C5 15.37 8.13 18.5 12 18.5C15.87 18.5 19 15.37 19 11.5" stroke="#7B57E8" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const MergedShape = ({ fill = "#ffffff", children, style: containerStyle, ...props }) => (
  <div style={{ position: 'relative', width: '100%', maxWidth: '100%', height: 250, overflow: 'hidden', minWidth: 0, flexShrink: 0, transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)', boxSizing: 'border-box', ...containerStyle }} {...props}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 190, height: 150, background: fill, borderRadius: 34, overflow: 'hidden', transform: 'translateZ(0)' }} />
    <div style={{ position: 'absolute', left: 0, top: 74, width: '100%', height: 176, background: fill, borderRadius: 34, overflow: 'hidden', transform: 'translateZ(0)' }} />
    {children}
  </div>
);

const LukoPadkast = ({ onPress, pressedItem }) => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: 24, direction: 'rtl', width: '100%', minWidth: 0, boxSizing: 'border-box', marginTop: 26 }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PodcastIcon />
          </div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1F2544' }}>
            لوکو پادکست
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#7B8199', paddingRight: 30 }}>
          گوش بده و چیزهای جدید یاد بگیر!
        </p>
      </div>

      {/* CARD */}
      <div
        onClick={() => navigate('/luko-podcast')}
        style={{ width: '100%', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box', cursor: 'pointer', transition: 'transform .18s ease', transform: pressedItem === 'podcast_main' ? 'scale(0.985)' : 'scale(1)' }}
      >
        <MergedShape fill={`linear-gradient(145deg, #E6D6FF 0%, #D7BEFF 45%, #C9AEFF 100%)`} style={{ filter: 'drop-shadow(0 16px 28px rgba(120,90,255,0.16))' }}>
          <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.24), transparent)', top: -120, left: -80 }} />
          
          <div style={{ position: 'absolute', left: 0, top: 0, width: 190, height: 150, borderRadius: 34, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 120, height: 20, borderRadius: '50%', background: 'rgba(70,40,130,0.20)', filter: 'blur(15px)', bottom: 14, left: 28, zIndex: 1 }} />
            <img src={carcter} alt="character" style={{ position: 'absolute', width: 170, left: -6, bottom: -6, objectFit: 'contain', zIndex: 2, pointerEvents: 'none', userSelect: 'none', filter: 'drop-shadow(0 12px 20px rgba(50,20,100,0.18))' }} />
          </div>

          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 176, padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 10, boxSizing: 'border-box', zIndex: 6 }}>
            {/* بج پادکست جدید - سمت راست */}
            <div style={{ width: '100%', display: 'flex', direction: 'ltr', justifyContent: 'flex-end' }}>
              <div style={{ background: 'rgba(255,255,255,0.34)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.24)', borderRadius: 999, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7B57E8', boxShadow: '0 0 10px rgba(123,87,232,0.7)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4E3B7B', whiteSpace: 'nowrap' }}>پادکست جدید</span>
              </div>
            </div>

            {/* عنوان + دکمه پلی */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(180deg,#FFFFFF 0%,#F8F4FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(90,60,160,0.16), inset 0 1px 1px rgba(255,255,255,0.8)', flexShrink: 0 }}>
                <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '16px solid #7B57E8', marginLeft: 5 }} />
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#5D4D87', marginBottom: 4 }}>قسمت ۷: جنگل اسرارآمیز</p>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6C5A97' }}>۲۱:۴۵ دقیقه</div>
              </div>
            </div>
          </div>
        </MergedShape>
      </div>
    </div>
  );
};

export default LukoPadkast;