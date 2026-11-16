import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeDesktopBackground } from "../../../utils/actions/settingsaction";
import settings from "../../../utils/data/settings.config";
import checked from "../../../assets/images/baseImages/checked.svg";
import "./settings.scss";
import { analytics } from "../../../utils/firebaseConfig";
import { logEvent } from "firebase/analytics";
import { ANALYTICS_EVENTS } from "../../../utils/documents/enums";
import projectConfig from "../../../utils/data/project.config";

function BackgroundSettings() {
	const current_settings = useSelector((state) => state.settingsState);
	const dispatch = useDispatch();
	const changeWallpaper = (wallpaperId) => {
		if (projectConfig.enableAnalytics && analytics) {
			logEvent(analytics, ANALYTICS_EVENTS.BACKGROUND_CHANGE, {
				wallpaper_Id: wallpaperId,
			});
		}
		dispatch(changeDesktopBackground(wallpaperId));
	};

	return (
		<div className="settings-app-container">
			<div className="settings-content">
				<p className="settings-title">
					Change Desktop Background :
				</p>
				<div className="settings-wallpaper-grid">
					{settings.desktop_wallpapers.map((wallpaper, index) => {
						return (
							<div key={index} className="settings-wallpaper-item">
								<div
									style={{
										backgroundImage: `url(${wallpaper.value})`,
										backgroundSize: "cover",
										backgroundRepeat: "no-repeat",
										backgroundPosition: "center center",
									}}
									className="settings-wallpaper-thumbnail"
									onClick={() => changeWallpaper(wallpaper.id)}
									role="button"
									tabIndex={0}
									onKeyDown={(e) => e.key === 'Enter' && changeWallpaper(wallpaper.id)}
								>
									{current_settings.currentWallpaperId ===
										wallpaper.id && (
											<div className="settings-wallpaper-selected">
												<img
													src={checked}
													width="40"
													height="40"
													alt="Selected"
												/>
											</div>
										)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default BackgroundSettings;
