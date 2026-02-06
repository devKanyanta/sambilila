
import Image from 'next/image';
const LernopiaLogo = () => {
  return (
    <>
    <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');
        
        .name {
          font-family: "Fredoka";
            font-optical-sizing: auto;
            font-weight: 700;
            font-size: 1.4rem;
            font-style: normal;
            letter-spacing: 0.055em;
            font-variation-settings:
            "wdth" 100;
            color: #1f2937;
        }
        
        .tagline {
          font-family: 'Fredoka';
          font-weight: 500;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          margin-top: -0.25rem;
          color: #1f2937;
        }
      `}</style>
    <div className="flex items-center">
      <div className="w-16 h-16 relative">
        <Image
          src="/logo.png"
          alt="Lernopia Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

       <div>
              <div className="font-bold text-xl name">LERNOPIA</div>
              <div className="text-xs text-gray-600 tagline">Learn. Share. Create.</div>
            </div>
    </div>
    </>
    
  );
};

export default LernopiaLogo;