import React from "react";
import './jiosaavn.application.scss';

function JIOSaavn(props) {
	return (
		<div className="jiosaavn-app-container">
			<div className="jiosaavn-content">
				<iframe
					src="https://www.jiosaavn.com/embed/playlist/933503632"
					frameBorder="0"
					height="100%"
					width="100%"
					title="Jio Saavn"
				></iframe>
			</div>
		</div>
	);
}

export default JIOSaavn;
