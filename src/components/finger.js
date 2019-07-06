import React from 'react';

export default function Finger({
  x,
  y,
  hue,
  winner,
  loser
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle
        r={winner ? 90 : loser ? 50 : 70}
        fill={`hsla(${hue}, 50%, 50%, ${winner ? 1 : 0.8})`}
        stroke="none"
      />
    </g>
  );
}
