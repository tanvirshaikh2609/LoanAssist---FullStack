import clsx from 'clsx';
import logoImg from '../../assets/loanassist-logo.png';

const Logo = ({ 
  showText = true, 
  size = 'md', 
  className = '', 
  imgClassName = '',
  textClassName = '',
  light = false // For force-light on dark background headers/footers
}) => {
  const sizeMap = {
    xs: { icon: 'h-5 w-[33px]', text: 'text-lg', gap: 'gap-2' },
    sm: { icon: 'h-6 sm:h-7 w-[39px] sm:w-[46px]', text: 'text-xl', gap: 'gap-2.5' },
    md: { icon: 'h-7 sm:h-8 w-[46px] sm:w-[52px]', text: 'text-2xl', gap: 'gap-2.5' },
    lg: { icon: 'h-9 sm:h-10 w-[59px] sm:w-[66px]', text: 'text-3xl', gap: 'gap-3' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={clsx("inline-flex items-center select-none group", currentSize.gap, className)}>
      {/* Official Monogram Logo (LA Mark) with Light Mint / Emerald Treatment */}
      <div 
        className={clsx(
          "relative shrink-0 transition-all duration-200",
          currentSize.icon,
          imgClassName
        )}
      >
        <div
          className={clsx(
            "w-full h-full transition-all duration-200",
            light
              ? "bg-gradient-to-br from-[#D1FAE5] via-[#A7F3D0] to-[#34D399]"
              : "bg-gradient-to-br from-[#10B981] to-[#059669] dark:from-[#D1FAE5] dark:via-[#A7F3D0] dark:to-[#34D399]"
          )}
          style={{
            WebkitMaskImage: `url(${logoImg})`,
            maskImage: `url(${logoImg})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </div>

      {/* Brand Wordmark Text */}
      {showText && (
        <span 
          className={clsx(
            "font-extrabold tracking-tight transition-colors leading-none",
            currentSize.text,
            light 
              ? "text-white" 
              : "text-forest dark:text-white",
            textClassName
          )}
        >
          Loan<span className="text-primary dark:text-emerald-400 font-black">Assist</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
