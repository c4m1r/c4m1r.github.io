import React from "react";
import './vscode.application.scss';

function VSCode() {
	return (
		<div className="vscode-app-container">
			<div className="vs-sidebar">
				<div className="sidebar-section">
					<div className="sidebar-item active">Explorer</div>
					<div className="sidebar-item">Search</div>
					<div className="sidebar-item">Source Control</div>
					<div className="sidebar-item">Run</div>
					<div className="sidebar-item">Extensions</div>
				</div>
			</div>
			<div className="vs-main">
				<div className="editor-tabs">
					<button className="editor-tab active">App.js</button>
				</div>
				<div className="editor-content" style={{ padding: 0, overflow: 'hidden' }}>
					<iframe
						src="https://github1s.com/arnoldadero/win10_portfolio/blob/master/src/App.js"
						frameBorder="0"
						height="100%"
						width="100%"
						title="VSCode"
					></iframe>
				</div>
			</div>
		</div>
	);
}

export default VSCode;
