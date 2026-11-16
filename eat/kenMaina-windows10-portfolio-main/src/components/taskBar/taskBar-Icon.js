import React from "react";
import { useDispatch } from "react-redux";
import { handleApplicationClick } from "../../utils/actions/app.action";
import folder from "../../assets/images/baseImages/default_folder.png";
import LazyImage from "../base/lazyImage";

function TaskBarIcon(props) {
const dispatch = useDispatch();
const handleIconClick = (app) => {
dispatch(handleApplicationClick(app));
};

const handleKeyDown = (e) => {
if (e.key === "Enter" || e.key === " ") {
e.preventDefault();
handleIconClick(props.appInfo);
}
};

return (
<div
onClick={() => handleIconClick(props.appInfo)}
onKeyDown={handleKeyDown}
className={
"taskbar-icon uk-flex uk-flex-center uk-flex-middle taskbar-icon-active" +
(!props.appInfo.isMinimized ? " onDesktop" : "")
}
role="button"
tabIndex={0}
aria-label={`${props.appInfo.isMinimized ? "Show" : "Hide"} ${props.appInfo.name}`}
>
<LazyImage
src={
props.appInfo.icon !== undefined &&
props.appInfo.icon !== null &&
props.appInfo.icon !== ""
? props.appInfo.icon
: folder
}
alt={props.appInfo.name}
width="30"
height="30"
/>
		</div>
	);
}

export default TaskBarIcon;
