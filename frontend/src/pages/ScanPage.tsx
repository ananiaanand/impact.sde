import { Link } from 'react-router-dom';
import FadeIn from '../components/FadeIn';

const ScanPage = () => {
  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <nav className="mb-12 text-left">
          <Link to="/" className="text-[#D7E2EA] hover:opacity-70 uppercase tracking-wider">
            &larr; Back to Home
          </Link>
        </nav>
        
        <FadeIn delay={0} y={20}>
          <h1 className="hero-heading font-black text-4xl mb-6">Scan QR Code</h1>
          <p className="text-[#D7E2EA] mb-12">
            Position the QR code within the frame to learn more about our SDG initiatives.
          </p>
          
          <div className="w-full aspect-square border-4 border-dashed border-gray-700 rounded-3xl flex items-center justify-center bg-[#1A1A1A]">
            <span className="text-gray-500 font-bold tracking-widest uppercase">Scanner Active</span>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default ScanPage;
