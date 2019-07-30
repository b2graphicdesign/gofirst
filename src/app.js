import React, { useCallback, useEffect, useRef, useState } from 'react';
import FingerTrackingRect from './components/finger-tracking-rect';
import Finger from './components/finger';
import useInterval from '@use-it/interval';

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

export default function App() {
	const previousFingers = useRef({});
	const [fingers, setFingers] = useState({});
	const [elapsed, setElapsed] = useState(0);
	const [completionState, setCompletionState] = useState(null);

	const fingerIds = Object.keys(fingers);

	useEffect(() => {
		setElapsed(0);

		if (!completionState && fingerIds.length !== 0) {
			vibrate([25]);
		}
	}, [fingerIds.join()]);

	useInterval(() => {
		if (elapsed === TICKS_TO_DECIDE) {
			vibrate([50, 50, 50, 50, 100]);
		} else if (elapsed + 1 === TICKS_TO_WAIT + TICKS_TO_DECIDE) {
			vibrate([100, 50, 50, 50, 50, 50, 300]);

			const winner = fingerIds[Math.floor(Math.random() * fingerIds.length)];
			setCompletionState({ fingers, winner });
		}

		setElapsed(elapsed + 1);
	}, fingerIds.length < 1 || completionState ? null : TICK_DURATION);

	const fingersToRender = completionState ? completionState.fingers : fingers;

	const handleFingersChange = useCallback(newFingers => {
		if (Object.keys(previousFingers.current).length === 0) {
			setCompletionState(null);
		}
		setFingers(newFingers);
		previousFingers.current = newFingers;
	});

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
				) : '?'}
			</h1>

			<svg
				style={{
					height: '100%',
					left: 0,
					outline: '1px solid gray',
					position: 'fixed',
					top: 0,
					width: '100%',
				}}
			>
				{completionState && <rect
					width="100%"
					height="100%"
					fill={`hsla(${completionState.fingers[completionState.winner].hue}, 50%, 50%, 0.5)`}
				/>}

				{Object.entries(fingersToRender).map(([fingerId, { x, y, hue }]) => (
					<Finger
						key={fingerId}
						{...{ x, y, hue }}
						winner={completionState && completionState.winner === fingerId}
						loser={completionState && completionState.winner !== fingerId}
					/>
				))}

				<FingerTrackingRect onChange={handleFingersChange} />
			</svg>

			<pre>{JSON.stringify({ elapsed, fingers, completionState }, null, 2)}</pre>
		</React.Fragment>
	);
}
