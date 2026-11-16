import { useEffect } from "react";
import ReactGA from "react-ga4";
import { useLocation } from "react-router-dom";

// ... (keep existing code)


const MEASUREMENT_ID = "G-5NR0W3DTHW";


/**
 * Initialize Google Analytics 4
 */
export const initGA = () => {
    ReactGA.initialize(MEASUREMENT_ID, {
        testMode: false, // Enable data sending even in development for verification
    });
    console.log("GA4 Initialized");
};

/**
 * Log a Page View Event
 * @param {string} path - The current path (e.g. /home)
 */
export const logPageView = (path) => {
    ReactGA.send({ hitType: "pageview", page: path });
};

/**
 * Log a Custom Event
 * @param {string} category - The event category (e.g. 'User Interaction')
 * @param {string} action - The action taking place (e.g. 'Button Click')
 * @param {string} label - Optional label for extra detail
 */
export const logEvent = (category, action, label) => {
    ReactGA.event({
        category,
        action,
        label,
    });
};

/**
 * Hook to track general user activity (Clicks, Scroll, etc.)
 */
const useUserActivityTracking = () => {
    useEffect(() => {
        // --- CLICK TRACKING ---
        const handleClick = (e) => {
            const target = e.target.closest("a, button, [role='button']");
            if (!target) return;

            const isLink = target.tagName === "A";
            const label = target.getAttribute("aria-label") || target.innerText || target.id || "Unknown Element";

            if (isLink) {
                const href = target.getAttribute("href");
                if (!href) return;

                // File Download Tracking
                const fileTypes = [".pdf", ".zip", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".gif"];
                if (fileTypes.some((ext) => href.toLowerCase().endsWith(ext))) {
                    logEvent("File Download", "Download", href);
                    return;
                }

                // Outbound Link Tracking
                if (href.startsWith("http") && !href.includes(window.location.hostname)) {
                    logEvent("Outbound Link", "Click", href);
                    return;
                }

                logEvent("Link Click", "Click", label);
            } else {
                logEvent("UI Interaction", "Click", label);
            }
        };

        // --- SCROLL TRACKING ---
        let maxScroll = 0;
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.offsetHeight;
            const winHeight = window.innerHeight;
            const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

            const milestones = [25, 50, 75, 90];
            milestones.forEach((milestone) => {
                if (scrollPercent >= milestone && maxScroll < milestone) {
                    maxScroll = milestone;
                    logEvent("Scroll Depth", "Scroll", `${milestone}%`);
                }
            });
        };

        // Throttled scroll listener
        let timeout;
        const throttledScroll = () => {
            if (timeout) return;
            timeout = setTimeout(() => {
                handleScroll();
                timeout = null;
            }, 1000);
        };

        window.addEventListener("click", handleClick, true); // Capture phase
        window.addEventListener("scroll", throttledScroll);

        return () => {
            window.removeEventListener("click", handleClick, true);
            window.removeEventListener("scroll", throttledScroll);
        };
    }, []);
};

/**
 * Component to listen for route changes and user activity
 */
export const AnalyticsListener = () => {
    const location = useLocation();

    // Track Page Views on route change
    useEffect(() => {
        logPageView(location.pathname + location.search);
    }, [location]);

    // Track detailed user activity
    useUserActivityTracking();

    return null;
};

const gaUtils = { initGA, logPageView, logEvent, AnalyticsListener };
export default gaUtils;
