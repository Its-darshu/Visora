import React from 'react';
import { useNavigate } from 'react-router-dom';

// Figma asset URLs - these would need to be replaced with actual hosted images
const imgImage5 = "http://localhost:3845/assets/8c7cbc264e1a1b0bf8ff1a3b63eff8557ba2699a.png";
const imgImage11 = "http://localhost:3845/assets/2d77adbc1454fcc900966fe00c8271f8c74f530d.png";
const imgImage10 = "http://localhost:3845/assets/7aaddfc06f95636c236614045695e56d8af03ba7.png";
const imgImage12 = "http://localhost:3845/assets/7ffb3174034c8c0936a339affbdb3db1b0c61f27.png";
const imgImage13 = "http://localhost:3845/assets/d45c930b52a060fb25f3602bfa5142c921abca32.png";
const imgVector2 = "http://localhost:3845/assets/0754963926bcfcd3866dfd662375ce6c73a806d1.svg";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    {
      bg: '#2f00ff',
      image: imgImage11,
      text: 'Generate image from text description',
      textColor: 'text-white'
    },
    {
      bg: '#ffc300',
      image: imgImage10,
      text: 'Turn images into meaningful descriptions.',
      textColor: 'text-black'
    },
    {
      bg: '#ff7700',
      image: imgImage12,
      text: 'Improve image quality with intelligent precision.',
      textColor: 'text-white'
    },
    {
      bg: '#3cff00',
      image: imgImage13,
      text: 'Improve image quality with intelligent precision.',
      textColor: 'text-black'
    }
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden" style={{ fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header className="flex items-center justify-between p-1.5">
        {/* Visora Logo/Title */}
        <div 
          className="flex-1 bg-white border-2 border-black flex items-center justify-start h-[89px] pl-6"
          style={{ 
            fontFamily: "'Silkscreen', monospace",
            boxShadow: '5px 4px 0px 0px #000000'
          }}
        >
          <h1 className="text-[40px] font-bold text-black tracking-wider">VISORA</h1>
        </div>
        
        {/* Signup Button */}
        <button 
          onClick={() => navigate('/auth')}
          className="bg-[#ffa600] border-2 border-black h-[89px] px-8 flex items-center justify-center hover:bg-[#ff9500] transition-colors ml-2"
          style={{ 
            fontFamily: "'Silkscreen', monospace",
            boxShadow: '5px 4px 0px 0px #000000'
          }}
        >
          <span className="text-[24px] text-black font-normal">SIGNUP</span>
        </button>
      </header>

      {/* Background Image - Centered and Faded */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[752px] h-[752px] pointer-events-none z-0">
        <img 
          src={imgImage5} 
          alt="" 
          className="w-full h-full object-contain opacity-[0.27]"
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Heading Section */}
        <div className="flex flex-col items-center gap-6 mx-auto mt-14 px-4" style={{ maxWidth: '50%' }}>
          {/* Main Heading */}
          <div className="text-center">
            <h2 
              className="text-[32px] leading-tight text-black"
              style={{ fontFamily: "'Silkscreen', monospace" }}
            >
              A VISORA<br />
              ALL-IN-ONE WORKSPACE OF AI<br />
              FOR STUDENT'S
            </h2>
          </div>

          {/* Sub Heading */}
          <p className="text-center text-[15px] text-black leading-relaxed" style={{ fontFamily: "'Product Sans', sans-serif", fontWeight: 300 }}>
            Powerful AI tools for text, image, voice, and audio processing. Choose a feature below to get started.
          </p>

          {/* Get Started Button */}
          <button 
            onClick={() => navigate('/auth')}
            className="relative bg-black text-white px-16 h-[71px] overflow-hidden hover:shadow-[3px_3px_0px_0px_#e07400] transition-shadow"
            style={{ 
              fontFamily: "'Silkscreen', monospace",
              boxShadow: '5px 5px 0px 0px #000000',
              border: 'none'
            }}
          >
            <span className="relative z-10 text-[24px]">GET STARTED</span>
            <div 
              className="absolute top-0 right-0 bottom-0 w-[180px] pointer-events-none"
              style={{
                background: 'linear-gradient(to left, #ffa500 0%, rgba(255, 165, 0, 0.8) 40%, transparent 100%)'
              }}
            />
          </button>
        </div>

        {/* Cards Section */}
        <div className="flex flex-wrap items-stretch justify-center gap-6 mt-20 px-4 pb-20 max-w-[1500px] mx-auto">
          {cards.map((card, idx) => (
            <div 
              key={idx}
              className="border-2 border-black w-[341px] min-h-[317px] flex flex-col items-center p-5 hover:shadow-lg transition-shadow flex-shrink-0"
              style={{ 
                backgroundColor: card.bg,
                boxShadow: '5px 4px 0px 0px #000000'
              }}
            >
              {/* Card Image */}
              <div className="border-2 border-black w-full h-[197px] bg-white overflow-hidden mb-5 flex-shrink-0">
                <img 
                  src={card.image} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Card Text */}
              <p 
                className={`text-[24px] text-center leading-tight ${card.textColor}`}
                style={{ fontFamily: "'Product Sans', sans-serif", fontWeight: 500 }}
              >
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Product+Sans:wght@300;400;500;700&display=swap');
      `}</style>
    </div>
  );
};

export default LandingPage;
