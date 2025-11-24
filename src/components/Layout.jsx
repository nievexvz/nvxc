
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const Layout = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'upload', label: 'CDN Uploader', icon: 'mdi:cloud-upload' },
    { id: 'shortener', label: 'URL Shortener', icon: 'mdi:link-variant' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass border-b border-slate-700/50"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-indigo-700 to-blue-600 rounded-2xl shadow-lg">
                <Icon icon="mdi:cloud-braces" className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-extrabold bg-gradient-to-r from-indigo-500 to-blue-400 bg-clip-text text-transparent">
                  NVX Cloud
                </h1>
                <p className="text-slate-400 text-sm">
                  GitHub-powered CDN & URL Shortener
                </p>
              </div>
            </div>
            <motion.a
              href="https://github.com/nievexvz"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-colors duration-300 group"
            >
              <Icon icon="mdi:github" className="w-5 h-5 group-hover:text-white" />
              <span className="text-slate-300 group-hover:text-white">GitHub</span>
            </motion.a>
          </div>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex space-x-2 p-2 bg-slate-800/50 rounded-2xl w-fit mx-auto mb-8 glass">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-700 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon icon={tab.icon} className="w-5 h-5" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Main Content */}
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          {children}
        </motion.main>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.45 }}
        className="w-full py-8 flex justify-center text-slate-400"
      >
        <div className="flex flex-col items-center gap-2 text-sm">
        {/* Made By */}
        <p className="flex items-center gap-2">
          <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-amber-500" />
          Made by <span className="font-extrabold underline underline-offset-2">NineTwelve</span>
        </p>
        {/* Open Source (Clickable <p>) */}
        <p
          onClick={() =>
            window.open("https://github.com/nievexvz/nvxc.git", "_blank")
          }
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
        >
          <Icon icon="mdi:github" className="w-4 h-4" />
          Open Source
        </p>
      </div>
    </motion.footer>
    </div>
  );
};

export default Layout;
