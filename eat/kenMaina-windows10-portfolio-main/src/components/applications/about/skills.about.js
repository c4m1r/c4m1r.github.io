import React from "react";
import user from "../../../utils/data/user.config";

// Import Skill Icons
import reactIcon from "../../../assets/images/skills/react-js.svg";
import nextIcon from "../../../assets/images/skills/nextjs.svg";
import nodeIcon from "../../../assets/images/skills/node-js.svg";
import laravelIcon from "../../../assets/images/skills/laravel.svg";
import tailwindIcon from "../../../assets/images/skills/tailwind-css.svg";
import dockerIcon from "../../../assets/images/skills/docker.svg";
import mysqlIcon from "../../../assets/images/skills/mysql.svg";
import mongodbIcon from "../../../assets/images/skills/mongodb.svg";
import stripeIcon from "../../../assets/images/skills/stripe.svg";
import jsIcon from "../../../assets/images/skills/javascript.svg";
import phpIcon from "../../../assets/images/skills/php.svg";
import htmlIcon from "../../../assets/images/skills/html.svg";
import gitIcon from "../../../assets/images/skills/github.svg";

function Skills() {
	const getSkillIcon = (skillName) => {
		const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
		const map = {
			reactjs: reactIcon,
			nextjs: nextIcon,
			nodejs: nodeIcon,
			laravel: laravelIcon,
			tailwindcss: tailwindIcon,
			docker: dockerIcon,
			mysql: mysqlIcon,
			mongodb: mongodbIcon,
			stripe: stripeIcon,
			javascriptes6: jsIcon,
			php: phpIcon,
			html5css3: htmlIcon,
			gitgithub: gitIcon,
		};
		return map[normalize(skillName)] || null;
	};

	return (
		<div className="skills-app-container uk-padding">
			<div className="uk-grid-medium uk-child-width-1-1" uk-grid="true">
				{user.skills.map((category, index) => (
					<div key={index}>
						<div className="premium-card uk-padding-small">
							<h3 className="uk-card-title font-color-white uk-text-bold uk-margin-medium-bottom uk-heading-line">
								<span>{category.name}</span>
							</h3>
							<div
								className="uk-grid-small uk-child-width-1-2 uk-child-width-1-3@s uk-child-width-1-4@m uk-child-width-1-5@l uk-text-center uk-grid-match"
								uk-grid="true"
							>
								{category.values.map((skill, valIndex) => {
									const icon = getSkillIcon(skill);
									return (
										<div key={valIndex}>
											<div
												className="uk-card uk-card-secondary uk-card-body uk-border-rounded uk-box-shadow-hover-large uk-transition-toggle"
												style={{
													backgroundColor: "rgba(255, 255, 255, 0.05)",
													border: "1px solid rgba(255, 255, 255, 0.1)",
													backdropFilter: "blur(10px)",
													padding: "15px",
													display: "flex",
													flexDirection: "column",
													alignItems: "center",
													justifyContent: "center",
													gap: "10px",
													minHeight: "120px",
												}}
											>
												{icon ? (
													<img
														src={icon}
														alt={skill}
														className="uk-transition-scale-up uk-transition-opaque"
														style={{ width: "40px", height: "40px", objectFit: "contain" }}
													/>
												) : (
													<div
														className="uk-border-circle uk-background-primary uk-flex uk-flex-center uk-flex-middle"
														style={{
															width: "40px",
															height: "40px",
															fontSize: "18px",
															color: "white",
															fontWeight: "bold",
														}}
													>
														{skill.charAt(0)}
													</div>
												)}
												<span
													className="uk-text-small font-color-white uk-text-break"
													style={{ fontWeight: "500", lineHeight: "1.2" }}
												>
													{skill}
												</span>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default Skills;
