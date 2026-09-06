import React from "react";
import avatar from "../../../assets/images/baseImages/default_avatar.svg";
import user from "../../../utils/data/user.config";
import LazyImage from "../../base/lazyImage";
import './about.scss';

function AboutMe() {
	return (
		<div className="about-app-container">
			<div className="about-content">
				<div className="about-profile-card">
					<div className="about-avatar-section">
						<LazyImage
							className="about-avatar"
							width="120"
							height="120"
							src={
								user.userImage !== undefined &&
									user.userImage !== null &&
									user.userImage !== ""
									? user.userImage
									: avatar
							}
							alt="user"
						/>
						<p className="about-name">
							Hey, I'm {user.firstName} {user.lastName}
						</p>
						{user.aboutMe.intro && (
							<p className="about-intro">
								{user.aboutMe.intro}
							</p>
						)}
					</div>
					{user.aboutMe.description && (
						<div className="about-description">
							{user.aboutMe.description}
						</div>
					)}

					{user.aboutMe.outro && (
						<div className="about-outro">
							{user.aboutMe.outro}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default AboutMe;
