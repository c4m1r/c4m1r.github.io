import React from "react";
import "./lockScreen.scss";
import { setSystemState } from "../../utils/actions/system.action";
import { useDispatch } from "react-redux";
import avatar from "../../assets/images/baseImages/profile.png";
import { Icon, PrimaryButton, TextField } from "@fluentui/react";
import SocialBlock from "../base/socialBlock";
import LazyImage from "../base/lazyImage";

function SignInScreen() {
	const dispatch = useDispatch();
	const setNextSystemState = (systemState) => {
		dispatch(setSystemState(systemState));
	};

	return (
		<div className="screenHeight SignInOverlay">
			{/* Sign In Form */}
			<div className="sign-in-content">
				<div className="avatar-container">
					<LazyImage
						className="uk-border-circle avatar-image"
						src={avatar}
						alt="User"
					/>
				</div>
				<div>
					<h1 className="uk-heading-small  font-color-white">
						Ken Maina
					</h1>
				</div>
				<div>
					<TextField
						placeholder="Click 'Sign In' To Enter"
						type="password"
						canRevealPassword
						revealPasswordAriaLabel="Show password"
						styles={{
							field: { textAlign: 'center' },
							fieldGroup: { textAlign: 'center' }
						}}
					/>
				</div>
				<div className="uk-margin-small-top">
					<PrimaryButton
						text="Sign In"
						allowDisabledFocus
						onClick={() => setNextSystemState("isDesktop")}
					/>
				</div>
			</div>

			{/* LockScreenIcons */}
			<div className="uk-position-bottom-right uk-overlay uk-flex uk-flex-column">
				<div className="font-color-white uk-text-lead">
					<Icon iconName="WifiEthernet" />
				</div>
			</div>

			{/* Social Links */}
			<div className="uk-position-bottom-left uk-overlay uk-flex uk-flex-column">
				<SocialBlock />
			</div>
		</div>
	);
}

export default SignInScreen;
