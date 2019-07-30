import React from 'react';
import posed, { PoseGroup } from 'react-pose';

const FingerGroup = posed.g({});

const FingerCircle = posed.circle({
	enter: { r: ({ winner, loser }) => winner ? 90 : loser ? 50 : 70 },
	exit: { r: 0 },
});

const GROUP_STYLE = {
	transition: 'transform 250ms cubic-bezier(0, 0, 0.5, 2)',
};

export default function Finger({
	x,
	y,
	hue,
	winner,
	loser
}) {
	return (
		<PoseGroup animateOnMount={true}>
			<FingerGroup key={0} transform={`translate(${x}, ${y})`} xstyle={GROUP_STYLE}>
				<FingerCircle
					{...{winner, loser}}
					fill={`hsla(${hue}, 50%, 50%, ${winner ? 1 : 0.8})`}
					stroke="none"
				/>
			</FingerGroup>
		</PoseGroup>
	);
}
