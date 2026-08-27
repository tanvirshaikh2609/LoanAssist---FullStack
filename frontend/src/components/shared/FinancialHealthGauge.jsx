import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { CheckCircle2, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { useTheme } from '../../context/ThemeContext';

const FinancialHealthGauge = ({ health }) => {
  const { isDark } = useTheme();
  if (!health) return null;
  
  const { score, grade, strengths = [], weaknesses = [], recommendations = [] } = health;
  
  const getColor = () => {
    if (grade === 'Excellent' || grade === 'Good') return isDark ? '#22C55E' : '#166534';
    if (grade === 'Fair') return '#F59E0B';
    return '#EF4444';
  };

  const chartData = [{ name: 'Score', value: score, fill: getColor() }];

  return (
    <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-border-subtle shadow-sm mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={18} className="text-amber-500" />
        <h3 className="text-xl font-bold text-forest">Financial Health Diagnostic</h3>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        {/* Gauge */}
        <div className="flex flex-col items-center justify-center shrink-0 bg-surface-subtle p-6 rounded-3xl border border-border-subtle">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" cy="50%" 
                innerRadius="78%" outerRadius="100%" 
                barSize={12} 
                data={chartData} 
                startAngle={210} endAngle={-30}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar 
                  minAngle={15} 
                  background={{ fill: isDark ? '#1F382B' : '#E2EBE5' }} 
                  clockWise 
                  dataKey="value" 
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
              <div className="flex items-baseline font-black text-4xl text-forest">
                <AnimatedCounter value={score} duration={1.2} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">/ 100 Health</span>
            </div>
          </div>
          
          <div className="mt-1 text-center">
            <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              grade === 'Excellent' || grade === 'Good' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-primary dark:text-emerald-300 border border-border-emerald' :
              grade === 'Fair' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300' : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200'
            }`}>
              {grade} Standing
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-subtle p-5 rounded-2xl border border-border-subtle">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest mb-3 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-primary dark:text-emerald-400" />
                Strengths
              </h4>
              {strengths.length > 0 ? (
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-emerald-400 mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-text-secondary italic">No clear strengths identified.</p>
              )}
            </div>

            <div className="bg-surface-subtle p-5 rounded-2xl border border-border-subtle">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest mb-3 flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-500" />
                Optimization Points
              </h4>
              {weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-text-secondary italic">No critical concerns identified.</p>
              )}
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="pt-4 border-t border-border-subtle">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest mb-3 flex items-center gap-2">
                <Lightbulb size={15} className="text-primary dark:text-emerald-400" />
                Strategic Recommendations
              </h4>
              <ul className="space-y-2">
                {recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-emerald-400 mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthGauge;
