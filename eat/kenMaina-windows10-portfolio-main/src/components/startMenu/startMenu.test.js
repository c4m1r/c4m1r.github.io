import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StartMenu from './startMenu';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

// Mock redux store with initial app state
const createMockStore = (apps = []) => createStore(() => ({
    appState: {
        apps: apps
    },
    settingsState: {}
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
};

// Mock UIkit
global.UIkit = {
    offcanvas: jest.fn(() => ({
        hide: jest.fn()
    }))
};

// Mock Firebase
jest.mock('../../utils/firebaseConfig', () => ({
    analytics: null
}));

// Mock user config
jest.mock('../../utils/data/user.config', () => ({
    firstName: 'Test',
    userImage: 'test-image.png'
}));

// Mock project config
jest.mock('../../utils/data/project.config', () => ({
    enableAnalytics: false
}));

describe('StartMenu Component', () => {
    const mockApps = [
        { id: 'app1', name: 'Test App 1', icon: 'icon1.png' },
        { id: 'app2', name: 'Test App 2', icon: 'icon2.png' }
    ];

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders app list from redux state', () => {
        const store = createMockStore(mockApps);
        render(
            <Provider store={store}>
                <StartMenu />
            </Provider>
        );

        expect(screen.getByText('Test App 1')).toBeInTheDocument();
        expect(screen.getByText('Test App 2')).toBeInTheDocument();
    });

    test('clicking an app dispatches APP_CLICK action', () => {
        const store = createMockStore(mockApps);
        const dispatchSpy = jest.spyOn(store, 'dispatch');

        render(
            <Provider store={store}>
                <StartMenu />
            </Provider>
        );

        const appItem = screen.getByText('Test App 1');
        fireEvent.click(appItem);

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'Application_Click',
                app: expect.objectContaining({ id: 'app1' })
            })
        );
    });

    test('Start Menu adds closing class when app is clicked', () => {
        const store = createMockStore(mockApps);
        render(
            <Provider store={store}>
                <StartMenu />
            </Provider>
        );

        // Simulate Start Menu being open
        const startMenu = document.getElementById('start-menu');
        startMenu.classList.add('uk-open');

        const appItem = screen.getByText('Test App 1');
        fireEvent.click(appItem);

        // Check closing class is added
        expect(startMenu.classList.contains('closing')).toBe(true);
    });

    test('Start Menu calls UIkit.offcanvas.hide after animation delay', async () => {
        const store = createMockStore(mockApps);
        render(
            <Provider store={store}>
                <StartMenu />
            </Provider>
        );

        // Simulate Start Menu being open
        const startMenu = document.getElementById('start-menu');
        startMenu.classList.add('uk-open');

        const appItem = screen.getByText('Test App 1');
        fireEvent.click(appItem);

        // Fast-forward past animation delay
        jest.advanceTimersByTime(200);

        // Check UIkit hide was called
        expect(global.UIkit.offcanvas).toHaveBeenCalledWith(startMenu);
    });

    test('closing class is removed after animation completes', () => {
        const store = createMockStore(mockApps);
        render(
            <Provider store={store}>
                <StartMenu />
            </Provider>
        );

        const startMenu = document.getElementById('start-menu');
        startMenu.classList.add('uk-open');

        const appItem = screen.getByText('Test App 1');
        fireEvent.click(appItem);

        // Fast-forward past animation delay
        jest.advanceTimersByTime(200);

        // Closing class should be removed
        expect(startMenu.classList.contains('closing')).toBe(false);
    });
});
