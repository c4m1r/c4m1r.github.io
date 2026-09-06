import React, { useState } from "react";
import './chrome.application.scss';

function Chrome() {
	const [urlToShow, seturlToShow] = useState("https://www.google.com/");
	const [url, seturl] = useState("https://www.google.com/webhp?igu=1");

	const onURLChange = (event) => {
		const target = event.target;
		seturlToShow(target.value);
	};

	const onGO = () => {
		seturl(urlToShow);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			onGO();
		}
	};

	return (
		<div className="chrome-app-container">
			{/* Browser Chrome */}
			<div className="chrome-browser-bar">
				<button className="chrome-nav-btn chrome-back" title="Back">◀</button>
				<button className="chrome-nav-btn chrome-forward" title="Forward">▶</button>
				<button className="chrome-nav-btn chrome-reload" title="Reload" onClick={() => seturl(url)}>↻</button>
				<input
					type="text"
					className="chrome-address-bar"
					placeholder="Type a URL"
					value={urlToShow}
					onChange={onURLChange}
					onKeyDown={handleKeyDown}
				/>
				<button className="chrome-nav-btn" title="Go" onClick={onGO}>➜</button>
				<button className="chrome-menu-btn" title="Menu">⋯</button>
			</div>

			{/* Web Content */}
			<div className="chrome-content" style={{ padding: 0, overflow: 'hidden' }}>
				<iframe
					src={url}
					frameBorder="0"
					height="100%"
					width="100%"
					title="Chrome"
				></iframe>
			</div>
		</div>
	);
}

export default Chrome;
