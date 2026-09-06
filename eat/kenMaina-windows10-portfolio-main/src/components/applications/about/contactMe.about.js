import React from "react";
import SocialBlock from "../../base/socialBlock";
import Mail from "../mail.application";

function ContactMe() {
	return (
		<div className="uk-width-1-1">
			<div className="uk-text-center">
				<p>Find me on : </p>
				<SocialBlock />
			</div>
			<div className="premium-card uk-margin-top">
				<Mail />
			</div>
		</div>
	);
}

export default ContactMe;
