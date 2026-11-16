/**
 * Suppress benign ResizeObserver errors
 * These errors occur when ResizeObserver can't deliver all notifications
 * in a single animation frame - they are harmless and don't affect functionality.
 */

const resizeObserverPatterns = [
    /ResizeObserver loop completed with undelivered notifications/,
    /ResizeObserver loop limit exceeded/
];

function isResizeObserverError(message) {
    if (!message) return false;
    const str = message.toString();
    return resizeObserverPatterns.some(pattern => pattern.test(str));
}

// IMMEDIATELY inject CSS to hide the overlay before it can render
(function injectOverlayHidingCSS() {
    const style = document.createElement('style');
    style.id = 'suppress-resize-observer-overlay';
    style.textContent = `
        /* Hide webpack dev server overlay by default - will be shown only for real errors */
        #webpack-dev-server-client-overlay,
        #webpack-dev-server-client-overlay-div,
        iframe[src*="webpack-dev-server"] {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
    `;
    // Insert at the very beginning of head or document
    if (document.head) {
        document.head.insertBefore(style, document.head.firstChild);
    } else if (document.documentElement) {
        document.documentElement.insertBefore(style, document.documentElement.firstChild);
    } else {
        // Fallback: wait for head
        document.addEventListener('DOMContentLoaded', () => {
            document.head.insertBefore(style, document.head.firstChild);
        });
    }
})();

// 1. Suppress console errors
const originalConsoleError = console.error;
console.error = (...args) => {
    if (isResizeObserverError(args[0])) return;
    originalConsoleError.apply(console, args);
};

// 2. Suppress global error events (prevents React overlay trigger)
window.addEventListener('error', (event) => {
    if (isResizeObserverError(event.message) || isResizeObserverError(event.error?.message)) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return true;
    }
}, { capture: true });

// 3. Suppress unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    if (isResizeObserverError(event.reason?.message) || isResizeObserverError(event.reason)) {
        event.preventDefault();
        return true;
    }
}, { capture: true });

// 4. Patch window.reportError if it exists (used by some React versions)
if (typeof window.reportError === 'function') {
    const originalReportError = window.reportError;
    window.reportError = (error) => {
        if (isResizeObserverError(error?.message) || isResizeObserverError(error)) {
            return;
        }
        originalReportError.call(window, error);
    };
}

// 5. Monitor for overlay and show it ONLY if it contains a real error (not ResizeObserver)
const monitorOverlay = () => {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) {
                    const isOverlay =
                        node.id === 'webpack-dev-server-client-overlay' ||
                        node.id === 'webpack-dev-server-client-overlay-div' ||
                        (node.tagName === 'IFRAME' && node.src?.includes?.('webpack-dev-server'));

                    if (isOverlay) {
                        // Check content after a brief delay
                        setTimeout(() => {
                            try {
                                let text = '';
                                if (node.tagName === 'IFRAME') {
                                    const doc = node.contentDocument || node.contentWindow?.document;
                                    text = doc?.body?.innerText || '';
                                } else {
                                    text = node.innerText || node.textContent || '';
                                }

                                // If it's NOT a ResizeObserver error, show the overlay
                                if (text && !isResizeObserverError(text)) {
                                    node.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;';
                                } else {
                                    // It's a ResizeObserver error - remove it completely
                                    node.remove();
                                }
                            } catch (e) {
                                // Cross-origin or other error - keep it hidden
                                node.remove();
                            }
                        }, 10);
                    }
                }
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
};

// Start monitoring immediately
if (document.documentElement) {
    monitorOverlay();
} else {
    document.addEventListener('DOMContentLoaded', monitorOverlay);
}
