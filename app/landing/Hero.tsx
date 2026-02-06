import { Upload, Sparkles } from 'lucide-react';
import { colors, gradients, theme } from '@/lib/theme';
import { useEffect, useRef, useState } from 'react';

export function Hero() {
  const suggestions = ['Guitarra', 'Fisiología', 'Mecánica cuántica', 'Frances'];
  const [isVisible, setIsVisible] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Add floating animation to decorative elements
    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = window.scrollY;
        const rate = scrolled * -0.5;
        containerRef.current.style.transform = `translateY(${rate}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 transition-transform duration-300"
      style={{ background: theme.backgrounds.main }}
    >
      <div className="text-center max-w-3xl mx-auto">
        {/* Decorative elements with animations */}
        <div className="relative mb-8 md:mb-12">
          <Sparkles 
            className="absolute -left-8 md:-left-12 top-0 w-6 h-6 md:w-8 md:h-8 animate-pulse"
            style={{ color: colors.primary[400] }}
          />
          <div 
            className="absolute -right-4 md:-right-8 top-6 md:top-8 w-12 h-12 md:w-16 md:h-16 rounded-lg transform rotate-12 opacity-50 animate-float"
            style={{ 
              background: colors.primary[400],
              backgroundImage: gradients.primary,
              animationDuration: '3s',
              animationDelay: '0.5s'
            }}
          ></div>
          
          {/* Main heading with staggered animation */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 
              ref={headingRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 md:mb-6 leading-tight"
              style={{ color: theme.text.primary }}
            >
              Generate Impressive
              <br className="hidden sm:block" />
              Quizzes{' '}
              <span className="relative inline-block">
                <span className="relative z-10">In a Flash</span>
                <span 
                  className="absolute bottom-1 sm:bottom-2 left-0 w-full h-2 sm:h-3 -z-0 animate-pulse-glow"
                  style={{ 
                    background: colors.primary[400],
                    animationDuration: '2s'
                  }}
                ></span>
              </span>
            </h1>
          </div>
        </div>

        {/* Description with fade-in animation */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p 
            className="mb-6 md:mb-8 text-base sm:text-lg max-w-2xl mx-auto px-4"
            style={{ color: theme.text.secondary }}
          >
            Create AI-powered flashcards and quizzes from any topic.
            Study faster, retain more, and learn your way.
          </p>
        </div>

        {/* Input and CTA with staggered animations */}
        <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6 md:mb-8 px-4">
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder="Create a quiz about"
                className="w-full px-4 py-3 sm:py-4 rounded-lg focus:outline-none transition-all duration-300 text-sm sm:text-base"
                style={{
                  border: `1px solid ${theme.borders.light}`,
                  color: theme.text.primary,
                  backgroundColor: theme.backgrounds.card,
                  boxShadow: theme.shadows.sm,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.borders.focus;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.borders.focus}20`;
                  e.target.style.transform = 'scale(1.02)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.borders.light;
                  e.target.style.boxShadow = theme.shadows.sm;
                  e.target.style.transform = 'scale(1)';
                }}
              />
              <Upload 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110" 
                style={{ color: colors.neutral[400] }}
              />
            </div>
            <button 
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:opacity-90 transition-all duration-300 active:scale-95 text-sm sm:text-base"
              style={{
                background: colors.primary[600],
                color: theme.text.inverted,
                boxShadow: theme.shadows.colored.primary,
                border: `1px solid ${colors.primary[700]}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.primary[700];
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.primary[600];
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadows.colored.primary;
              }}
            >
              Generate
            </button>
          </div>
        </div>

        {/* Suggestions with staggered fade-in */}
        <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center px-4">
            <p 
              className="text-xs sm:text-sm mb-3"
              style={{ color: theme.text.light }}
            >
              No idea? Check out these suggestions
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all duration-300 text-xs sm:text-sm hover:scale-105 active:scale-95"
                  style={{
                    background: theme.states.hover.primary,
                    color: colors.primary[700],
                    border: `1px solid ${colors.primary[200]}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.primary[100];
                    e.currentTarget.style.borderColor = colors.primary[300];
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.states.hover.primary;
                    e.currentTarget.style.borderColor = colors.primary[200];
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(12deg);
          }
          50% {
            transform: translateY(-10px) rotate(12deg);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
            transform: scaleX(1);
          }
          50% {
            opacity: 0.8;
            transform: scaleX(1.05);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          .animate-float {
            animation-duration: 4s;
            opacity: 0.3;
          }
          
          .animate-pulse-glow {
            animation-duration: 3s;
          }
        }
        
        /* Tablet optimizations */
        @media (min-width: 641px) and (max-width: 1024px) {
          .animate-float {
            animation-duration: 3.5s;
          }
        }
      `}</style>
    </section>
  );
}