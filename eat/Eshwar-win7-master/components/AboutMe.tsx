'use client'

import React, { useState } from 'react'
import styles from './AboutMe.module.css'
import Image from 'next/image'
import backButtonDisabledImage from '@/public/assets/images/back-button-disabled.svg';
import forwardButtonDisabledImage from '@/public/assets/images/forward-button-disabled.svg';
import fileExplorerIcon from '@/public/assets/images/folder.png';

const AboutMe = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('introduction')

  const skills = [
    { category: 'Frontend Frameworks', items: ['Angular', 'React', 'Next.js'] },
    { category: 'Languages', items: ['JavaScript', 'TypeScript', 'HTML', 'CSS'] },
    { category: 'Technologies', items: ['Tailwind CSS', 'Component Architecture', 'UI Design Systems'] },
  ]

  const experience = [
    {
      duration: '3.6+ Years',
      title: 'Front-End UI Development',
      description: 'Building scalable, dynamic, and configurable user interfaces'
    },
    {
      duration: 'Enterprise Level',
      title: 'Platform Development',
      description: 'Dynamic UI generation enabling faster development cycles'
    },
    {
      duration: 'Specialization',
      title: 'Component Systems & Design Frameworks',
      description: 'Creating reusable, developer-friendly tools'
    }
  ]

  const socialLinks = [
    { icon: '📘', label: 'LinkedIn', link: '#' },
    { icon: '🐙', label: 'GitHub', link: '#' },
    { icon: '💼', label: 'Portfolio', link: '#' },
    { icon: '✉️', label: 'Email', link: '#' },
  ]

  const softwareTools = [
    { icon: '🎨', label: 'Adobe CC', tools: 'Figma, XD, Photoshop' },
    { icon: '💻', label: 'Editors', tools: 'VS Code, IntelliJ IDEA' },
    { icon: '🔧', label: 'DevTools', tools: 'Git, Chrome DevTools' },
    { icon: '⚡', label: 'Build Tools', tools: 'Webpack, Vite, Next.js' },
  ]

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className={styles.container}>
      {/* Windows 7 Title Bar */}
      {/* <div className={styles.titleBar}>
        <div className={styles.titleBarContent}>
          📁 About Me
        </div>
        <div className={styles.titleBarButtons}>
          <button className={styles.titleBarBtn}>_</button>
          <button className={styles.titleBarBtn}>□</button>
          <button className={styles.titleBarBtn}>✕</button>
        </div>
      </div> */}

      {/* Header with toolbar */}
      <div className={styles.toolBar}>
        <div> <Image width={30} height={30} alt='back' src={backButtonDisabledImage} /> </div>
        <div> <Image width={30} height={30} alt='back' src={forwardButtonDisabledImage} /> </div>
        <span>      
          <div className={styles.breadcrumb}>
        <span> <Image className='inline-flex' width={30} height={30} alt='back' src={fileExplorerIcon} />  Computer</span>
        <span> › </span>
        <span>Eshwar</span>
        <span> › </span>
        <span>About Me</span>
      </div></span>
  
      </div>

      {/* Navigation breadcrumb */}
      <div className={styles.breadcrumb}>
        <span> <Image className='inline-flex' width={30} height={30} alt='back' src={fileExplorerIcon} />  Computer</span>
        <span> › </span>
        <span>Eshwar</span>
        <span> › </span>
        <span>About Me</span>
      </div>

      {/* Main content divided into sidebar and main area (like Windows Explorer) */}
      <div className={styles.mainContainer}>
        {/* LEFT SIDEBAR */}
        <div className={styles.sidebar}>
          {/* SOCIAL LINKS SECTION */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionHeader} onClick={() => toggleSection('social')}>
              <span className={styles.toggleIcon}>{expandedSection === 'social' ? '▼' : '▶'}</span>
              <span className={styles.sidebarSectionTitle}>Social Links</span>
            </div>
            {expandedSection === 'social' && (
              <div className={styles.sidebarItems}>
                {socialLinks.map((link, idx) => (
                  <div key={idx} className={styles.sidebarItem} title={link.label}>
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SKILLS SECTION */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionHeader} onClick={() => toggleSection('skills')}>
              <span className={styles.toggleIcon}>{expandedSection === 'skills' ? '▼' : '▶'}</span>
              <span className={styles.sidebarSectionTitle}>Skills</span>
            </div>
            {expandedSection === 'skills' && (
              <div className={styles.sidebarItems}>
                {skills.map((skill, idx) => (
                  <div key={idx} className={styles.skillsPreview}>
                    <span>📂 {skill.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SOFTWARE SECTION */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionHeader} onClick={() => toggleSection('software')}>
              <span className={styles.toggleIcon}>{expandedSection === 'software' ? '▼' : '▶'}</span>
              <span className={styles.sidebarSectionTitle}>Software</span>
            </div>
            {expandedSection === 'software' && (
              <div className={styles.sidebarItems}>
                {softwareTools.map((tool, idx) => (
                  <div key={idx} className={styles.sidebarItem} title={tool.tools}>
                    <span>{tool.icon}</span>
                    <span className={styles.toolLabel}>{tool.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className={styles.contentArea}>
          {/* INTRODUCTION SECTION */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>👨‍💼</span>
              <h2 className={styles.sectionTitle}>About Me</h2>
            </div>
            <div className={styles.sectionContent}>
              <p className={styles.paragraph}>
                I'm Eshwar, a <strong>Full Stack Developer</strong> with 4 years of experience building scalable, dynamic, and developer-friendly user interfaces. I enjoy turning complex requirements into clean, intuitive web experiences, with a strong focus on usability, performance, and long-term maintainability.
              </p>
              <p className={styles.paragraph}>
                Over the years, I've specialized in building configurable UI systems that reduce repetitive development work and simplify how interfaces are created and managed. I'm particularly interested in UI architectures that allow screens to be generated visually, helping teams move faster while keeping designs consistent and reliable.
              </p>
              <p className={styles.paragraph}>
                My work often sits at the intersection of component systems, UI architecture, and developer experience. I enjoy designing reusable patterns and tools that let developers focus more on business logic rather than rebuilding the same UI pieces again and again.
              </p>
              <p className={styles.paragraph}>
                I'm driven by clean design, thoughtful abstractions, and continuous improvement. Whether it's refining a component system or improving performance at scale, my goal is always to build interfaces that feel simple to use, easy to extend, and pleasant to work with.
              </p>
            </div>
          </div>

          {/* EXPERIENCE SECTION */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>💼</span>
              <h2 className={styles.sectionTitle}>Professional Experience</h2>
            </div>
            <div className={styles.sectionContent}>
              {experience.map((exp, index) => (
                <div key={index} className={styles.experienceCard}>
                  <div className={styles.experienceDuration}>{exp.duration}</div>
                  <div className={styles.experienceTitle}>{exp.title}</div>
                  <p className={styles.experienceDescription}>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SKILLS SECTION */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>🛠️</span>
              <h2 className={styles.sectionTitle}>Skills & Technologies</h2>
            </div>
            <div className={styles.sectionContent}>
              {skills.map((skillGroup, index) => (
                <div key={index} className={styles.skillGroup}>
                  <div className={styles.skillGroupTitle}>{skillGroup.category}</div>
                  <div className={styles.skillsList}>
                    {skillGroup.items.map((skill, i) => (
                      <span key={i} className={styles.skillBadge}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEARNING JOURNEY */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>🌍</span>
              <h2 className={styles.sectionTitle}>Learning Journey</h2>
            </div>
            <div className={styles.sectionContent}>
              <p className={styles.paragraph}>
                Growing up in New Zealand, I saw how powerful design could be through sport, particularly with rugby and the All Blacks. Every jersey, every logo, every piece of visual identity carried the weight of a nation's pride. It showed me that great design doesn't just communicate, it creates belonging and stirs something deep in people.
              </p>
              <p className={styles.paragraph}>
                After committing to design in my twenties, I completed a Diploma of Graphic Design at Queensland TAFE and started working with clients on everything from event video packages to front-end UI projects. Recent work collaborating with AI tools opened up new territory for me, letting me build complex web experiences despite starting from zero coding knowledge.
              </p>
            </div>
          </div>

          {/* PASSION & VALUES SECTION */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>❤️</span>
              <h2 className={styles.sectionTitle}>What Drives Me</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.valuesList}>
                <div className={styles.valueItem}>
                  <span className={styles.valueEmoji}>✨</span>
                  <div>
                    <strong>Clean, Intuitive Design</strong>
                    <p>Creating interfaces that delight users and reduce friction in their experience</p>
                  </div>
                </div>
                <div className={styles.valueItem}>
                  <span className={styles.valueEmoji}>🎨</span>
                  <div>
                    <strong>Visual Storytelling</strong>
                    <p>Design that communicates meaning and creates emotional connections</p>
                  </div>
                </div>
                <div className={styles.valueItem}>
                  <span className={styles.valueEmoji}>🚀</span>
                  <div>
                    <strong>Developer Productivity</strong>
                    <p>Building reusable component systems that help teams move faster</p>
                  </div>
                </div>
                <div className={styles.valueItem}>
                  <span className={styles.valueEmoji}>📚</span>
                  <div>
                    <strong>Continuous Learning</strong>
                    <p>Always exploring better ways to build the web and staying current with innovation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Windows 7 Status Bar */}
      <div className={styles.statusBar}>
        <span className={styles.statusText}>Ready</span>
      </div>
    </div>
  )
}

export default AboutMe
