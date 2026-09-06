import { lazy } from 'react';

const AppRegistry = {
    // About Me Components
    AboutMe: lazy(() => import('../applications/about/aboutMe.about')),
    Experience: lazy(() => import('../applications/about/experience.about')),
    Education: lazy(() => import('../applications/about/education.about')),
    Projects: lazy(() => import('../applications/about/projects.about')),
    Skills: lazy(() => import('../applications/about/skills.about')),
    Resume: lazy(() => import('../applications/about/resume.about')),
    ContactMe: lazy(() => import('../applications/about/contactMe.about')),

    // Applications
    VSCode: lazy(() => import('../applications/vscode.application')),
    JIOSaavn: lazy(() => import('../applications/jiosaavn.application')),
    Mail: lazy(() => import('../applications/mail.application')),
    Chrome: lazy(() => import('../applications/chrome.application')),
    Word: lazy(() => import('../applications/document.application')),
    Spreadsheet: lazy(() => import('../applications/spreadsheet.application')),

    // Settings
    BackgroundSettings: lazy(() => import('../applications/settings/background.settings')),
};

export default AppRegistry;
