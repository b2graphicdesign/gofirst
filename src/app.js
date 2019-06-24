import React, { useEffect, useRef, useState } from 'react';
import useInterval from '@use-it/interval';

const PASSIVE_EVENT_HANDLER = { passive: false };

const TICK_DURATION = 1000;
const TICKS_TO_WAIT = 3;
const TICKS_TO_DECIDE = 2;

function vibrate(...args) {
  try {
    navigator.vibrate(...args);
  } catch (error) {
    // Pass
  }
}

function svgPointFromEvent(svg, event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

export default function App() {
  const svg = useRef(null);
  const [fingers, setFingers] = useState({});
  const fingersRef = useRef(fingers);
  const [elapsed, setElapsed] = useState(0);
  const [completionState, setCompletionState] = useState(null);

  function syncTouchData(event) {
    const newFingers = {};
    [...event.touches].forEach(touch => {
      const { x, y } = svgPointFromEvent(svg.current, touch);
      const hue = fingersRef.current[touch.identifier]
        ? fingersRef.current[touch.identifier].hue
        : Math.floor(Math.random() * 360);

        newFingers[touch.identifier] = { x, y, hue };
    });

    fingersRef.current = { ...newFingers };
    setFingers(fingersRef.current);
  }

  function handleTouchStart(startEvent) {
    startEvent.preventDefault();
    setCompletionState(null);
    syncTouchData(startEvent);

    function handleTouchMove(moveEvent) {
      moveEvent.preventDefault();
      syncTouchData(moveEvent);
    }

    function handleTouchEnd(endEvent) {
      syncTouchData(endEvent);

      if (endEvent.touches.length === 0) {
        removeEventListener('touchmove', handleTouchMove, PASSIVE_EVENT_HANDLER);
        removeEventListener('touchend', handleTouchEnd, PASSIVE_EVENT_HANDLER);
      }
    }

    if (startEvent.touches.length === 1) {
      addEventListener('touchmove', handleTouchMove, PASSIVE_EVENT_HANDLER);
      addEventListener('touchend', handleTouchEnd, PASSIVE_EVENT_HANDLER);
    }
  }

  const fingerIds = Object.keys(fingers);

  useEffect(() => {
    setElapsed(0);
    if (fingerIds.length !== 0 && !completionState) {
      vibrate(25);
    }
  }, [fingerIds.length]);

  useInterval(() => {
    if (elapsed === TICKS_TO_DECIDE) {
      vibrate([50, 50, 50, 50, 100]);
    } else if (elapsed + 1 === TICKS_TO_WAIT + TICKS_TO_DECIDE) {
      vibrate([100, 50, 50, 50, 50, 50, 300]);
      setCompletionState({
        fingers: { ...fingers },
        winner: fingerIds[Math.floor(Math.random() * fingerIds.length)],
      });
    }

    setElapsed(elapsed + 1);
  }, fingerIds.length < 1 || completionState ? null : TICK_DURATION);

  const fingersToRender = completionState ? completionState.fingers : fingers;

  return (
    <React.Fragment>
      <h1>
        {completionState ? (
          `Winner: ${completionState.winner}`
        ) : fingerIds.length === 0 ? (
          'Touch to start'
        ) : elapsed < TICKS_TO_WAIT ? (
          'Waiting for players...'
        ) : elapsed < TICKS_TO_WAIT + TICKS_TO_DECIDE ? (
          'Deciding...'
        ) : null}
      </h1>

      <svg
        ref={svg}
        style={{
          height: '100%',
          left: 0,
          outline: '1px solid gray',
          position: 'fixed',
          top: 0,
          touchAction: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          width: '100%',
        }}
        onTouchStart={handleTouchStart}
      >
        {completionState && <rect
          width="100%"
          height="100%"
          fill={`hsla(${completionState.fingers[completionState.winner].hue}, 50%, 50%, 0.5)`}
        />}

        {Object.entries(fingersToRender).map(([fingerId, { x, y, hue }]) => (
          <g
            key={fingerId}
            transform={`translate(${x}, ${y})`}
          >
            <circle
              r={completionState ? completionState.winner === fingerId ? 90 : 50 : 70}
              fill={`hsla(${hue}, 50%, 50%, 0.8)`}
              stroke="none"
            />
          </g>
        ))}
      </svg>

      <pre>{JSON.stringify({ elapsed, fingers, completionState }, null, 2)}</pre>
    </React.Fragment>
  );
}
