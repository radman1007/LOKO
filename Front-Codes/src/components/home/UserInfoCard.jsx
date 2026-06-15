import React from 'react';
import {
  HiOutlineBell,
} from 'react-icons/hi';

import Icon11 from '../../icons/icon55.png';

/* =========================
   MERGED SHAPE
========================= */

const MergedShape = ({
  fill = "#ffffff",
  children,
  style: containerStyle,
  ...props
}) => (
  <div
    style={{
      position: 'relative',

      width: '100%',
      maxWidth: '100%',

      height: 250,

      overflow: 'hidden',

      minWidth: 0,

      flexShrink: 0,

      transform: 'translateZ(0)',
      WebkitTransform: 'translateZ(0)',

      boxSizing: 'border-box',

      ...containerStyle,
    }}
    {...props}
  >
    {/* TOP RIGHT BOX */}
    <div
      style={{
        position: 'absolute',

        right: 0,
        top: 0,

        width: 190,
        height: 150,

        background: fill,

        borderRadius: 34,

        overflow: 'hidden',

        transform: 'translateZ(0)',
      }}
    />

    {/* BOTTOM BOX */}
    <div
      style={{
        position: 'absolute',

        left: 0,
        top: 74,

        width: '100%',
        height: 176,

        background: fill,

        borderRadius: 34,

        overflow: 'hidden',

        transform: 'translateZ(0)',
      }}
    />

    {children}
  </div>
);

/* =========================
   USER INFO CARD
========================= */

