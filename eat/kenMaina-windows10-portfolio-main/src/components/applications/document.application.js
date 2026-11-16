import React from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import './document.application.scss';

function Word() {
	const { quillRef } = useQuill({
		modules: {
			toolbar: false // We'll use our custom toolbar or just hide it for the unified look if preferred, but for now let's keep it simple or use the one from the guide.
			// Actually, the guide shows a custom toolbar structure. Let's implement that structure and maybe just let Quill handle the content area.
		}
	});

	return (
		<div className="document-app-container">
			<div className="doc-toolbar">
				<div className="tool-group">
					<button title="Bold"><b>B</b></button>
					<button title="Italic"><i>I</i></button>
					<button title="Underline"><u>U</u></button>
				</div>
				<div className="tool-group">
					<button title="Align Left">⇤</button>
					<button title="Align Center">↔</button>
					<button title="Align Right">⇥</button>
				</div>
			</div>
			<div className="document-content">
				<div ref={quillRef} style={{ height: '100%', border: 'none' }} />
			</div>
		</div>
	);
}

export default Word;
