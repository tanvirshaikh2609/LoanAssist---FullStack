import { useState, useEffect, useRef } from 'react';
import { useInView, animate } from 'framer-motion';

const AnimatedCounter = ({ 
  value, 
  label, 
  duration = 1.2, 
  suffix = '', 
  prefix = '',
  decimals = 0,
  className = "text-2xl font-bold text-text-primary",
  labelClassName = "text-sm text-text-secondary mt-1 font-medium",
  wrapperClassName = "flex flex-col items-center"
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prevValue = useRef(0);

  useEffect(() => {
    if (!isInView) return;

    const end = typeof value === 'number' ? value : parseFloat(value.toString().replace(/,/g, '')) || 0;
    
    if (prevValue.current === end && count === end) return;

    const controls = animate(prevValue.current, end, {
      duration: duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setCount(latest);
      },
      onComplete: () => {
        prevValue.current = end;
      }
    });

    return () => controls.stop();
  }, [isInView, value, duration]);

  const formattedCount = decimals > 0 
    ? count.toFixed(decimals)
    : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(count));

  return (
    <div ref={ref} className={wrapperClassName}>
      <div className={className}>
        {prefix}{formattedCount}{suffix}
      </div>
      {label && <div className={labelClassName}>{label}</div>}
    </div>
  );
};

export default AnimatedCounter;

