/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Accordion } from './Accordion';
import { calculatorsList, type Calculator } from '../calculators/definitions';
import { Copy, Check, RotateCcw, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface DynamicCalculatorProps {
  calculator: Calculator;
  onSelectCalculator?: (calculator: Calculator) => void;
}

export const DynamicCalculator: React.FC<DynamicCalculatorProps> = ({ calculator, onSelectCalculator }) => {
  const { language, t } = useLanguage();
  const displayLang = language === 'zh_hans' ? 'zh' : language;
  const { theme } = useTheme();

  // Dynamic state dictionary for form inputs
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initialValues: Record<string, any> = {};
    calculator.inputs.forEach((input) => {
      const savedVal = sessionStorage.getItem(`medcalc_input_${input.id}`);
      if (savedVal !== null) {
        if (input.type === 'number') {
          initialValues[input.id] = savedVal === '' ? '' : parseFloat(savedVal);
        } else if (input.type === 'boolean') {
          initialValues[input.id] = savedVal === 'true';
        } else {
          initialValues[input.id] = savedVal;
        }
      } else {
        initialValues[input.id] = input.defaultValue;
      }
    });
    return initialValues;
  });
  const [copied, setCopied] = useState<boolean>(false);
  const [ehrCopied, setEhrCopied] = useState<boolean>(false);

  const handleChange = (id: string, val: any) => {
    setValues((prev) => ({ ...prev, [id]: val }));
    sessionStorage.setItem(`medcalc_input_${id}`, val !== null && val !== undefined ? val.toString() : '');
  };

  const resetAll = () => {
    const resetValues: Record<string, any> = {};
    calculator.inputs.forEach((input) => {
      resetValues[input.id] = input.defaultValue;
      sessionStorage.removeItem(`medcalc_input_${input.id}`);
    });
    setValues(resetValues);
    setCopied(false);
  };

  // Run the calculation function
  const result = calculator.calculate(values);

  // Copy clinical note function
  const copyClinicalNote = () => {
    const lang = language;
    
    // Format input key-value list for clear medical documentation
    const inputLines = calculator.inputs.map((input) => {
      const val = values[input.id];
      let valStr: string;
      if (input.type === 'boolean') {
        valStr = val ? (lang === 'zh' ? '是 (Yes)' : 'Yes') : (lang === 'zh' ? '否 (No)' : 'No');
      } else if (input.type === 'select') {
        const opt = input.options?.find((o) => o.value === val);
        valStr = opt ? opt.label[lang] : val;
      } else {
        valStr = val !== undefined && val !== null && val !== '' ? `${val} ${input.unit || ''}` : '--';
      }
      return ` - ${input.name[lang]}: ${valStr}`;
    }).join('\n');

    // Format final computed value text
    let resultStr = '';
    if (result.score !== undefined) {
      resultStr = `${result.score} ${lang === 'zh' ? '分' : 'points'}`;
    } else if (result.value !== undefined) {
      resultStr = `${result.value.toFixed(2)}${result.unit || ''}`;
    } else if (result.valueText !== undefined) {
      resultStr = result.valueText;
    }

    const riskStr = result.riskLevel ? result.riskLevel[lang] : '';
    const recommendationStr = result.recommendation ? result.recommendation[lang] : '';
    const descriptionStr = result.description ? result.description[lang] : '';

    const note = `[Clinical Note] ${calculator.name[lang]}: ${resultStr}\n` +
                 (riskStr ? `Risk Level / Interpretation: ${riskStr}\n` : '') +
                 `Inputs:\n${inputLines}\n` +
                 (descriptionStr ? `Detail: ${descriptionStr}\n` : '') +
                 (recommendationStr ? `Recommendation: ${recommendationStr}` : '');
    
    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyEhrTemplate = () => {
    const lang = language;
    
    // Create a concise comma-separated summary of inputs
    const inputSummary = calculator.inputs.map((input) => {
      const val = values[input.id];
      if (val === undefined || val === null || val === '') return null;
      let valStr: string;
      if (input.type === 'boolean') {
        if (val) {
          return `${input.name[lang]}`;
        } else {
          return null; // Skip false values to keep it extremely clean
        }
      } else if (input.type === 'select') {
        const opt = input.options?.find((o) => o.value === val);
        if (!opt) return null;
        // Clean points annotations like (+1pt) to keep clinical note clean
        valStr = opt.label[lang].replace(/\(\+?-?\d+分\)/g, '').replace(/\(\+?-?\d+ pts?\)/g, '').trim();
      } else {
        valStr = `${val} ${input.unit || ''}`.trim();
      }
      return `${input.name[lang]}: ${valStr}`;
    }).filter(Boolean).join(', ');

    let resultStr = '';
    if (result.score !== undefined) {
      resultStr = `${result.score} ${lang === 'zh' ? '分' : 'pts'}`;
    } else if (result.value !== undefined) {
      resultStr = `${result.value.toFixed(1)}${result.unit || ''}`;
    } else if (result.valueText !== undefined) {
      resultStr = result.valueText;
    }

    const riskStr = result.riskLevel ? result.riskLevel[lang] : '';
    const recommendationStr = result.recommendation ? result.recommendation[lang] : '';

    const note = `[${calculator.name[lang]}] ${resultStr}${riskStr ? ` (${riskStr})` : ''}\n` +
                 `- 指標: ${inputSummary || (lang === 'zh' ? '無特異指標' : 'None')}\n` +
                 (recommendationStr ? `- 處置: ${recommendationStr}` : '');

    navigator.clipboard.writeText(note);
    setEhrCopied(true);
    setTimeout(() => setEhrCopied(false), 2000);
  };

  const getGlowBgColor = (riskColorStr: string | undefined) => {
    if (!riskColorStr) return 'bg-accent-blue-solid';
    if (riskColorStr.includes('emerald') || riskColorStr.includes('green')) return 'bg-emerald-500';
    if (riskColorStr.includes('amber') || riskColorStr.includes('yellow')) return 'bg-amber-500';
    if (riskColorStr.includes('rose') || riskColorStr.includes('red')) return 'bg-rose-500';
    return 'bg-accent-blue-solid';
  };

  const getThemeAdjustedRiskColor = (riskColorStr: string | undefined) => {
    if (!riskColorStr) return 'text-accent-blue-solid bg-accent-blue/30 border-accent-blue-solid/40 dark:text-cyan-400 dark:bg-cyan-950/40 dark:border-cyan-800/40';
    if (theme === 'dark') return riskColorStr;

    // For light mode, map standard dark classes to beautiful Morandi/pastel colors
    if (riskColorStr.includes('rose') || riskColorStr.includes('red')) {
      return 'text-red-750 bg-red-50/90 border border-red-200 shadow-sm';
    }
    if (riskColorStr.includes('amber') || riskColorStr.includes('yellow')) {
      return 'text-amber-800 bg-amber-50/90 border border-amber-200 shadow-sm';
    }
    if (riskColorStr.includes('emerald') || riskColorStr.includes('green')) {
      return 'text-emerald-800 bg-emerald-50/90 border border-emerald-250/70 shadow-sm';
    }
    return 'text-text-body bg-bg-secondary border border-border-card shadow-sm';
  };

  // Determine what score or value to display in the dial
  const showText = result.score !== undefined 
    ? result.score.toString() 
    : (result.value !== undefined ? result.value.toFixed(1) : (result.valueText ? result.valueText : '--'));
  
  const showUnit = result.score !== undefined 
    ? t('common.points') 
    : (result.unit ? result.unit : '');

  // Separate boolean inputs from others to group them in a nice layout
  const booleanInputs = calculator.inputs.filter((i) => i.type === 'boolean');
  const normalInputs = calculator.inputs.filter((i) => i.type !== 'boolean');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full font-sans">
      {/* Inputs Section */}
      <div className="lg:col-span-7 glass-panel p-6 md:p-8 rounded-3xl border border-border-card shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-border-card/40 pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif tracking-wide text-text-title">
              {calculator.name[displayLang]}
            </h2>
            <p className="text-xs text-text-muted mt-1">
              {calculator.subtitle[displayLang]}
            </p>
          </div>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/70 dark:bg-slate-800/60 hover:bg-accent-pink/30 dark:hover:bg-slate-700/80 border border-border-card dark:border-slate-700/40 text-text-body dark:text-slate-300 transition-all cursor-pointer select-none"
          >
            <RotateCcw size={12} />
            {t('common.reset')}
          </button>
        </div>

        {/* Inputs List */}
        <div className="space-y-5">
          {/* Render select & number inputs */}
          {normalInputs.map((input) => (
            <div key={input.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-title dark:text-slate-350 font-display block">
                  {input.name[displayLang]}
                </label>
                {input.unit && <span className="text-xs text-text-muted font-sans">{input.unit}</span>}
              </div>

              {input.type === 'number' && (
                <div className="space-y-2">
                  <input
                    type="number"
                    value={values[input.id] ?? ''}
                    min={input.min}
                    max={input.max}
                    step={input.step ?? 'any'}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange(input.id, val === '' ? '' : parseFloat(val));
                    }}
                    className="w-full bg-white/70 dark:bg-slate-950/60 border border-border-card dark:border-slate-800 focus:border-accent-pink-solid dark:focus:border-accent-blue-solid rounded-xl px-4 py-2.5 text-sm text-text-title dark:text-white placeholder-text-muted focus:outline-none transition-all font-sans"
                  />
                  {input.min !== undefined && input.max !== undefined && (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-text-muted font-sans">{input.min}</span>
                      <input
                        type="range"
                        min={input.min}
                        max={input.max}
                        step={input.step ?? 1}
                        value={values[input.id] ?? input.min}
                        onChange={(e) => handleChange(input.id, parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-bg-secondary dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent-pink-solid dark:accent-accent-blue-solid"
                      />
                      <span className="text-[10px] text-text-muted font-sans">{input.max}</span>
                    </div>
                  )}
                </div>
              )}

              {input.type === 'select' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {input.options?.map((opt) => {
                    const isSelected = values[input.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange(input.id, opt.value)}
                        className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer text-xs relative ${
                          isSelected
                            ? 'bg-accent-blue/60 dark:bg-accent-blue/30 border-accent-blue-solid/65 dark:border-accent-blue-solid text-text-title dark:text-white font-semibold shadow-sm'
                            : 'bg-white/50 dark:bg-slate-950/40 border-border-card dark:border-border-card/50 text-text-body dark:text-slate-400 hover:bg-accent-pink/25 dark:hover:bg-slate-900/40 hover:text-text-title dark:hover:text-slate-200 hover:border-accent-pink-solid/50 dark:hover:border-slate-700'
                        }`}
                      >
                        {opt.label[displayLang]}
                      </button>
                    );
                  })}
                </div>
              )}

              {input.tooltip && (
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  * {input.tooltip[displayLang]}
                </p>
              )}
            </div>
          ))}

          {/* Render checklist boolean parameters as elegant grids */}
          {booleanInputs.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs uppercase tracking-widest text-text-muted font-bold font-display">
                {language === 'zh' ? '評估項目與臨床指標' : 'Criteria & Risk Indicators'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {booleanInputs.map((input) => (
                  <button
                    key={input.id}
                    type="button"
                    onClick={() => handleChange(input.id, !values[input.id])}
                    className={`flex items-start justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      values[input.id]
                        ? 'bg-accent-pink/40 dark:bg-accent-pink border-accent-pink-solid dark:border-accent-pink-solid/60 text-text-title dark:text-white font-semibold shadow-sm'
                        : 'bg-white/50 dark:bg-slate-950/30 border-border-card dark:border-border-card hover:bg-accent-pink/20 dark:hover:bg-slate-900/20 hover:border-accent-pink-solid/40 dark:hover:border-slate-800'
                    }`}
                  >
                    <div className="flex-1 pr-3">
                      <div className="text-xs font-semibold text-text-title dark:text-slate-250 font-display leading-snug">
                        {input.name[displayLang]}
                      </div>
                      {input.tooltip && (
                        <p className="text-[9px] text-text-muted mt-1 font-sans leading-normal">
                          {input.tooltip[displayLang]}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-7 h-4 rounded-full p-0.5 mt-0.5 transition-colors duration-200 shrink-0 ${
                        values[input.id] ? 'bg-accent-pink-solid dark:bg-accent-blue-solid' : 'bg-bg-secondary dark:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 transform ${
                          values[input.id] ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Output / Result Section */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-border-card shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <h3 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-4 font-display">
            {t('common.result')}
          </h3>

          {/* Elegant Radial Dial / Central score bubble */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-5 mt-1">
            {/* Outer soft double borders */}
            <div className="absolute inset-0 rounded-full border border-border-card/60 dark:border-slate-800/80"></div>
            <div className="absolute inset-2 rounded-full border border-border-card dark:border-slate-800/65"></div>

            {/* Central color background based on result risk level with blur/glow */}
            <div
              className={`absolute inset-3 rounded-full filter blur-[6px] opacity-10 dark:opacity-20 transition-all duration-500 ${getGlowBgColor(
                result.riskColor
              )}`}
            ></div>

            {/* Central Values Display */}
            <div className="z-10 flex flex-col items-center px-3">
              <motion.span
                key={showText}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold font-serif leading-none text-text-title dark:text-white tracking-tight break-all max-w-full"
              >
                {showText}
              </motion.span>
              {showUnit && (
                <span className="text-[9px] font-bold text-text-muted dark:text-slate-400 uppercase mt-1 tracking-wider font-display">
                  {showUnit}
                </span>
              )}
            </div>
          </div>

          {/* Risk Badge */}
          {result.riskLevel && (
            <div
              className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide flex items-center gap-1.5 mb-5 transition-all duration-300 ${
                getThemeAdjustedRiskColor(result.riskColor)
              }`}
            >
              {(result.riskColor?.includes('rose') || result.riskColor?.includes('red')) && <AlertTriangle size={12} className="animate-pulse" />}
              {result.riskLevel[displayLang]}
            </div>
          )}

          {/* Explanatory Details */}
          <div className="space-y-4 w-full">
            <div className="border-t border-border-card/40 my-3"></div>

            <div className="text-left space-y-3.5">
              {result.description[displayLang] && (
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase block font-display tracking-widest mb-1.5">
                    {t('common.risk')}
                  </span>
                  <p className="text-xs text-text-body dark:text-slate-300 leading-relaxed">
                    {result.description[displayLang]}
                  </p>
                </div>
              )}

              {result.recommendation?.[displayLang] && (
                <div className="bg-bg-secondary/40 dark:bg-slate-950/45 border border-border-card dark:border-slate-850 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-accent-pink-solid dark:text-accent-blue-solid uppercase block font-display tracking-widest mb-1.5">
                    {t('common.interpretation')}
                  </span>
                  <p className="text-xs text-text-title dark:text-slate-200 font-semibold leading-relaxed">
                    {result.recommendation[displayLang]}
                  </p>
                </div>
              )}

              {/* FENa -> FEUrea Smart Link */}
              {calculator.id === 'fena' && onSelectCalculator && (
                <div
                  onClick={() => {
                    const feureaCalc = calculatorsList.find((c) => c.id === 'feurea');
                    if (feureaCalc) onSelectCalculator(feureaCalc);
                  }}
                  className="mt-3 bg-accent-blue/20 hover:bg-accent-blue/35 dark:bg-cyan-950/30 dark:hover:bg-cyan-950/50 border border-accent-blue-solid/30 dark:border-cyan-500/20 hover:border-accent-blue-solid/50 dark:hover:border-cyan-500/40 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 group shadow-sm animate-fade-in"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={14} className="text-accent-blue-solid dark:text-cyan-400 shrink-0 group-hover:scale-110 transition-transform animate-pulse" />
                    <span className="text-xs text-text-title dark:text-cyan-300 font-medium text-left leading-normal">
                      {t('common.smart_link.diuretic')}
                    </span>
                  </div>
                  <ExternalLink size={12} className="text-text-muted dark:text-cyan-400/70 group-hover:text-text-title dark:group-hover:text-cyan-300 transition-colors shrink-0 ml-1.5" />
                </div>
              )}

              {/* Anion Gap -> Winter's Formula Smart Link */}
              {calculator.id === 'anion-gap' && result.value !== undefined && result.value > 12 && onSelectCalculator && (
                <div
                  onClick={() => {
                    const wintersCalc = calculatorsList.find((c) => c.id === 'winters-formula');
                    if (wintersCalc) onSelectCalculator(wintersCalc);
                  }}
                  className="mt-3 bg-accent-blue/20 hover:bg-accent-blue/35 dark:bg-cyan-950/30 dark:hover:bg-cyan-950/50 border border-accent-blue-solid/30 dark:border-cyan-500/20 hover:border-accent-blue-solid/50 dark:hover:border-cyan-500/40 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 group shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={14} className="text-accent-blue-solid dark:text-cyan-400 shrink-0 group-hover:scale-110 transition-transform animate-pulse" />
                    <span className="text-xs text-text-title dark:text-cyan-300 font-medium text-left leading-normal">
                      {t('common.smart_link.hagma')}
                    </span>
                  </div>
                  <ExternalLink size={12} className="text-text-muted dark:text-cyan-400/70 group-hover:text-text-title dark:group-hover:text-cyan-300 transition-colors shrink-0 ml-1.5" />
                </div>
              )}
            </div>

            <div className="border-t border-border-card/40 my-3"></div>

            {/* Actions: Copy Note & EHR Copy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              <button
                onClick={copyClinicalNote}
                disabled={result.error !== undefined}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm select-none ${
                  result.error
                    ? 'bg-bg-secondary/60 text-text-muted border border-border-card/50 cursor-not-allowed'
                    : copied
                    ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-emerald-700/20 animate-pulse'
                    : 'bg-white/95 dark:bg-slate-800/80 hover:bg-accent-pink/30 dark:hover:bg-slate-700/80 border border-border-card dark:border-slate-750 text-text-body dark:text-slate-300 hover:text-text-title dark:hover:text-white shadow-sm'
                }`}
              >
                {copied ? <Check size={13} className="shrink-0" /> : <Copy size={13} className="shrink-0" />}
                <span className="truncate">{copied ? t('common.copied') : t('common.copy')}</span>
              </button>
              
              <button
                onClick={copyEhrTemplate}
                disabled={result.error !== undefined}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm select-none ${
                  result.error
                    ? 'bg-bg-secondary/60 text-text-muted border border-border-card/50 cursor-not-allowed'
                    : ehrCopied
                    ? 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-emerald-700/20'
                    : 'bg-accent-pink-solid dark:bg-cyan-600 hover:bg-accent-pink-solid/95 dark:hover:bg-cyan-505 text-white shadow-md hover:shadow-lg shadow-pink-200/40 dark:shadow-cyan-600/10'
                }`}
              >
                {ehrCopied ? <Check size={13} className="shrink-0" /> : <Copy size={13} className="shrink-0" />}
                <span className="truncate">{ehrCopied ? t('common.ehr_copied') : t('common.ehr_copy')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* References & Pearls Accordion */}
      <div className="lg:col-span-12 space-y-4">
        <Accordion title={t('common.clinical_pearls')}>
          <div className="space-y-4">
            {/* Pearls list */}
            {calculator.pearls[displayLang] && calculator.pearls[displayLang].length > 0 && (
              <div className="bg-bg-secondary/45 dark:bg-slate-950/30 p-4 rounded-xl border border-border-card/60 dark:border-slate-800/40 space-y-2.5">
                <span className="text-[10px] font-bold text-accent-pink-solid dark:text-accent-blue-solid uppercase tracking-widest block font-display">
                  {language === 'zh' ? '臨床指引與核心觀點' : 'Clinical Directives & Insights'}
                </span>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-text-body dark:text-slate-350 font-sans">
                  {calculator.pearls[displayLang].map((pearl, idx) => (
                    <li key={idx} className="leading-relaxed">{pearl}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formula Logic and MDCalc Reference */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-border-card/20 text-xs">
              <div className="space-y-1 text-text-muted">
                <span className="font-semibold font-display text-[10px] uppercase tracking-wider block">
                  {t('common.reference')}
                </span>
                <code className="text-[11px] bg-bg-secondary/70 dark:bg-slate-950/40 px-2 py-1 rounded border border-border-card dark:border-slate-800 font-mono text-accent-pink-solid dark:text-accent-blue-solid break-all inline-block">
                  {calculator.reference}
                </code>
              </div>
              
              {calculator.mdcalcLink && (
                <a
                  href={calculator.mdcalcLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-accent-pink-solid dark:text-accent-blue-solid hover:underline font-semibold font-display transition-colors hover:underline shrink-0 text-xs"
                >
                  {language === 'zh' ? '在 MDCalc 上查看' : 'Verify on MDCalc'}
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </Accordion>
      </div>
    </div>
  );
};
