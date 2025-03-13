import React from 'react';
import Login from '../component/Login';
import RotatingText from '../Pages/creative/textCreative';
import { FiArrowRight } from 'react-icons/fi';
import TextPressure from '../Pages/creative/TextPressure';

const Loginpage = () => {
  return (
    <div className="flex h-screen w-full ">
      {/* Left Column - Black with enhanced creative design */}
      <div className="w-1/2 bg-gradient-to-br from-black to-gray-900 hidden md:block relative overflow-hidden">
        {/* Enhanced abstract shapes in background */}
        <div className="absolute top-16 left-8 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-24 right-12 w-90 h-80 rounded-full bg-cyan-500/10 blur-2xl animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute top-1/2 right-24 w-40 h-40 rounded-full bg-purple-500/10 blur-2xl animate-pulse" style={{animationDuration: '12s'}}></div>
        
        {/* Animated geometric elements */}
        <div className="absolute top-20 right-20 w-20 h-20 border border-cyan-500/20 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-32 left-16 w-32 h-32 border border-blue-500/20 rounded-full animate-ping" style={{animationDuration: '15s', opacity: '0.2'}}></div>
        
        <div className="flex flex-col h-full justify-center items-center text-white px-8 relative z-10">
          {/* Accent line with animation */}
          <div className="w-40 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mb-12 animate-pulse"></div>
          
          {/* Enhanced headline with bigger impact */}
          <h1 className="text-6xl font-extrabold mb-8 tracking-tight text-center leading-tight">
            Elevate Your <br />
            {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">Workflow</span> */}
            <div style={{position: 'relative', height: '80px'}}>
                <TextPressure
                    text="WORKFLOW!"
                    flex={true}
                    alpha={false}
                    stroke={false}
                    width={true}
                    weight={true}
                    italic={true}
                    textColor="#ffffff"
                    strokeColor="#ff0000"
                    minFontSize={36}
                />
                </div>
          </h1>
          
          {/* Enhanced rotating text section */}
          <div className="my-10 flex flex-col items-center">
            <div className="text-3xl font-medium mb-4 tracking-wide">We Make It</div>
            <div className="h-16 transform scale-125">
              <RotatingText
                texts={['SIMPLE', 'EFFICIENT', 'POWERFUL', 'SEAMLESS', 'SECURE']}
                mainClassName="px-6 py-2 text-white font-extrabold overflow-hidden rounded-lg text-2xl tracking-wider"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </div>
          </div>
          
          {/* Enhanced tagline */}
          <p className="text-gray-300 text-xl max-w-md mt-4 text-center font-light tracking-wide">
            Join thousands of innovative teams already using our platform to collaborate without boundaries.
          </p>
          
          {/* Enhanced testimonial with better styling */}
          <div className="mt-16 flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="w-14 h-14 rounded-full overflow-hidden mr-4 ring-2 ring-cyan-400">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <blockquote className="italic text-gray-200 max-w-xs">
                "it works it's good."
              </blockquote>
              <div className="flex items-center mt-2">
                <div className="w-4 h-1 bg-cyan-400 mr-2"></div>
                <p className="text-sm text-cyan-400 font-medium">Developer's Dad</p>
              </div>
            </div>
          </div>
          
          {/* Enhanced footer with better styling */}
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-sm text-gray-400">
            <p className="font-medium">© 2024 Your Company</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-cyan-400 transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors duration-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Column - Login Component */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-0">
        <div className="w-full">
          <Login />
        </div>
      </div>
    </div>
  );
};

export default Loginpage;