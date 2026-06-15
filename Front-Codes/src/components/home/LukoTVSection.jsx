import React, { useEffect, useRef, useState } from 'react';
import Icon22 from '../../icons/icon22.png';

const LukoTVSection = ({
  videos,
  onPress,
  pressedItem,
  colors,
}) => {
  const scrollRef = useRef(null);
  const hideTimer = useRef(null);

  const [showArrow, setShowArrow] = useState(false);

  const triggerArrow = () => {
    setShowArrow(true);

    clearTimeout(hideTimer.current);

    hideTimer.current = setTimeout(() => {
      setShowArrow(false);
    }, 1800);
  };

  useEffect(() => {
    triggerArrow();
  }, []);

  const scrollCards = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -150,
        behavior: 'smooth',
      });

      triggerArrow();
    }
  };

  return (
    <div
      style={{
        marginTop: 26,
        marginBottom: 30,
        direction: 'rtl',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',

          marginBottom: 16,
        }}
      >
        {/* TOP */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,

            marginBottom: 4,
          }}
        >
          <img
            src={Icon22}
            alt="TV"
            style={{
              width: 22,
              height: 22,
              objectFit: 'contain',
            }}
          />

          <h3
            style={{
              margin: 0,

              fontSize: 17,
              fontWeight: 800,

              color: '#1F2544',
            }}
          >
            لوکو تلویزیون
          </h3>
        </div>

        {/* SUBTITLE */}
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 500,
            color: '#7B8199',
            paddingRight: 30,
          }}
        >
          کارتون‌ها و ویدیوهای آموزشی جذاب 
        </p>
      </div>

      {/* SLIDER */}
      <div
        style={{
          position: 'relative',
        }}
      >
        {/* ARROW */}
        <button
          onClick={scrollCards}
          style={{
            position: 'absolute',

            left: 6,
            top: '50%',

            transform: showArrow
              ? 'translateY(-50%) translateX(0)'
              : 'translateY(-50%) translateX(-10px)',

            opacity: showArrow ? 1 : 0,
            pointerEvents: showArrow ? 'auto' : 'none',

            width: 34,
            height: 34,

            borderRadius: '50%',
            border: 'none',

            background: 'rgba(255,255,255,0.96)',

            boxShadow:
              '0 4px 14px rgba(0,0,0,0.12)',

            zIndex: 20,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            cursor: 'pointer',

            transition: 'all .28s ease',

            backdropFilter: 'blur(10px)',
          }}
        >
          ←
        </button>

        {/* SLIDER */}
        <div
          ref={scrollRef}
          onScroll={triggerArrow}
          onTouchStart={triggerArrow}
          style={{
            display: 'flex',
            overflowX: 'auto',

            gap: 12,

            scrollbarWidth: 'none',
            msOverflowStyle: 'none',

            paddingBottom: 8,

            scrollBehavior: 'smooth',
          }}
        >
          {videos.map((show) => (
            <div
              key={show.id}
              onClick={() =>
                onPress(
                  '/entertainment',
                  `tv_${show.id}`
                )
              }
              style={{
                minWidth: '145px',
                width: '145px',

                cursor: 'pointer',

                transition: 'all .22s ease',

                backgroundColor: colors.cardBg,

                borderRadius: 16,

                padding: 8,

                boxShadow:
                  '0 3px 10px rgba(0,0,0,0.06)',

                transform:
                  pressedItem === `tv_${show.id}`
                    ? 'scale(.96)'
                    : 'scale(1)',
              }}
            >
              {/* THUMBNAIL */}
              <div
                style={{
                  position: 'relative',

                  width: '100%',
                  height: '92px',

                  borderRadius: 14,

                  overflow: 'hidden',

                  backgroundColor:
                    colors.primaryLight,

                  marginBottom: 10,
                }}
              >
                <img
                  src={show.image}
                  alt={show.title}
                  style={{
                    width: '100%',
                    height: '100%',

                    objectFit: 'cover',
                  }}
                />

                {/* OVERLAY */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,

                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.40), rgba(0,0,0,0.06))',
                  }}
                />

                {/* DURATION */}
                <div
                  style={{
                    position: 'absolute',

                    bottom: 7,
                    left: 7,

                    background:
                      'rgba(0,0,0,0.72)',

                    color: '#fff',

                    fontSize: 9,
                    fontWeight: 700,

                    padding: '4px 7px',

                    borderRadius: 8,

                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {show.duration || '12:40'}
                </div>

                {/* PLAY */}
                <div
                  style={{
                    position: 'absolute',

                    top: '50%',
                    left: '50%',

                    transform:
                      'translate(-50%, -50%)',

                    width: 42,
                    height: 42,

                    borderRadius: '50%',

                    background:
                      'rgba(255,255,255,0.94)',

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    backdropFilter: 'blur(8px)',

                    boxShadow:
                      '0 4px 12px rgba(0,0,0,0.18)',
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,

                      borderTop:
                        '7px solid transparent',

                      borderBottom:
                        '7px solid transparent',

                      borderLeft:
                        '11px solid #111',

                      marginLeft: 3,
                    }}
                  />
                </div>
              </div>

              {/* TITLE */}
              <p
                style={{
                  margin: 0,

                  fontSize: 11,
                  fontWeight: 700,

                  color: colors.text,

                  textAlign: 'right',

                  lineHeight: '17px',

                  display: '-webkit-box',

                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',

                  overflow: 'hidden',

                  minHeight: 34,
                }}
              >
                {show.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LukoTVSection;