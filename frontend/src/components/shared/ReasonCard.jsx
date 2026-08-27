import { XCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ReasonCard = ({ reason }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-danger/5 border border-danger/20"
    >
      <XCircle size={20} className="text-danger shrink-0 mt-0.5" />
      <p className="text-sm font-medium text-text-primary leading-relaxed">{reason}</p>
    </motion.div>
  );
};

export const SuggestionCard = ({ suggestion }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20"
    >
      <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
      <p className="text-sm font-medium text-text-primary leading-relaxed">{suggestion}</p>
    </motion.div>
  );
};
