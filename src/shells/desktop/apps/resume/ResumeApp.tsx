/**
 * shells/desktop/apps/resume/ResumeApp.tsx
 *
 * Desktop shell wrapper for the Resume/CV app.
 * Re-exports MyCV with no OS-specific logic — visual theming
 * is handled entirely by CSS wrappers (winxp.css / win7.css / ubuntu.css).
 *
 * Do NOT create WinXpResumeApp / Win7ResumeApp / UbuntuResumeApp.
 */
export { MyCV as ResumeApp } from '../../../../apps/mycv/MyCV';
