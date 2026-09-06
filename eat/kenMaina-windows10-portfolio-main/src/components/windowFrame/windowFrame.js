import React, { useState, useRef, useEffect, useCallback } from "react";
import { IconButton } from "@fluentui/react";
import { ACTION_TYPES } from "../../utils/documents/enums";
import "./windowFrame.scss";
import LazyImage from "../base/lazyImage";

// Constants
const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const RESIZE_BORDER = 6;
const SNAP_THRESHOLD = 20;
const MOBILE_BREAKPOINT = 640;

export default function WindowFrame({ children, appInfo, onFunctionClick }) {
    const frameRef = useRef(null);
    const snapPreviewRef = useRef(null);

    // Viewport detection
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

    // Load initial state from localStorage with mobile centering
    const getInitialState = useCallback(() => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // On mobile, always start maximized
        if (windowWidth <= MOBILE_BREAKPOINT) {
            return {
                size: { width: windowWidth, height: windowHeight - 48 },
                position: { x: 0, y: 0 }
            };
        }

        const saved = localStorage.getItem(`windowState_${appInfo.id}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse window state", e);
            }
        }

        // Set size (responsive)
        const width = Math.min(windowWidth * 0.9, 900);
        const height = Math.min(windowHeight * 0.8, 720);

        // Calculate position (centered)
        const posX = Math.max(0, (windowWidth - width) / 2);
        const posY = Math.max(0, (windowHeight - height) / 2);

        return {
            size: { width, height },
            position: { x: posX, y: posY }
        };
    }, [appInfo.id]);

    const initialState = getInitialState();
    const [size, setSize] = useState(initialState.size);
    const [position, setPosition] = useState(initialState.position);

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDir, setResizeDir] = useState(null);

    const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = useState(null);
    const [startPos, setStartPos] = useState(null);

    // Snap state
    const [snapPosition, setSnapPosition] = useState(null); // 'left', 'right', null
    const [snapPreview, setSnapPreview] = useState(null); // 'left', 'right', 'maximize', null
    const [preSnapState, setPreSnapState] = useState(null); // Store state before snap

    // Animation state tracking
    const [animationClass, setAnimationClass] = useState('launching');
    const prevMinimizedRef = useRef(appInfo.isMinimized);
    const isFirstRender = useRef(true);

    // Track minimize/restore state changes for animations
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const wasMinimized = prevMinimizedRef.current;
        const isNowMinimized = appInfo.isMinimized;

        if (wasMinimized !== isNowMinimized) {
            if (isNowMinimized) {
                // Minimizing - will be hidden by parent after animation
                setAnimationClass('minimizing');
            } else {
                // Restoring from minimized
                setAnimationClass('restoring');
                // Clear animation class after it completes
                setTimeout(() => setAnimationClass(''), 280);
            }
        }

        prevMinimizedRef.current = isNowMinimized;
    }, [appInfo.isMinimized]);

    // --------------------------------------------------------
    // Viewport resize handler for mobile detection
    // --------------------------------------------------------
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
            setIsMobile(mobile);

            // Auto-maximize on mobile
            if (mobile && !appInfo.isMaximized) {
                onFunctionClick(appInfo, ACTION_TYPES.MAXIMIZE);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [appInfo, onFunctionClick]);

    // Save state to localStorage on change (debounced or on stop)
    useEffect(() => {
        if (!isDragging && !isResizing && !isMobile) {
            localStorage.setItem(`windowState_${appInfo.id}`, JSON.stringify({ size, position }));
        }
    }, [size, position, isDragging, isResizing, appInfo.id, isMobile]);

    // ----------------------------------------------
    // 🔥 1. Detect which resize zone cursor is over
    // ----------------------------------------------
    const getResizeDirection = (e) => {
        if (appInfo.isMaximized || isMobile) return null;
        const rect = frameRef.current.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        const left = x - rect.left < RESIZE_BORDER;
        const right = rect.right - x < RESIZE_BORDER;
        const top = y - rect.top < RESIZE_BORDER;
        const bottom = rect.bottom - y < RESIZE_BORDER;

        if (top && left) return "nw";
        if (top && right) return "ne";
        if (bottom && left) return "sw";
        if (bottom && right) return "se";
        if (left) return "w";
        if (right) return "e";
        if (top) return "n";
        if (bottom) return "s";

        return null;
    };

    // ----------------------------------------------
    // 🧲 2. Update cursor when hovering borders
    // ----------------------------------------------
    const handleMouseMove = (e) => {
        if (isResizing || appInfo.isMaximized || isMobile) return;

        const dir = getResizeDirection(e);
        if (frameRef.current) {
            frameRef.current.style.cursor = dir ? `${dir}-resize` : "default";
        }
    };

    // ----------------------------------------------
    // 🔧 3. Start Resize
    // ----------------------------------------------
    const handleMouseDown = (e) => {
        if (appInfo.isMaximized || isMobile) return;
        const dir = getResizeDirection(e);
        if (!dir) return;

        setIsResizing(true);
        setResizeDir(dir);
        setMouseStart({ x: e.clientX, y: e.clientY });
        setStartSize(size);
        setStartPos(position);
        e.preventDefault();
    };

    // ----------------------------------------------
    // 🔧 4. Perform Resize
    // ----------------------------------------------
    const handleWindowMouseMove = useCallback((e) => {
        if (!isResizing) return;

        const dx = e.clientX - mouseStart.x;
        const dy = e.clientY - mouseStart.y;

        let newWidth = startSize.width;
        let newHeight = startSize.height;
        let newX = startPos.x;
        let newY = startPos.y;

        if (resizeDir.includes("e")) newWidth = startSize.width + dx;
        if (resizeDir.includes("s")) newHeight = startSize.height + dy;
        if (resizeDir.includes("w")) {
            newWidth = startSize.width - dx;
            newX = startPos.x + dx;
        }
        if (resizeDir.includes("n")) {
            newHeight = startSize.height - dy;
            newY = startPos.y + dy;
        }

        // Boundaries - enforce minimum size only
        newWidth = Math.max(MIN_WIDTH, newWidth);
        newHeight = Math.max(MIN_HEIGHT, newHeight);

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
    }, [isResizing, mouseStart, startSize, startPos, resizeDir]);

    // ----------------------------------------------
    // 🔧 5. Stop Resize
    // ----------------------------------------------
    const stopResize = useCallback(() => {
        setIsResizing(false);
        setResizeDir(null);
    }, []);

    // ----------------------------------------------
    // 🎯 Snap Detection
    // ----------------------------------------------
    const detectSnapZone = useCallback((x, y) => {
        const screenWidth = window.innerWidth;

        // Top edge - maximize
        if (y <= SNAP_THRESHOLD) {
            return 'maximize';
        }
        // Left edge - snap left
        if (x <= SNAP_THRESHOLD) {
            return 'left';
        }
        // Right edge - snap right
        if (x >= screenWidth - SNAP_THRESHOLD) {
            return 'right';
        }

        return null;
    }, []);

    const applySnap = useCallback((zone) => {
        if (!zone) return;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const taskbarHeight = 48;

        // Store pre-snap state
        if (!preSnapState) {
            setPreSnapState({ size, position });
        }

        if (zone === 'maximize') {
            onFunctionClick(appInfo, ACTION_TYPES.MAXIMIZE);
        } else if (zone === 'left') {
            setSnapPosition('left');
            setSize({ width: screenWidth / 2, height: screenHeight - taskbarHeight });
            setPosition({ x: 0, y: 0 });
        } else if (zone === 'right') {
            setSnapPosition('right');
            setSize({ width: screenWidth / 2, height: screenHeight - taskbarHeight });
            setPosition({ x: screenWidth / 2, y: 0 });
        }
    }, [size, position, preSnapState, appInfo, onFunctionClick]);

    const unsnap = useCallback(() => {
        if (preSnapState) {
            setSize(preSnapState.size);
            setPosition(preSnapState.position);
            setPreSnapState(null);
        }
        setSnapPosition(null);
    }, [preSnapState]);

    // ----------------------------------------------
    // 🖱️ Dragging via title bar
    // ----------------------------------------------
    const startDrag = (e) => {
        if (isResizing || isMobile) return;

        // Prevent drag if clicking on buttons
        if (e.target.closest('button')) return;

        // If maximized, unmaximize and center cursor on window
        if (appInfo.isMaximized) {
            onFunctionClick(appInfo, ACTION_TYPES.MAXIMIZE);
            const newWidth = Math.min(window.innerWidth * 0.6, 800);
            const newX = e.clientX - newWidth / 2;
            setSize({ width: newWidth, height: window.innerHeight * 0.7 });
            setPosition({ x: Math.max(0, newX), y: e.clientY - 20 });
        }

        // If snapped, unsnap
        if (snapPosition) {
            unsnap();
        }

        setIsDragging(true);
        setMouseStart({ x: e.clientX, y: e.clientY });
        setStartPos(position);
        frameRef.current?.classList.add('dragging');
    };

    const dragMove = useCallback((e) => {
        if (!isDragging) return;

        const dx = e.clientX - mouseStart.x;
        const dy = e.clientY - mouseStart.y;

        const newX = startPos.x + dx;
        const newY = startPos.y + dy;

        setPosition({ x: newX, y: newY });

        // Check for snap zones and show preview
        const zone = detectSnapZone(e.clientX, e.clientY);
        setSnapPreview(zone);
    }, [isDragging, mouseStart, startPos, detectSnapZone]);

    const stopDrag = useCallback(() => {
        if (isDragging) {
            // Apply snap if in a snap zone
            if (snapPreview) {
                applySnap(snapPreview);
            }
            setSnapPreview(null);
        }
        setIsDragging(false);
        frameRef.current?.classList.remove('dragging');
    }, [isDragging, snapPreview, applySnap]);

    // ----------------------------------------------
    // ⌨️ Keyboard Accessibility + Snap Shortcuts
    // ----------------------------------------------
    const handleKeyDown = (e) => {
        const step = 10;
        const shift = e.shiftKey;
        const meta = e.metaKey || e.ctrlKey; // Windows key or Ctrl

        // Snap shortcuts (Win/Ctrl + Arrow)
        if (meta && !isMobile) {
            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault();
                    if (snapPosition === 'right') {
                        unsnap();
                    } else if (!snapPosition && !appInfo.isMaximized) {
                        applySnap('left');
                    } else if (appInfo.isMaximized) {
                        onFunctionClick(appInfo, ACTION_TYPES.MAXIMIZE);
                        applySnap('left');
                    }
                    return;
                case "ArrowRight":
                    e.preventDefault();
                    if (snapPosition === 'left') {
                        unsnap();
                    } else if (!snapPosition && !appInfo.isMaximized) {
                        applySnap('right');
                    } else if (appInfo.isMaximized) {
                        onFunctionClick(appInfo, ACTION_TYPES.MAXIMIZE);
                        applySnap('right');
                    }
                    return;
                case "ArrowUp":
                    e.preventDefault();
                    if (!appInfo.isMaximized) {
                        onFunctionClick(appInfo, ACTION_TYPES.MAXIMIZE);
                    }
                    return;
                case "ArrowDown":
                    e.preventDefault();
                    if (appInfo.isMaximized) {
                        onFunctionClick(appInfo, ACTION_TYPES.MAXIMIZE);
                    } else if (snapPosition) {
                        unsnap();
                    } else {
                        onFunctionClick(appInfo, ACTION_TYPES.MINIMIZE);
                    }
                    return;
                default:
                    break;
            }
        }

        if (appInfo.isMaximized || isMobile) return;

        switch (e.key) {
            case "ArrowRight":
                if (shift) setSize(prev => ({ ...prev, width: Math.min(prev.width + step, window.innerWidth - position.x) }));
                else setPosition(prev => ({ ...prev, x: Math.min(prev.x + step, window.innerWidth - size.width) }));
                break;
            case "ArrowLeft":
                if (shift) setSize(prev => ({ ...prev, width: Math.max(prev.width - step, MIN_WIDTH) }));
                else setPosition(prev => ({ ...prev, x: Math.max(prev.x - step, 0) }));
                break;
            case "ArrowDown":
                if (shift) setSize(prev => ({ ...prev, height: Math.min(prev.height + step, window.innerHeight - position.y) }));
                else setPosition(prev => ({ ...prev, y: Math.min(prev.y + step, window.innerHeight - size.height) }));
                break;
            case "ArrowUp":
                if (shift) setSize(prev => ({ ...prev, height: Math.max(prev.height - step, MIN_HEIGHT) }));
                else setPosition(prev => ({ ...prev, y: Math.max(prev.y - step, 0) }));
                break;
            case "Enter":
                onFunctionClick(appInfo, ACTION_TYPES.MAXIMIZE);
                break;
            default:
                return;
        }
        e.preventDefault();
    };

    // Global listeners
    useEffect(() => {
        window.addEventListener("mousemove", handleWindowMouseMove);
        window.addEventListener("mouseup", stopResize);
        window.addEventListener("mousemove", dragMove);
        window.addEventListener("mouseup", stopDrag);
        return () => {
            window.removeEventListener("mousemove", handleWindowMouseMove);
            window.removeEventListener("mouseup", stopResize);
            window.removeEventListener("mousemove", dragMove);
            window.removeEventListener("mouseup", stopDrag);
        };
    }, [handleWindowMouseMove, stopResize, dragMove, stopDrag]);

    // Clear launching animation after it completes
    useEffect(() => {
        if (animationClass === 'launching') {
            const timer = setTimeout(() => setAnimationClass(''), 300);
            return () => clearTimeout(timer);
        }
    }, [animationClass]);

    // Determine container style
    const getContainerStyle = () => {
        if (isMobile || appInfo.isMaximized) {
            return {
                width: "100%",
                height: isMobile ? "calc(100% - 48px)" : "100%",
                transform: "translate(0px, 0px)",
                top: 0,
                left: 0,
                borderRadius: 0
            };
        }

        return {
            width: size.width,
            height: size.height,
            transform: `translate(${position.x}px, ${position.y}px)`
        };
    };

    // Snap preview overlay style
    const getSnapPreviewStyle = () => {
        if (!snapPreview) return null;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const taskbarHeight = 48;

        if (snapPreview === 'left') {
            return {
                left: 0,
                top: 0,
                width: screenWidth / 2,
                height: screenHeight - taskbarHeight
            };
        } else if (snapPreview === 'right') {
            return {
                left: screenWidth / 2,
                top: 0,
                width: screenWidth / 2,
                height: screenHeight - taskbarHeight
            };
        } else if (snapPreview === 'maximize') {
            return {
                left: 0,
                top: 0,
                width: screenWidth,
                height: screenHeight - taskbarHeight
            };
        }

        return null;
    };

    const containerStyle = getContainerStyle();
    const snapPreviewStyle = getSnapPreviewStyle();

    // Build class names
    const frameClasses = [
        'window-frame',
        appInfo.isMaximized && 'maximized',
        isMobile && 'mobile',
        snapPosition && `snapped-${snapPosition}`,
        animationClass
    ].filter(Boolean).join(' ');

    return (
        <>
            {/* Snap Preview Overlay */}
            {snapPreview && (
                <div
                    className="snap-preview"
                    ref={snapPreviewRef}
                    style={snapPreviewStyle}
                />
            )}

            <div
                className={frameClasses}
                ref={frameRef}
                style={containerStyle}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-label={appInfo.name}
            >
                <div className="title-bar" onMouseDown={startDrag} onDoubleClick={() =>
                    onFunctionClick(appInfo, ACTION_TYPES.MAXIMIZE)
                }>
                    <div className="app-title">
                        <span className="app-icon-name">
                            {appInfo.icon && (
                                <LazyImage
                                    src={appInfo.icon}
                                    alt={appInfo.name}
                                    width="18"
                                    height="18"
                                    className="app-icon"
                                />
                            )}
                            <span className="app-name">{appInfo.name}</span>
                        </span>
                    </div>

                    <div className="app-top-functions">
                        <IconButton
                            className="window-control-btn minimize-btn"
                            iconProps={{ iconName: "ChromeMinimize" }}
                            title="Minimize"
                            ariaLabel="Minimize window"
                            onClick={() => onFunctionClick(appInfo, ACTION_TYPES.MINIMIZE)}
                        />
                        <IconButton
                            className="window-control-btn maximize-btn"
                            iconProps={{ iconName: appInfo.isMaximized ? "ChromeRestore" : "FullScreen" }}
                            title={appInfo.isMaximized ? "Restore" : "Maximize"}
                            ariaLabel={appInfo.isMaximized ? "Restore window" : "Maximize window"}
                            onClick={() => onFunctionClick(appInfo, ACTION_TYPES.MAXIMIZE)}
                        />
                        <IconButton
                            className="window-control-btn close-btn"
                            iconProps={{ iconName: "ChromeClose" }}
                            title="Close"
                            ariaLabel="Close window"
                            onClick={() => onFunctionClick(appInfo, ACTION_TYPES.CLOSE)}
                        />
                    </div>
                </div>

                <div className="window-content">
                    {children}
                </div>
            </div>
        </>
    );
}
