import React from "react";
import Spreadsheet from "react-spreadsheet";
import './spreadsheet.application.scss';

function SpreadsheetApp() {
	const data = () => {
		var data = [];
		for (let i = 0; i < 100; i++) {
			data.push([
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
				{ value: "" },
			]);
		}
		return data;
	};
	return (
		<div className="spreadsheet-app-container">
			<div className="spreadsheet-toolbar">
				<button className="toolbar-btn">Copy</button>
				<button className="toolbar-btn">Paste</button>
				<button className="toolbar-btn">Format</button>
				<button className="toolbar-btn">Insert</button>
				<button className="toolbar-btn">Delete</button>
			</div>
			<div className="spreadsheet-grid">
				<Spreadsheet data={data()} />
			</div>
		</div>
	);
}

export default SpreadsheetApp;
