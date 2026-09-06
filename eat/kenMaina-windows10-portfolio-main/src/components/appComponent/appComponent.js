import { IconButton, TextField } from "@fluentui/react";
import React, { useState, useRef, Suspense } from "react";
import "./appComponent.scss";
import { useDispatch } from "react-redux";
import { handleAppFunctions } from "../../utils/actions/app.action";
import WindowFrame from "../windowFrame/windowFrame";
import AppRegistry from "../base/AppRegistry";

function AppComponent(props) {
	const dispatch = useDispatch();
	const handleAppFunctionClick = (app, type) => {
		dispatch(handleAppFunctions(app, type));
	};

	const [showAppMenu, setShowAppMenu] = useState(false);
	const [currentComponentName, setCurrentComponentName] = useState("");
	const [currentIndex, setCurrentIndex] = useState(0);
	const sidebarRef = useRef(null);

	const setComponent = (componentName, index) => {
		setCurrentComponentName(componentName);
		if (index !== undefined) {
			setCurrentIndex(index);
		}
	};

	const navigateBack = () => {
		if (currentIndex > 0 && props.appInfo.subComponent) {
			const newIndex = currentIndex - 1;
			setCurrentIndex(newIndex);
			setCurrentComponentName(props.appInfo.subComponent[newIndex].name);
			// Trigger UIkit switcher
			if (sidebarRef.current) {
				const items = sidebarRef.current.querySelectorAll('li > button');
				if (items[newIndex]) {
					items[newIndex].click();
				}
			}
		}
	};

	const navigateForward = () => {
		if (props.appInfo.subComponent && currentIndex < props.appInfo.subComponent.length - 1) {
			const newIndex = currentIndex + 1;
			setCurrentIndex(newIndex);
			setCurrentComponentName(props.appInfo.subComponent[newIndex].name);
			// Trigger UIkit switcher
			if (sidebarRef.current) {
				const items = sidebarRef.current.querySelectorAll('li > button');
				if (items[newIndex]) {
					items[newIndex].click();
				}
			}
		}
	};

	return (
		<WindowFrame
			appInfo={props.appInfo}
			onFunctionClick={handleAppFunctionClick}
		>
			<div className="uk-flex uk-flex-row uk-height-1-1 uk-width-1-1">
				{props.appInfo.showLinks && (
					<div
						className={
							"app-sidebar blur uk-hidden@xs uk-visible@m " +
							(props.appInfo.isApplication ? "isApplication" : "")
						}
					>
						<ul
							className="uk-list sidebar-list uk-margin-large-top"
							uk-switcher={"connect: ." + props.appInfo.id}
							ref={sidebarRef}
						>
							{props.appInfo.subComponent && props.appInfo.subComponent.map(
								(component, index) => {
									return (
										<li
											className="uk-margin-remove"
											key={index}
										>
											<button
												type="button"
												onClick={() => {
													setComponent(component.name, index);
												}}
											>
												<span className="sidebar-list-item uk-margin-remove">
													{component.name}
												</span>
											</button>
										</li>
									);
								}
							)}
						</ul>
					</div>
				)}
				<div
					className={
						"uk-width-expand@s " +
						((props.appInfo.isApplication &&
							props.appInfo.isMaximized) ||
							props.appInfo.isApplication
							? "maximized-application"
							: "app-content-container")
					}
				>
					{/* Title bar is now handled by WindowFrame */}

					<div className="app-content uk-background-secondary scrollbar">
						{!props.appInfo.isApplication && (
							<div className="app-nav-bar uk-padding-small uk-flex">
								<IconButton
									iconProps={{ iconName: "Back" }}
									title="Back"
									ariaLabel="Back"
									onClick={navigateBack}
									disabled={currentIndex === 0}
								/>
								<IconButton
									iconProps={{ iconName: "Forward" }}
									title="Forward"
									ariaLabel="Forward"
									onClick={navigateForward}
									disabled={currentIndex === (props.appInfo.subComponent ? props.appInfo.subComponent.length - 1 : 0)}
								/>
								<TextField
									disabled
									iconProps={{ iconName: "Refresh" }}
									className="uk-margin-small-right disabled-text-field uk-width-3-5"
									placeholder={`This PC > ${props.appInfo.name} > ${currentComponentName}`}
								/>
								<TextField
									disabled
									iconProps={{ iconName: "Search" }}
									className="uk-margin-small-right disabled-text-field uk-width-1-5"
									placeholder={`Search`}
								/>
							</div>
						)}
						<div className="dropdown">
							<IconButton
								iconProps={{
									iconName: "GlobalNavButton",
								}}
								title="Menu"
								ariaLabel="Menu"
								className="uk-hidden@m"
								onClick={() => setShowAppMenu(!showAppMenu)}
							/>
							<div
								className={
									"dropdown-content blur uk-box-shadow-large " +
									(showAppMenu
										? "show-element"
										: "hide-element")
								}
							>
								<ul
									className="uk-list sidebar-list"
									uk-switcher={
										"connect: ." + props.appInfo.id
									}
								>
									{props.appInfo.subComponent && props.appInfo.subComponent.map(
										(component, index) => {
											return (
												<li
													className="uk-margin-remove"
													onClick={() =>
														setShowAppMenu(
															!showAppMenu
														)
													}
													key={index}
												>
													<button
														type="button"
														onClick={() => {
															setComponent(
																component.name,
																index
															);
														}}
													>
														<span className="sidebar-list-item uk-margin-remove">
															{component.name}
														</span>
													</button>
												</li>
											);
										}
									)}
								</ul>
							</div>
						</div>

						<ul
							className={
								"uk-switcher height-100 " +
								props.appInfo.id +
								(props.appInfo.isApplication
									? " isApplication-list"
									: "")
							}
						>
							{props.appInfo.subComponent && props.appInfo.subComponent.map(
								(component, index) => {
									return (
										<li
											className="uk-padding-small height-100"
											key={index}
										>
											<React.Fragment>
												<Suspense fallback={<div className="uk-position-center">Loading...</div>}>
													{AppRegistry[component.component] ? (
														React.createElement(AppRegistry[component.component])
													) : (
														<div>Component not found</div>
													)}
												</Suspense>
											</React.Fragment>
										</li>
									);
								}
							)}
						</ul>
					</div>
				</div>
			</div>
		</WindowFrame>
	);
}

export default AppComponent;
