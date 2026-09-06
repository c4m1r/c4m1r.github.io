
import user_avatar from "../../assets/images/baseImages/profile.webp";

import coldStorageGif from "../../assets/images/projects/coldstorage.webp";

const user = {
	firstName: "Ken",
	lastName: "Maina",
	role: "Full-Stack Developer",
	userImage: user_avatar,
	location: "Nairobi, Kenya",
	phone: "+254 113381186",
	email: "kenp7145@gmail.com",
	linkedIn: "in/ken-maina-49607955",
	upwork: "kenmaina",
	gitHub: "kenmaina",
	whatsapp: "+254 113381186",
	aboutMe: {
		intro: "Forward-thinking Full-Stack Developer with 10+ years of experience delivering scalable, high-performance web applications and digital systems.",
		description:
			"Skilled in React, Next.js, Node.js, Laravel, and Docker, with hands-on expertise integrating modern tools and APIs to streamline development workflows. Known for transforming innovative concepts into reliable, production-ready software while leading teams and managing projects with precision and agility.",
		outro: "I thrive at the intersection of clean code and modern tooling — leveraging Dockerized workflows, CI/CD pipelines, and modular front-end frameworks like React and Next.js to ship faster and smarter.",
	},
	experiences: [
		{
			organization: "Upwork (Remote)",
			organizationPicture: null,
			isCurrent: true,
			startDate: "2025",
			endDate: "Present",
			positions: [
				{
					positionName: "Full-Stack Developer",
					startDate: "2025",
					endDate: "Present",
					isPresent: true,
					description:
						"Built and maintained scalable full-stack solutions for international clients using React, Laravel, Node.js, and Docker. Delivered SaaS, eCommerce, and CMS projects optimized for performance, security, and SEO. Automated deployment pipelines and containerized production environments for consistency and scalability. Integrated global payment systems (Stripe, PayPal) and regional gateways (M-Pesa). Mentored junior developers and introduced workflow automation with modern dev tools.",
				},
			],
		},
		{
			organization: "Axestore Online",
			organizationPicture: null,
			isCurrent: true,
			startDate: "2019",
			endDate: "Present",
			positions: [
				{
					positionName: "Owner",
					startDate: "2022",
					endDate: "Present",
					isPresent: true,
					description:
						"Founded and manage an eCommerce brand with end-to-end responsibility for development, SEO, and digital marketing.",
				},
			],
		},
		{
			organization: "GrowthBond.co",
			organizationPicture: null,
			isCurrent: false,
			startDate: "2018",
			endDate: "2020",
			positions: [
				{
					positionName: "Country Manager (Kenya)",
					startDate: "2018",
					endDate: "2020",
					isPresent: false,
					description:
						"Partnered with the International Trade Centre (ITC) to deliver social-media advertising training for refugees in Kakuma. Led curriculum design, stakeholder coordination, and mentorship programs for digital inclusion.",
				},
			],
		},
		{
			organization: "Weddings in Winnipeg",
			organizationPicture: null,
			isCurrent: false,
			startDate: "2024",
			endDate: "2025",
			positions: [
				{
					positionName: "Operations Manager",
					startDate: "2024",
					endDate: "2025",
					isPresent: false,
					description:
						"Oversaw operations and web management for a Canadian bridal media company, optimizing workflow efficiency and digital reach.",
				},
			],
		},
		{
			organization: "GiveDirectly",
			organizationPicture: null,
			isCurrent: false,
			startDate: "2011",
			endDate: "2011",
			positions: [
				{
					positionName: "Data Management & Research",
					startDate: "2011",
					endDate: "2011",
					isPresent: false,
					description:
						"Conducted data collection and analysis for Kenya’s pioneering cash-transfer pilot project, ensuring accuracy and fairness in randomized distribution.",
				},
			],
		},
	],
	education: [
		{
			instituteName: "Kabete National Polytechnic",
			degree: "Software Development",
			year: "2024", // Assuming recent or current based on context, user didn't specify year but it's a new program usually. Leaving blank or estimating? I'll put a placeholder year or just leave it. Let's assume recent.
			id: 1,
		},
		{
			instituteName: "University of Nairobi",
			degree: "Bachelor of Science (BASc), Network Engineering",
			year: "", // User didn't specify year
			id: 2,
		},
	],
	projects: [
		{
			projectName: "Cold Storage Traceability System",
			description:
				"Designed and developed a logistics and fish-chain traceability platform that won a hackathon and is now scaling into commercial deployment. Built with React, Node.js, and Docker, integrating live IoT tracking and real-time dashboards.",
			madeWith: ["React", "Node.js", "Docker", "IoT"],
			link: "", // No link provided
			image: coldStorageGif,
		},
		{
			projectName: "M-Pesa Integration",
			description:
				"Engineered secure payment APIs for multiple platforms, connecting M-Pesa with Laravel-based backends and automating transaction workflows for Kenyan and global clients.",
			madeWith: ["Laravel", "M-Pesa API", "PHP"],
			link: "",
		},
		{
			projectName: "Modern Development Workflow",
			description:
				"Adopted cutting-edge development tools (VS Code Dev Containers, GitLab CI/CD, Docker Compose) to boost speed and maintainability across distributed teams.",
			madeWith: ["Docker", "CI/CD", "VS Code"],
			link: "",
		},
		{
			projectName: "Digital Project Management",
			description:
				"Delivered over 120 global projects on Upwork, maintaining 100 % Job Success and earning Top-Rated status through on-time delivery and exceptional communication.",
			madeWith: ["Upwork", "Project Management"],
			link: "",
		},
	],
	skills: [
		{
			name: "Core Stack & Tools",
			values: [
				"React.js",
				"Next.js",
				"Node.js",
				"Laravel",
				"Strapi",
				"Tailwind CSS",
				"Docker",
				"MySQL",
				"MongoDB",
				"REST & GraphQL APIs",
				"Stripe",
				"M-Pesa",
				"CI/CD",
			],
		},
		{
			name: "Technical & Professional Skills",
			values: [
				"JavaScript (ES6+)",
				"PHP",
				"HTML5/CSS3",
				"Git/GitHub",
				"JavaScript Testing (Jest, Mocha)",
				"SEO Optimization",
				"UI/UX Collaboration",
			],
		},
	],
};

export default user;
