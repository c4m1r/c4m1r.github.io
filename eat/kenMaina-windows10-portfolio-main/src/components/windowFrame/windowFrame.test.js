import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import WindowFrame from './windowFrame';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
};

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 });
Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

describe('WindowFrame Component', () => {
    const mockAppInfo = {
        id: 'testApp',
        name: 'Test Application',
        icon: 'test-icon.png',
        isOpened: true,
        isMinimized: false,
        isMaximized: false
    };

    const mockFunctionClick = jest.fn();

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders window with correct title', () => {
        render(
            <WindowFrame appInfo={mockAppInfo} onFunctionClick={mockFunctionClick}>
                <div>Test Content</div>
            </WindowFrame>
        );

        expect(screen.getByText('Test Application')).toBeInTheDocument();
    });

    test('has launching animation class on mount', () => {
        const { container } = render(
            <WindowFrame appInfo={mockAppInfo} onFunctionClick={mockFunctionClick}>
                <div>Test Content</div>
            </WindowFrame>
        );

        const frame = container.querySelector('.window-frame');
        expect(frame).toHaveClass('launching');
    });

    test('launching class is cleared after animation duration', async () => {
        const { container } = render(
            <WindowFrame appInfo={mockAppInfo} onFunctionClick={mockFunctionClick}>
                <div>Test Content</div>
            </WindowFrame>
        );

        const frame = container.querySelector('.window-frame');
        expect(frame).toHaveClass('launching');

        // Fast-forward past animation duration
        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(frame).not.toHaveClass('launching');
    });

    test('applies restoring class when un-minimizing', () => {
        const { container, rerender } = render(
            <WindowFrame
                appInfo={{ ...mockAppInfo, isMinimized: true }}
                onFunctionClick={mockFunctionClick}
            >
                <div>Test Content</div>
            </WindowFrame>
        );

        // Clear initial launching animation
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // Rerender with isMinimized = false (restoring)
        rerender(
            <WindowFrame
                appInfo={{ ...mockAppInfo, isMinimized: false }}
                onFunctionClick={mockFunctionClick}
            >
                <div>Test Content</div>
            </WindowFrame>
        );

        const frame = container.querySelector('.window-frame');
        expect(frame).toHaveClass('restoring');
    });

    test('applies maximized class when maximized', () => {
        const { container } = render(
            <WindowFrame
                appInfo={{ ...mockAppInfo, isMaximized: true }}
                onFunctionClick={mockFunctionClick}
            >
                <div>Test Content</div>
            </WindowFrame>
        );

        const frame = container.querySelector('.window-frame');
        expect(frame).toHaveClass('maximized');
    });

    test('has control buttons (minimize, maximize, close)', () => {
        render(
            <WindowFrame appInfo={mockAppInfo} onFunctionClick={mockFunctionClick}>
                <div>Test Content</div>
            </WindowFrame>
        );

        expect(screen.getByTitle('Minimize')).toBeInTheDocument();
        expect(screen.getByTitle('Maximize')).toBeInTheDocument();
        expect(screen.getByTitle('Close')).toBeInTheDocument();
    });

    test('centers window on initial render', () => {
        const { container } = render(
            <WindowFrame appInfo={mockAppInfo} onFunctionClick={mockFunctionClick}>
                <div>Test Content</div>
            </WindowFrame>
        );

        const frame = container.querySelector('.window-frame');
        const transform = frame.style.transform;

        // Should have some translate value (not 0,0 since it's centered)
        expect(transform).toMatch(/translate\(\d+px, \d+px\)/);
    });
});
