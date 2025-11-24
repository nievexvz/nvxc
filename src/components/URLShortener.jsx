import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { createShortURL } from '../lib/github';

const URLShortener = () => {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const shortenURL = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setIsLoading(true);
    
    try {
      const result = await createShortURL(url, customSlug || undefined);
      
      if (result.success) {
        setShortenedUrls(prev => [{
          original: url,
          short: result.shortUrl,
          slug: result.slug,
          createdAt: new Date().toISOString(),
          clicks: 0
        }, ...prev]);
        setUrl('');
        setCustomSlug('');
        
        // Show success message
        alert(`✅ URL berhasil dipendekkan: ${result.shortUrl}`);
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Gagal memendekkan URL');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = async (text, event) => {
    try {
      await navigator.clipboard.writeText(text);
      const button = event.target.closest('button');
      const originalHTML = button.innerHTML;
      button.innerHTML = '<iconify-icon icon="mdi:check" class="w-4 h-4"></iconify-icon>';
      setTimeout(() => {
        button.innerHTML = originalHTML;
      }, 2000);
    } catch (err) {
      console.error('Gagal copy: ', err);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Shortener Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 border border-slate-700/50 shadow-2xl"
      >
        <form onSubmit={shortenURL} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              <Icon icon="mdi:web" className="w-4 h-4 inline mr-2" />
              URL Tujuan
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very-long-url-path-here"
              className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              <Icon icon="mdi:tag-outline" className="w-4 h-4 inline mr-2" />
              Custom Slug (Opsional)
            </label>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="link-saya"
              className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
              pattern="[a-zA-Z0-9-_]+"
              title="Hanya huruf, angka, strip, dan underscore yang diperbolehkan"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !url}
            whileHover={{ scale: isLoading || !url ? 1 : 1.05 }}
            whileTap={{ scale: isLoading || !url ? 1 : 0.95 }}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Memendekkan...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Icon icon="mdi:link-variant" className="w-5 h-5" />
                <span>Pendekkan URL</span>
              </div>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Shortened URLs List */}
      <AnimatePresence>
        {shortenedUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-3xl p-6 border border-slate-700/50"
          >
            <h3 className="text-xl font-bold text-white mb-6">
              URL yang Dipendekkan ({shortenedUrls.length})
            </h3>
            
            <div className="space-y-4">
              {shortenedUrls.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 bg-slate-800/30 rounded-xl hover:bg-slate-700/30 transition-colors duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Icon icon="mdi:link-variant" className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <a
                        href={item.short}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 font-semibold truncate text-lg"
                      >
                        {item.short}
                      </a>
                    </div>
                    
                    <motion.button
                      onClick={(e) => copyToClipboard(item.short, e)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
                    >
                      <Icon icon="mdi:content-copy" className="w-4 h-4" />
                      <span>Copy</span>
                    </motion.button>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span className="truncate flex-1 mr-4 text-xs">
                      {item.original}
                    </span>
                    <div className="flex items-center space-x-4 flex-shrink-0">
                      <div className="flex items-center space-x-1">
                        <Icon icon="mdi:calendar" className="w-3 h-3" />
                        <span className="text-xs">{formatDate(item.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon icon="mdi:click" className="w-3 h-3" />
                        <span className="text-xs">{item.clicks} clicks</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default URLShortener;
