import React, { useRef } from 'react';

const FUNCTIONAL_STYLES = {
  touchAction: 'none',
  userSelect: 'none',
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
};

function svgPointFromEvent(svg, event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const { x, y } = point.matrixTransform(svg.getScreenCTM().inverse());
  return { x, y };
}

function randomHue() {
  return Math.floor(Math.random() * 360);
}

export default function FingerTrackingSvg({ onChange }) {
  const rect = useRef(null);
  const fingers = useRef({});

  function handlePointerDown(downEvent) {
    if (Object.keys(fingers.current).length === 0) {
      addEventListener('pointermove', handlePointerMove);
      addEventListener('pointerup', handlePointerEnd);
    }

    const svg = rect.current.closest('svg');

    fingers.current[downEvent.pointerId] = {
      ...svgPointFromEvent(svg, downEvent),
      hue: randomHue(),
    };

    onChange({ ...fingers.current });
  }

  function handlePointerMove(moveEvent) {
    const svg = rect.current.closest('svg');

    fingers.current[moveEvent.pointerId] = {
      ...svgPointFromEvent(svg, moveEvent),
      hue: fingers.current[moveEvent.pointerId].hue,
    };

    onChange({ ...fingers.current });
  }

  function handlePointerEnd(upEvent) {
    delete fingers.current[upEvent.pointerId];

    onChange({ ...fingers.current });

    if (Object.keys(fingers.current).length === 0) {
      removeEventListener('pointermove', handlePointerMove);
      removeEventListener('pointerup', handlePointerEnd);
    }
  }

  return (
    <rect
      ref={rect}
      width="100%"
      height="100%"
      fill="transparent"
      stroke="none"
      style={{ ...FUNCTIONAL_STYLES }}
      touch-action="none"
      onPointerDown={handlePointerDown}
     />
  );
}
