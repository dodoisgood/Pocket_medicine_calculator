import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Activity,
  Heart,
  Wind,
  Droplets,
  Dna,
  Flame,
  Layers,
  ShieldAlert,
  Zap,
  Bug,
  Sparkles,
  Search,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculatorsList, CATEGORIES, type Calculator } from '../calculators/definitions';

interface LayoutProps {
  selectedCalculator: Calculator;
  onSelectCalculator: (calculator: Calculator) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  selectedCalculator,
  onSelectCalculator,
  children,
}) => {
  const { language, setLanguage, t, tl } = useLanguage();
  // Set HTML language attribute and SEO meta tags
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('app.title');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t('app.subtitle'));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = t('app.subtitle');
      document.head.appendChild(meta);
    }
  }, [language, t]);

  const toggleLanguage = () => {
    if (language === 'zh') {
      setLanguage('zh_hans');
    } else if (language === 'zh_hans') {
      setLanguage('en');
    } else {
      setLanguage('zh');
    }
  };
  const displayLang = language === 'zh_hans' ? 'zh' : language;
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Map category keys to Lucide icons
  const getCategoryIcon = (categoryKey: string) => {
    switch (categoryKey) {
      case 'cardiology':
        return <Heart size={14} className="text-rose-400 dark:text-rose-500" />;
      case 'pulmonary':
        return <Wind size={14} className="text-sky-400 dark:text-sky-500" />;
      case 'nephrology':
        return <Droplets size={14} className="text-emerald-400 dark:text-emerald-500" />;
      case 'acid_base':
        return <Dna size={14} className="text-indigo-400 dark:text-indigo-500" />;
      case 'gastroenterology':
        return <Flame size={14} className="text-amber-500 dark:text-amber-600" />;
      case 'hematology':
        return <Layers size={14} className="text-purple-400 dark:text-purple-500" />;
      case 'oncology':
        return <ShieldAlert size={14} className="text-red-400 dark:text-red-500" />;
      case 'endocrinology':
        return <Zap size={14} className="text-yellow-450 dark:text-yellow-500" />;
      case 'infectious_diseases':
        return <Bug size={14} className="text-teal-400 dark:text-teal-500" />;
      case 'rheumatology':
        return <Sparkles size={14} className="text-pink-400 dark:text-pink-500" />;
      default:
        return <BookOpen size={14} className="text-slate-400" />;
    }
  };

  // Count calculators by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    calculatorsList.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered list of calculators based on search query and category selector
  const filteredCalculators = useMemo(() => {
    return calculatorsList.filter((c) => {
      const matchesCategory = selectedCategory ? c.category === selectedCategory : true;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q
        ? c.name.zh.toLowerCase().includes(q) ||
          c.name.en.toLowerCase().includes(q) ||
          c.subtitle.zh.toLowerCase().includes(q) ||
          c.subtitle.en.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleLanguage = () => {
    if (language === 'zh') {
      setLanguage('zh_hans');
    } else if (language === 'zh_hans') {
      setLanguage('en');
    } else {
      setLanguage('zh');
    }
  }
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full space-y-4 font-sans">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
          <Search size={14} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'zh' ? '搜尋計算機...' : 'Search calculators...'}
          className="w-full bg-white/50 dark:bg-slate-950/60 border border-border-card focus:border-accent-pink-solid dark:focus:border-accent-blue-solid rounded-xl pl-9 pr-8 py-2 text-xs text-text-title placeholder-text-muted focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-title"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Categories Selector */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block font-display px-2">
          {language === 'zh' ? '科別篩選' : 'Specialties'}
        </span>
        <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
          {/* All category item */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
              selectedCategory === null
                ? 'bg-accent-blue dark:bg-accent-blue border border-accent-blue-solid/40 dark:border-accent-blue-solid/30 text-text-title dark:text-white font-semibold'
                : 'border border-transparent text-text-body dark:text-slate-400 hover:text-text-title dark:hover:text-slate-200 hover:bg-accent-pink/20 dark:hover:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity size={12} className={selectedCategory === null ? 'text-text-title dark:text-accent-blue-solid' : 'text-text-muted'} />
              <span>{language === 'zh' ? '所有分類' : 'All Specialties'}</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/70 dark:bg-slate-900/60 text-text-muted font-mono border border-border-card/30">
              {calculatorsList.length}
            </span>
          </button>

          {/* Individual Category buttons */}
          {Object.entries(CATEGORIES).map(([key, value]) => {
            const count = categoryCounts[key] || 0;
            if (count === 0) return null;
            const isSelected = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-accent-blue dark:bg-accent-blue border border-accent-blue-solid/40 dark:border-accent-blue-solid/30 text-text-title dark:text-white font-semibold'
                    : 'border border-transparent text-text-body dark:text-slate-400 hover:text-text-title dark:hover:text-slate-200 hover:bg-accent-pink/20 dark:hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getCategoryIcon(key)}
                  <span className="truncate max-w-[140px]">{tl(value)}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/70 dark:bg-slate-900/60 text-text-muted font-mono border border-border-card/30">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculators List */}
      <div className="flex-1 flex flex-col min-h-0 space-y-1 pt-1">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block font-display px-2">
          {language === 'zh' ? '醫學計算機' : 'Calculators'}
        </span>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 pb-4">
          {filteredCalculators.length === 0 ? (
            <div className="text-center py-6 text-text-muted text-xs">
              {language === 'zh' ? '未找到符合的計算機' : 'No calculators found'}
            </div>
          ) : (
            filteredCalculators.map((c) => {
              const isSelected = selectedCalculator.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCalculator(c);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-accent-pink/55 dark:bg-accent-blue border-accent-pink-solid dark:border-accent-blue-solid text-text-title dark:text-white font-bold shadow-md'
                      : 'bg-white/40 dark:bg-slate-950/20 border-border-card text-text-body dark:text-slate-450 hover:text-text-title dark:hover:text-slate-200 hover:border-accent-pink-solid/35 dark:hover:border-slate-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs truncate font-display font-medium">
                      {tl(c.name)}
                    </div>
                    <div className="text-[9px] text-text-muted truncate mt-0.5">
                      {tl(c.subtitle)}
                    </div>
                  </div>
                  <ChevronRight size={12} className="shrink-0 text-text-muted" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative grid-notebook-pattern">
      
      {/* Top light accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-pink-solid via-accent-blue-solid to-accent-beige z-50"></div>

      {/* Desktop Sidebar (Left Panel) */}
      <aside className="hidden lg:flex flex-col w-[300px] shrink-0 border-r border-border-card bg-bg-card/70 dark:bg-slate-950/30 backdrop-blur-md p-5 h-screen sticky top-0 z-30">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-accent-pink-solid/25 dark:bg-accent-blue/20 border border-accent-pink-solid/40 dark:border-accent-blue-solid/30 text-accent-pink-solid dark:text-accent-blue-solid">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold font-serif text-text-title tracking-tight m-0 leading-none">
              {t('app.title')}
            </h1>
            <p className="text-[9px] text-text-muted font-sans mt-0.5 leading-none">
              {t('app.tagline')}
            </p>
          </div>
        </div>

        {/* Sidebar Nav Panels */}
        <div className="flex-1 min-h-0">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sliding Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-bg-primary dark:bg-slate-950 border-r border-border-card backdrop-blur-xl p-5 z-50 flex flex-col h-full lg:hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-accent-pink-solid" />
                  <span className="font-bold font-serif text-text-title text-sm">{t('app.title')}</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-bg-secondary dark:hover:bg-slate-900 border border-transparent text-text-muted hover:text-text-title transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                {sidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area (Right Panel) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header/Navbar */}
        <header className="border-b border-border-card/40 bg-bg-card/30 dark:bg-slate-950/10 backdrop-blur-sm px-4 md:px-6 py-3 flex items-center justify-between gap-4 z-20">
          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-white/70 dark:bg-slate-900 border border-border-card text-text-body hover:text-text-title transition-all cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-sm font-bold font-serif text-text-title leading-none">
                {t('app.title')}
              </h1>
              <p className="text-[9px] text-text-muted font-sans mt-0.5">
                {t('app.tagline')}
              </p>
            </div>
          </div>

          {/* Desktop header tag */}
          <div className="hidden lg:block">
            <span className="text-[10px] text-text-muted bg-white/60 dark:bg-slate-900/60 border border-border-card px-3 py-1 rounded-full font-sans">
              Clinical Guidelines Tool
            </span>
          </div>

          {/* Top Actions: Keep header relatively clean, toggles placed here on desktop */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Round inline theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-border-card hover:border-accent-pink-solid dark:hover:border-accent-blue-solid text-text-body hover:text-text-title shadow-sm transition-all cursor-pointer select-none"
              title={theme === 'light' ? '切換至深色模式' : '切換至暖沙筆記模式'}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>
        </header>

        {/* Viewport content */}
        <main className="flex-1 px-4 md:px-8 py-6 max-w-5xl w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-[9px] text-text-muted font-sans select-none border-t border-border-card/30 bg-bg-card/5 mt-auto">
          <p>© 2026 Pocket MedCalc. All rights reserved.</p>
          <p className="mt-0.5 opacity-60">
            For clinical educational use only. Verify calculations independently. Source: MGH Pocket Medicine.
          </p>
        </footer>
      </div>

      {/* Floating Action Buttons on the Right Side (Inspired by the Study Journal mockup) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {/* Floating translation button with soft gradient glow */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLanguage}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-accent-pink-solid to-pink-400 dark:from-accent-blue-solid dark:to-cyan-400 shadow-[0_4px_14px_rgba(229,169,180,0.4)] dark:shadow-[0_4px_14px_rgba(6,182,212,0.3)] border border-white/20 cursor-pointer select-none"
          title={language === 'zh' ? 'English' : '中文'}
        >
          <span className="text-[10px] font-bold tracking-tight">
            {language === 'zh' ? 'EN' : '繁'}
          </span>
        </motion.button>

        {/* Floating theme toggle button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-rose-400 to-accent-pink-solid dark:from-cyan-500 dark:to-accent-blue-solid shadow-[0_4px_14px_rgba(229,169,180,0.4)] dark:shadow-[0_4px_14px_rgba(6,182,212,0.3)] border border-white/20 cursor-pointer select-none"
          title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </motion.button>
      </div>

    </div>
  );
};
