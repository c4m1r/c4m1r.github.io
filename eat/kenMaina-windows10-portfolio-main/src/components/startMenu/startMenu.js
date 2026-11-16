import { IconButton } from "@fluentui/react";
import { useConst, useBoolean } from "@fluentui/react-hooks";
import React from "react";
import "./startMenu.scss";
import ContextMenu from "../contextMenu/power.contextmenu";
import { useDispatch, useSelector } from "react-redux";
import { setSystemState } from "../../utils/actions/system.action";
import { handleApplicationClick } from "../../utils/actions/app.action";
import user from "../../utils/data/user.config";
import SocialBlock from "../base/socialBlock";
import { analytics } from "../../utils/firebaseConfig";
import { logEvent } from "firebase/analytics";
import { ANALYTICS_EVENTS } from "../../utils/documents/enums";
import projectConfig from "../../utils/data/project.config";
import LazyImage from "../base/lazyImage";

function StartMenu() {
	const [
		showPowerMenu,
		{ setTrue: onShowPowerMenu, setFalse: onHidePowerMenu },
	] = useBoolean(false);

	const dispatch = useDispatch();

	// Close Start Menu immediately (hide first, then clean up)
	const closeStartMenu = (immediate = false) => {
		const startMenuEl = document.getElementById('start-menu');

		if (immediate && startMenuEl) {
			// AGGRESSIVE CLOSE: Immediately hide without waiting for animation or UIkit state

			// 1. Try UIkit API
			if (window.UIkit && window.UIkit.offcanvas) {
				window.UIkit.offcanvas(startMenuEl).hide();
			}

			// 2. Force remove specific classes that keep it open
			startMenuEl.classList.remove('uk-open');
			startMenuEl.classList.remove('closing');

			// 3. Remove global overlay if present (common UIkit issue)
			const overlay = document.querySelector('.uk-offcanvas-overlay');
			if (overlay) {
				overlay.classList.remove('uk-open');
				setTimeout(() => overlay.remove(), 50);
			}

			return; // Skip animation logic
		}

		// Standard close with animation
		if (startMenuEl && startMenuEl.classList.contains('uk-open')) {
			// Add closing class for animation
			startMenuEl.classList.add('closing');
			// Wait for animation to complete, then close
			setTimeout(() => {
				startMenuEl.classList.remove('closing');
				// Use UIkit API to close
				if (window.UIkit && window.UIkit.offcanvas) {
					window.UIkit.offcanvas(startMenuEl).hide();
				}
			}, 200); // Match animation duration
		}
	};

	const handleIconClick = (app) => {
		// Close Start Menu immediately (no animation delay)
		closeStartMenu(true);
		// Dispatch the app click action to open/focus the app
		dispatch(handleApplicationClick(app));
	};
	const setNextSystemState = (systemState) => {
		if (projectConfig.enableAnalytics && analytics) {
			logEvent(analytics, ANALYTICS_EVENTS.CHANGE_POWER_STATE, {
				changedTo: systemState,
			});
		}
		dispatch(setSystemState(systemState));
	};

	const appState = useSelector((state) => state.appState);

	const menuProps = useConst({
		shouldFocusOnMount: true,
		items: [
			{
				key: "lock",
				iconProps: { iconName: "Lock" },
				text: "Lock",
				onClick: () => setNextSystemState("isLocked"),
			},
			{
				key: "shutDown",
				iconProps: { iconName: "PowerButton" },
				text: "Shut Down",
				onClick: () => setNextSystemState("isShutDown"),
			},
			{
				key: "admin",
				iconProps: { iconName: "Admin" },
				text: "Admin",
				onClick: () => {
					if (projectConfig.enableAnalytics && analytics) {
						logEvent(analytics, ANALYTICS_EVENTS.ADMIN);
					}
					window.open(
						"https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstleyVEVO",
						"_blank"
					);
				},
			},
		],
	});

	// Filter apps into pinned and all apps
	const pinnedApps = appState.apps.filter(app => app.isPinned);
	const allApps = appState.apps;

	// Handle keyboard navigation for list items
	const handleKeyDown = (e, app) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleIconClick(app);
		}
	};

	// Handle tile click with immediate Start Menu close
	const handleTileClick = (app) => {
		closeStartMenu(true);
		dispatch(handleApplicationClick(app));
	};

	return (
		<div id="start-menu" uk-offcanvas="overlay: false">
			<div className="uk-offcanvas-bar start-menu uk-flex uk-padding-remove">
				{/* Quick Actions Sidebar */}
				<div className="start-quick-actions">
					<IconButton
						iconProps={{ iconName: "PowerButton" }}
						title="Power"
						ariaLabel="Power"
						className="quick-action-button uk-position-bottom"
						menuProps={menuProps}
					/>
					{showPowerMenu && (
						<ContextMenu
							onShowPowerMenu={onShowPowerMenu}
							onHidePowerMenu={onHidePowerMenu}
						/>
					)}
				</div>

				{/* All Apps List Section */}
				<div className="start-app-list">
					<h4 className="section-title">All Apps</h4>
					<ul className="uk-list start-menu-list">
						{allApps.map((app, index) => {
							return (
								<li
									className="start-menu-list-item"
									onClick={() => handleIconClick(app)}
									onKeyDown={(e) => handleKeyDown(e, app)}
									key={app.id || index}
									role="button"
									tabIndex={0}
									aria-label={`Open ${app.name}`}
								>
									{app.icon !== undefined &&
										app.icon !== null &&
										app.icon !== "" && (
											<LazyImage
												src={app.icon}
												width="32"
												height="32"
												alt={app.name}
												className="uk-img list-item-icon"
											/>
										)}
									<span className="list-item-name">{app.name}</span>
								</li>
							);
						})}
					</ul>
				</div>

				{/* Pinned Tiles Section */}
				<div className="start-tiles">
					{/* Enhanced Profile Card */}
					<div className="profile-card">
						<div className="profile-card-inner">
							{/* Avatar with glow ring */}
							<div
								className="profile-avatar-container"
								onClick={() => {
									const aboutApp = allApps.find(app => app.id === "aboutMe");
									if (aboutApp) handleIconClick(aboutApp);
								}}
								style={{ cursor: 'pointer' }}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										const aboutApp = allApps.find(app => app.id === "aboutMe");
										if (aboutApp) handleIconClick(aboutApp);
									}
								}}
							>
								{user.userImage !== undefined &&
									user.userImage !== null &&
									user.userImage !== "" && (
										<LazyImage
											src={user.userImage}
											width="80"
											height="80"
											alt={user.firstName}
											className="profile-avatar"
										/>
									)}
								<div className="avatar-glow"></div>
							</div>

							{/* User Info */}
							<div className="profile-info">
								<h3 className="profile-name">
									{user.firstName} {user.lastName || ''}
								</h3>
								<p className="profile-role">{user.role || 'Developer'}</p>
							</div>

							{/* Divider */}
							<div className="profile-divider"></div>

							{/* Social Links */}
							<div className="profile-social">
								<SocialBlock />
							</div>
						</div>
					</div>

					{/* Pinned Apps Section */}
					{pinnedApps.length > 0 && (
						<div className="pinned-section">
							<h4 className="section-title">Pinned</h4>
							<div className="start-menu-tiles">
								{pinnedApps.map((app, index) => (
									<div
										className="app-tile"
										key={app.id || index}
										onClick={() => handleTileClick(app)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												handleTileClick(app);
											}
										}}
										role="button"
										tabIndex={0}
										aria-label={`Open ${app.name}`}
									>
										<LazyImage
											src={app.icon}
											width="40"
											height="40"
											alt={app.name}
											className="tile-icon"
										/>
										<span className="tile-name">{app.name}</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default StartMenu;
