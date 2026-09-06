import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smile, Briefcase, Layers, PartyPopper, Mail, MapPin, Linkedin, Send, CheckCircle, Github } from 'lucide-react';
import { PageType } from '../types';
import MemoryGame from '../components/MemoryGame';

interface DetailPageProps {
  type: PageType;
}

// --- Components for specific sections to handle state/logic ---

const ContactSection = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    // Simulate network request
    setTimeout(() => {
      setFormStatus('success');
    }, 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Location */}
        <div className="flex items-center space-x-3 p-3 sm:p-4 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-white/50 dark:border-slate-700/50">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">North Macedonia</p>
          </div>
        </div>

        {/* LinkedIn */}
        <a href="https://linkedin.com/in/menansali" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 sm:p-4 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-white/50 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0">
            <Linkedin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">LinkedIn</p>
            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">Menansali</p>
          </div>
        </a>

        <div className="flex items-center space-x-3 p-3 sm:p-4 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-white/50 dark:border-slate-700/50 sm:col-span-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">menansali@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-white/50 dark:border-slate-700/50 relative overflow-hidden">
        <h3 className="text-lg font-bold mb-4 sm:mb-6 text-slate-800 dark:text-white">Send me a message</h3>
        
        {formStatus === 'success' ? (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex flex-col items-center justify-center py-8 sm:py-12 text-center"
           >
             <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
             </div>
             <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Message Sent!</h4>
             <p className="text-slate-600 dark:text-slate-300">Thanks for reaching out. I'll get back to you soon.</p>
             <button 
                onClick={() => setFormStatus('idle')}
                className="mt-6 text-sm text-blue-500 hover:text-blue-600 font-medium"
             >
                Send another message
             </button>
           </motion.div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Name</label>
              <input required type="text" className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-sm transition-all text-sm" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Email</label>
              <input required type="email" className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-sm transition-all text-sm" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Message</label>
              <textarea required rows={4} className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-sm transition-all text-sm" placeholder="Say hello..."></textarea>
            </div>
            <button 
              disabled={formStatus === 'sending'}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 active:scale-95 text-sm sm:text-base"
            >
              {formStatus === 'sending' ? (
                <>Sending...</>
              ) : (
                <>Send Message <Send className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const ProjectsSection = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
    {[
      {
        title: "Environmental Monitoring",
        desc: "Collected PM1, PM2.5, PM10, and weather data. Automated data collection with cron jobs and Bash. Visualized results using Python and Grafana.",
        stack: ["Python", "Raspberry Pi", "Grafana"],
        url: "https://github.com/menansali"
      },
      {
        title: "Edge Environmental Sensing",
        desc: "Used Arduino Nano 33 BLE for collecting sensor data. Transmitted via LoRa from T-Beam to a server. Optimized for low power consumption.",
        stack: ["C++", "LoRa", "Arduino"],
        url: "https://github.com/menansali"
      },
      {
        title: "LikeWise - Fintech Platform",
        desc: "Admin dashboard for global payroll orchestration. Features smart FX rate locking, multi-currency support, and intelligent budget planning.",
        stack: ["React", "Fintech", "Hackathon"],
        url: "https://github.com/menansali"
      },
      {
        title: "SheetGenius",
        desc: "iOS app with Node.js backend. Features automated Formula Generator, Smart Assistant for spreadsheets, and PDF to Excel conversion.",
        stack: ["iOS", "Node.js", "Swift"],
        url: "https://github.com/menansali"
      }
    ].map((project, i) => (
      <motion.div 
        key={i} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="group bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
      >
        <div className="flex justify-between items-start mb-2 gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">{project.title}</h3>
          <a 
             href={project.url}
             target="_blank"
             rel="noopener noreferrer"
             className="text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white transition-colors shrink-0"
             title="View Source Code"
           >
             <Github className="w-5 h-5" />
           </a>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed flex-grow">
          {project.desc}
        </p>
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/30 dark:border-slate-700/30 items-center">
          {project.stack.map((tech) => (
            <span key={tech} className="px-2 py-1 bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/20 rounded-md text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-300">
              {tech}
            </span>
          ))}
          <div className="ml-auto">
             <a 
              href={project.url}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             >
               <Github className="w-3 h-3" />
               <span>Open Source</span>
             </a>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

// --- Content Mapping ---

const contentMap = {
  [PageType.Me]: {
    title: "About Me",
    icon: Smile,
    color: "text-teal-500",
    bg: "bg-teal-50/50 dark:bg-teal-900/20",
    content: (
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            I am a highly motivated junior software developer with a strong foundation in both frontend and backend technologies. 
            My experience includes web development using HTML, CSS, JavaScript, PHP, and MySQL, as well as C# and .NET MVC for 
            enterprise-level applications.
          </p>
          <p>
            I've developed various projects ranging from IoT-based smart systems to mobile apps using SwiftUI. I am also skilled in 
            database design, object-oriented programming, and working with frameworks like Entity Framework Core.
          </p>
        </div>

        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Work Experience</h3>
            <div className="bg-white/40 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-white/50 dark:border-slate-700/50 hover:bg-white/50 dark:hover:bg-slate-800/60 transition-colors">
                <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">Research Intern</h4>
                    <span className="text-xs font-medium px-2 py-1 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-md">Mar 2025 – Present</span>
                </div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Max van Der Stoel Institute, Tetovo</p>
                <ul className="list-disc list-outside ml-4 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                    <li>Conducting research and development with LoRa-based IoT devices.</li>
                    <li>Creating user interfaces for data visualization.</li>
                    <li>Designing relational databases for efficient data storage.</li>
                </ul>
            </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Education</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/40 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-white/50 dark:border-slate-700/50">
                  <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Bachelor of CS</h4>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Present</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">South East European University</p>
              </div>

              <div className="bg-white/40 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-white/50 dark:border-slate-700/50">
                  <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Erasmus Exchange</h4>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">2025 – 2026</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Tallinn University of Technology</p>
              </div>
            </div>
        </div>
      </div>
    )
  },
  [PageType.Projects]: {
    title: "Recent Projects",
    icon: Briefcase,
    color: "text-green-500",
    bg: "bg-green-50/50 dark:bg-green-900/20",
    content: <ProjectsSection />
  },
  [PageType.Skills]: {
    title: "Technical Skills",
    icon: Layers,
    color: "text-indigo-500",
    bg: "bg-indigo-50/50 dark:bg-indigo-900/20",
    content: (
      <div className="space-y-6 sm:space-y-8">
        {[
          { category: "Programming Languages", items: ["HTML/CSS/JS", "PHP", "MySQL", "C#", ".NET MVC", "SwiftUI", "Python", "Bash", "C++"] },
          { category: "Frameworks & Tools", items: ["Entity Framework", "Node.js", "Git", "Figma", "Grafana", "VS Code"] },
          { category: "IoT & Hardware", items: ["Raspberry Pi", "Arduino", "LoRa", "ESP32", "Sensors", "Circuit Design"] },
          { category: "Professional", items: ["UI/UX Design", "Database Design", "OOP", "Agile", "Problem Solving"] },
          { category: "Languages", items: ["English", "Turkish", "Albanian", "Macedonian", "German"] }
        ].map((section, idx) => (
          <motion.div 
            key={section.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <h3 className="text-lg font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {section.category}
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {section.items.map((skill) => (
                <div key={skill} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/50 dark:border-slate-700/50 rounded-lg text-xs sm:text-sm font-medium shadow-sm hover:scale-105 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all cursor-default">
                  {skill}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    )
  },
  [PageType.Fun]: {
    title: "Fun & Games",
    icon: PartyPopper,
    color: "text-pink-500",
    bg: "bg-pink-50/50 dark:bg-pink-900/20",
    content: (
      <div className="space-y-8 sm:space-y-10">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-4 sm:mb-6">Train your brain!</h3>
          <MemoryGame />
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Interests & Hobbies</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
              { emoji: "🏋️‍♂️", label: "Fitness" },
              { emoji: "📚", label: "Learning" },
              { emoji: "🚀", label: "Growth" },
              { emoji: "💡", label: "Innovation" }
              ].map((hobby, i) => (
              <motion.div 
                key={hobby.label} 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 text-center shadow-sm hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors"
              >
                  <span className="text-3xl sm:text-4xl mb-2 sm:mb-3">{hobby.emoji}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200 text-sm sm:text-base">{hobby.label}</span>
              </motion.div>
              ))}
          </div>
        </div>
      </div>
    )
  },
  [PageType.Contact]: {
    title: "Get in Touch",
    icon: Mail,
    color: "text-orange-500",
    bg: "bg-orange-50/50 dark:bg-orange-900/20",
    content: <ContactSection />
  }
};

const DetailPage: React.FC<DetailPageProps> = ({ type }) => {
  const navigate = useNavigate();
  const data = contentMap[type];
  const Icon = data.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto px-4 mt-4 sm:mt-8 pb-24"
    >
      <button 
        onClick={() => navigate('/')}
        className="mb-6 sm:mb-8 flex items-center space-x-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors group text-sm sm:text-base"
      >
        <div className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm border border-white/50 dark:border-slate-700/50 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
        <div className={`p-3 sm:p-4 rounded-2xl ${data.bg} backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-inner`}>
          <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${data.color}`} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white drop-shadow-sm">{data.title}</h1>
      </div>

      <div className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-1 border border-white/40 dark:border-slate-700/40 shadow-xl">
         <div className="p-1 sm:p-4">
            {data.content}
         </div>
      </div>
    </motion.div>
  );
};

export default DetailPage;