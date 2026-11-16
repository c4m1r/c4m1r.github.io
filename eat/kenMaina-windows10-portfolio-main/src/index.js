import React from "react";
import { createRoot } from "react-dom/client";
// IMPORT ERROR SUPPRESSION FIRST - before any UI libraries
import "./suppressResizeObserverError";

import "./index.scss";
import "./theme/style.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "uikit/dist/css/uikit.min.css";
import "uikit/dist/css/uikit-core.min.css";
import "uikit/dist/js/uikit.min.js";
import "uikit/dist/js/uikit-icons.min";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import * as serviceWorker from "./serviceWorker";
import "react-resizable/css/styles.css";
import { Provider } from "react-redux";
import store from "./utils/store";


import { BrowserRouter } from "react-router-dom";
import { initGA } from "./analytics/ga";

initializeIcons();
initGA(); // Initialize Google Analytics

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</Provider>
	</React.StrictMode>
);

serviceWorker.unregister();
reportWebVitals();
