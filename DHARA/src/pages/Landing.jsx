import { Link } from 'react-router-dom';
import { Tractor, ArrowRight, IndianRupee, Smartphone, CheckCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="font-sans">
      
      {/* 
        HERO SECTION WRAPPER
        - Contains the Background Image, Overlay, Navbar, and Hero Text
        - min-h-screen ensures it covers the viewport initially
      */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/extracomponents/uibg1.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay for Contrast */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Navbar (Over Background) */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-green-600 transition-colors">
              <Tractor className="h-8 w-8 text-green-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wider leading-none">DHARA</h1>
              <p className="text-[10px] text-green-200/80 font-medium tracking-wide">
                Distributed Holistic Agriculture<br/>Resources Allocation
              </p>
            </div>
          </div>
          
          {/* Team Name Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
             <span className="text-2xl font-black text-white/90 tracking-[0.2em] font-serif">VAJRA</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-200 hover:text-green-400 font-medium transition-colors">
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Content (Over Background) */}
        <div className="relative z-10 flex-grow flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Side: Text Content */}
            <div className="text-white py-20">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-white drop-shadow-lg">
                Share Farm Assets <br/>
                <span className="text-green-400">Grow Together</span>
              </h1>
              <p className="text-xl text-gray-200 mb-10 max-w-lg drop-shadow-md leading-relaxed">
                Connect with local farmers to rent tractors, drones, and equipment. 
                Maximize your yield and minimize costs with the "Uber for Rural India".
              </p>
              <div className="flex gap-4">
                <Link 
                  to="/register" 
                  className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold shadow-xl hover:scale-105 flex items-center gap-3 text-lg"
                >
                  Start Renting <ArrowRight size={24} />
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-xl hover:bg-white/20 transition-colors font-bold text-lg"
                >
                  Log In
                </Link>
              </div>
            </div>

            {/* Right Side: Animated Solution Visualization */}
            <div className="hidden md:flex flex-col relative items-center justify-center space-y-4 perspective-1000 translate-x-12">
              <style>
                {`
                  @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.5) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                  }
                  .animate-pop {
                    animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    opacity: 0;
                  }
                `}
              </style>

              {/* Title Badge */}
              <div className="bg-green-100 text-green-800 font-bold px-6 py-2 rounded-full shadow-lg transform -rotate-1 mb-6 animate-pop border border-green-200" style={{ animationDelay: '0.2s' }}>
                The DHARA Solution ✅
              </div>

              {/* Flow Visualization */}
              <div className="flex items-center gap-4 lg:gap-6 bg-gradient-to-br from-white/95 to-green-50/90 backdrop-blur-md p-8 rounded-2xl border border-white/60 shadow-2xl animate-pop" style={{ animationDelay: '0.4s' }}>
                
                {/* Step 1: Standard Rates */}
                <div className="flex flex-col items-center animate-pop group" style={{ animationDelay: '0.6s' }}>
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100/50 p-4 rounded-full shadow-lg border border-green-200 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <IndianRupee size={40} className="text-green-600" strokeWidth={2.5} />
                  </div>
                  <p className="text-gray-800 text-xs font-bold mt-3 text-center max-w-[90px] leading-tight">Standardized Rates</p>
                </div>

                {/* Separator 1 */}
                <div className="h-12 w-[2px] bg-green-200/50 rounded-full animate-pop" style={{ animationDelay: '1.0s' }}></div>

                {/* Step 2: Equipment Range */}
                <div className="flex flex-col items-center animate-pop group" style={{ animationDelay: '1.4s' }}>
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-100/50 p-4 rounded-full shadow-lg border border-blue-200 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <Tractor size={40} className="text-blue-600" strokeWidth={2.5} />
                  </div>
                  <p className="text-gray-800 text-xs font-bold mt-3 text-center max-w-[90px] leading-tight">Wide Equipment Range</p>
                </div>

                {/* Separator 2 */}
                <div className="h-12 w-[2px] bg-green-200/50 rounded-full animate-pop" style={{ animationDelay: '1.8s' }}></div>

                {/* Step 3: Availability */}
                <div className="flex flex-col items-center animate-pop group" style={{ animationDelay: '2.2s' }}>
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-yellow-100/50 p-4 rounded-full shadow-lg border border-yellow-200 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 relative">
                    <CheckCircle size={40} className="text-yellow-600" strokeWidth={2.5} />
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-white">
                      24/7
                    </div>
                  </div>
                  <p className="text-gray-800 text-xs font-bold mt-3 text-center max-w-[90px] leading-tight">High Availability</p>
                </div>
              </div>

              {/* Verified Text */}
              <div className="mt-4 bg-green-900/90 backdrop-blur-md px-6 py-3 rounded-xl border border-green-700/50 max-w-md text-center animate-pop hover:bg-green-800 transition-colors cursor-default shadow-lg" style={{ animationDelay: '2.6s' }}>
                <p className="text-green-50 text-sm font-medium flex items-center gap-2 justify-center">
                  <span className="text-xl">🛡️</span> Verified Pricing & No Middlemen
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* 
        CONTENT SECTIONS
      */}

      {/* Stats Section */}
      <div className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Equipment Listed', value: '500+' },
            { label: 'Farmers Served', value: '1,200+' },
            { label: 'Villages Covered', value: '50+' },
            { label: 'Farmer Savings', value: '₹2.5L+' },
          ].map((stat, idx) => (
            <div key={idx}>
              <h3 className="text-4xl font-extrabold text-green-600 mb-2">{stat.value}</h3>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-green-600 font-bold tracking-wider uppercase text-sm">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Why Choose DHARA?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're bridging the gap between farmers who need equipment and operators who own them.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: 'Wide Equipment Range', desc: 'From tractors to harvesters, find all agricultural machinery you need.', icon: '🚜' },
              { title: 'Local Operators', desc: 'Connect with verified equipment owners in your village and district.', icon: '📍' },
              { title: 'Easy Booking', desc: 'Book equipment in minutes with our simple scheduling system.', icon: '📅' },
              { title: 'Verified & Trusted', desc: 'All operators are verified to ensure quality and reliability.', icon: '✅' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-green-600 font-bold tracking-wider uppercase text-sm">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get the equipment you need in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Search Equipment', desc: 'Browse available tractors, harvesters, and more in your area.' },
              { step: '02', title: 'Select & Book', desc: 'Choose your dates and book instantly at transparent prices.' },
              { step: '03', title: 'Farm & Prosper', desc: 'Operator delivers equipment. You focus on your harvest.' },
            ].map((item, idx) => (
              <div key={idx} className="relative p-8 rounded-2xl bg-green-50 border border-green-100 text-center group hover:bg-green-600 transition-colors duration-300">
                <div className="text-6xl font-black text-green-200 group-hover:text-green-500/50 mb-4 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-white mb-3 transition-colors">{item.title}</h3>
                <p className="text-gray-600 group-hover:text-green-50 transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Farming?</h2>
          <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of farmers who are already saving money and increasing productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-white text-green-900 rounded-xl hover:bg-gray-100 transition-colors font-bold shadow-lg"
            >
              Register as Farmer
            </Link>
            <Link 
              to="/register" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-colors font-bold"
            >
              List Your Equipment
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Tractor className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-white">DHARA</span>
            </div>
            <p className="mb-6">© 2024 DHARA (formerly RuralRent). Empowering Rural India, One Harvest at a Time.</p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="#" className="hover:text-green-400">Verified Operators</a>
              <a href="#" className="hover:text-green-400">Secure Payments</a>
              <a href="#" className="hover:text-green-400">24/7 Support</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