const UserInfoCard = ({
  user,
  onPress,
  pressedItem,
}) => {
  const displayUsername =
    user?.username?.replace('@', '') || 'امیرعلی';

  return (
    <div
      style={{
        width: '100%',
        marginBottom: 24,
        direction: 'rtl',
      }}
    >
      {/* ================= HEADER BOX ================= */}

      <div
        style={{
          width: '100%',

          background: '#FFFFFF',

          borderRadius: 28,

          padding: '16px 18px',

          marginBottom: 18,

          boxShadow:
            '0 12px 28px rgba(0,0,0,0.06)',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',

          boxSizing: 'border-box',
        }}
      >
        {/* RIGHT SIDE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* AVATAR */}
          <div
            style={{
              width: 60,
              height: 60,

              borderRadius: '50%',

              overflow: 'hidden',

              background:
                'linear-gradient(135deg,#7EE7E1 0%,#63D5D0 100%)',

              boxShadow:
                '0 10px 20px rgba(90,210,205,0.22)',

              flexShrink: 0,
            }}
          >
            <img
              src={user?.avatar || Icon11}
              alt="avatar"
              style={{
                width: '100%',
                height: '100%',

                objectFit: 'cover',
              }}
            />
          </div>

          {/* TEXT */}
          <div>
            <h2
              style={{
                margin: 0,

                fontSize: 18,
                fontWeight: 900,

                color: '#1F2544',

                marginBottom: 5,
              }}
            >
              سلام {displayUsername}
            </h2>

            <p
              style={{
                margin: 0,

                fontSize: 14,
                fontWeight: 700,

                color: '#7A819A',
              }}
            >
              خوش برگشتی 
            </p>
          </div>
        </div>

        {/* BELL */}
        <div
          style={{
            width: 56,
            height: 56,

            borderRadius: 20,

            background:
              'linear-gradient(180deg,#FFFFFF 0%,#F8FAFF 100%)',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            position: 'relative',

            boxShadow:
              '0 10px 20px rgba(0,0,0,0.06)',

            flexShrink: 0,
          }}
        >
          <HiOutlineBell
            size={28}
            color="#202540"
          />

          {/* DOT */}
          <div
            style={{
              position: 'absolute',

              top: 13,
              right: 14,

              width: 10,
              height: 10,

              borderRadius: '50%',

              background: '#FF912F',

              border: '2px solid #fff',
            }}
          />
        </div>
      </div>

      {/* ================= CARD ================= */}

      <div
        onClick={() =>
          onPress?.('/classroom', 'class_room')
        }
        style={{
          width: '100%',

          minWidth: 0,

          overflow: 'hidden',

          boxSizing: 'border-box',

          cursor: 'pointer',

          transition: 'transform .18s ease',

          transform:
            pressedItem === 'class_room'
              ? 'scale(0.985)'
              : 'scale(1)',
        }}
      >
        <MergedShape
          fill={`
            linear-gradient(
              145deg,
              #D9F4FF 0%,
              #BFE9FF 45%,
              #A9DFFF 100%
            )
          `}
          style={{
            filter:
              'drop-shadow(0 16px 28px rgba(90,180,255,0.16))',
          }}
        >
          {/* BG GLOW */}
          <div
            style={{
              position: 'absolute',

              width: 240,
              height: 240,

              borderRadius: '50%',

              background:
                'radial-gradient(circle, rgba(255,255,255,0.24), transparent)',

              top: -120,
              right: -80,
            }}
          />

          {/* CHARACTER BOX */}
          <div
            style={{
              position: 'absolute',

              right: 0,
              top: 0,

              width: 190,
              height: 150,

              borderRadius: 34,

              overflow: 'hidden',
            }}
          >
            {/* SHADOW */}
            <div
              style={{
                position: 'absolute',

                width: 120,
                height: 20,

                borderRadius: '50%',

                background:
                  'rgba(30,90,130,0.18)',

                filter: 'blur(15px)',

                bottom: 14,
                right: 28,

                zIndex: 1,
              }}
            />

            {/* CHARACTER */}
            <img
              src={Icon11}
              alt="robot"
              style={{
                position: 'absolute',

                width: 165,

                right: 10,
                bottom: -8,

                objectFit: 'contain',

                zIndex: 2,

                pointerEvents: 'none',

                userSelect: 'none',

                filter:
                  'drop-shadow(0 12px 20px rgba(20,70,100,0.18))',
              }}
            />
          </div>

          {/* ===== TITLE OUTSIDE CARD ===== */}
          <div
            style={{
              position: 'absolute',

              left: 18,
              top: 10,

              width: 150,

              zIndex: 10,
            }}
          >
            <h2
              style={{
                margin: 0,

                fontSize: 15,
                fontWeight: 900,

                lineHeight: '28px',

                color: '#14455F',
              }}
            >
              {/* ورود به کلاس */}
            </h2>
          </div>

          {/* ===== INSIDE CARD CONTENT ===== */}
          <div
            style={{
              position: 'absolute',

              left: 20,
              top: 112,

              zIndex: 5,
            }}
          >
            <p
              style={{
                margin: 0,

                fontSize: 13,
                fontWeight: 800,

                color: '#2D6078',

                marginBottom: 6,
              }}
            >
              کلاس امروز منتظرته 
            </p>

            <div
              style={{
                fontSize: 12,
                fontWeight: 700,

                color: '#4A7B91',
              }}
            >
              آماده یادگیری شو 
            </div>
          </div>

          {/* BOTTOM AREA */}
          <div
            style={{
              position: 'absolute',

              left: 0,
              right: 0,
              bottom: 0,

              height: 176,

              padding: 18,

              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',

              boxSizing: 'border-box',

              zIndex: 6,
            }}
          >
            {/* RIGHT BADGE */}
            <div
              style={{
                background:
                  'rgba(255,255,255,0.34)',

                backdropFilter: 'blur(10px)',

                border:
                  '1px solid rgba(255,255,255,0.24)',

                borderRadius: 999,

                padding: '10px 14px',

                display: 'flex',
                alignItems: 'center',
                gap: 8,

                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,

                  borderRadius: '50%',

                  background: '#2096D1',

                  boxShadow:
                    '0 0 10px rgba(32,150,209,0.7)',
                }}
              />

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,

                  color: '#1C5D7A',

                  whiteSpace: 'nowrap',
                }}
              >
                کلاس فعال
              </span>
            </div>

            {/* LEFT BUTTON */}
            <div
              style={{
                height: 58,

                padding: '0 22px',

                borderRadius: 999,

                background:
                  'linear-gradient(180deg,#FFFFFF 0%,#F3FBFF 100%)',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                boxShadow:
                  `
                  0 8px 20px rgba(60,140,180,0.16),
                  inset 0 1px 1px rgba(255,255,255,0.8)
                  `,

                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,

                  color: '#2096D1',

                  whiteSpace: 'nowrap',
                }}
              >
                ورود به کلاس
              </span>
            </div>
          </div>
        </MergedShape>
      </div>
    </div>
  );
};

export default UserInfoCard;