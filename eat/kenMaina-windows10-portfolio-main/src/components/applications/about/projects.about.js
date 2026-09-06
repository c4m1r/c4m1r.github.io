import React from "react";
import "./about.scss";
import user from "../../../utils/data/user.config";
import {
	DirectionalHint,
	IconButton,
	TooltipDelay,
	TooltipHost,
} from "@fluentui/react";
import LazyImage from "../../base/lazyImage";

function Projects() {
	return (
		<div className="projects-app-container uk-padding">
			<div
				className="uk-grid-small uk-child-width-1-2@m uk-child-width-1-1@s uk-grid-match"
				uk-grid="true"
			>
				{user.projects.map((project, index) => {
					// Determine links: repoLink for GitHub, demoLink or link for Live Demo
					const repoLink = project.repoLink || null;
					const demoLink = project.demoLink || project.link || null;

					return (
						<article className="project-item" key={index}>
							<div className="premium-card project-card glassy-card">
								{/* Project Image - Static, full-width view */}
								{project.image && (
									<div className="project-media">
										<LazyImage
											src={project.image}
											alt={project.projectName}
											className="project-image"
										/>
									</div>
								)}

								{/* Card Header with Title and Links */}
								<div className="project-header">
									<h3 className="project-title">{project.projectName}</h3>
									<div className="project-links">
										{repoLink && (
											<TooltipHost
												content="View GitHub Repo"
												delay={TooltipDelay.zero}
												directionalHint={DirectionalHint.bottomCenter}
											>
												<IconButton
													iconProps={{ iconName: "GitGraph" }}
													className="project-link-btn"
													aria-label="GitHub Repository"
													onClick={() => window.open(repoLink, "_blank")}
												/>
											</TooltipHost>
										)}
										{demoLink && (
											<TooltipHost
												content="View Live Demo"
												delay={TooltipDelay.zero}
												directionalHint={DirectionalHint.bottomCenter}
											>
												<IconButton
													iconProps={{ iconName: "Globe" }}
													className="project-link-btn"
													aria-label="Live Demo"
													onClick={() => window.open(demoLink, "_blank")}
												/>
											</TooltipHost>
										)}
									</div>
								</div>

								{/* Card Body - Description */}
								<div className="project-body">
									<p className="project-description">{project.description}</p>
								</div>

								{/* Card Footer - Tech Stack */}
								<div className="project-footer">
									<div className="project-tech-stack">
										{project.madeWith.map((stack, stackIndex) => (
											<span className="tech-badge" key={stackIndex}>
												{stack}
											</span>
										))}
									</div>
								</div>
							</div>
						</article>
					);
				})}
			</div>
		</div>
	);
}

export default Projects;
