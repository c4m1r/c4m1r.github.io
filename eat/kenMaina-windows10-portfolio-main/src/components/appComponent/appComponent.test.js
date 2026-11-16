import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppComponent from './appComponent';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

// Mock redux store
const mockStore = createStore(() => ({}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {
        return null;
    }
    unobserve() {
        return null;
    }
    disconnect() {
        return null;
    }
};

// Mock props
const mockAppInfo = {
    id: 'testApp',
    name: 'Test App',
    icon: 'test-icon',
    subComponent: [
        { name: 'Page 1', component: () => <div>Page 1 Content</div> },
        { name: 'Page 2', component: () => <div>Page 2 Content</div> },
        { name: 'Page 3', component: () => <div>Page 3 Content</div> },
    ],
    isApplication: false,
    showLinks: true,
};

describe('AppComponent Navigation', () => {
    test('navigates forward and backward when arrows are clicked', async () => {
        render(
            <Provider store={mockStore}>
                <AppComponent appInfo={mockAppInfo} />
            </Provider>
        );

        // Initial state: Page 1 should be active (index 0)
        // Back arrow should be disabled
        const backButton = screen.getByTitle('Back');
        const forwardButton = screen.getByTitle('Forward');

        expect(backButton).toBeDisabled();
        expect(forwardButton).not.toBeDisabled();

        // Determine initial active state check
        // Since UIkit switcher might not work fully in jsdom without full layout, 
        // we verify by checking if the state update logic for arrows works.

        // Click Forward
        fireEvent.click(forwardButton);

        // Expect Back button to be enabled now (index 1)
        expect(backButton).not.toBeDisabled();

        // Click Forward again
        fireEvent.click(forwardButton);

        // Expect Forward button to be disabled now (index 2, last item)
        expect(forwardButton).toBeDisabled();

        // Click Back
        fireEvent.click(backButton);

        // Expect Forward button to be enabled again
        expect(forwardButton).not.toBeDisabled();
    });
});
