import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Parallax } from "react-scroll-parallax"; // Ensure this is installed
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Container } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  useEffect(() => {
    gsap.fromTo(
      ".hero-title",
      { opacity: 0, y: -50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".hero-title",
          start: "top 80%",
        },
      }
    );

    gsap.fromTo(
      ".hero-description",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5,
        scrollTrigger: {
          trigger: ".hero-description",
          start: "top 80%",
        },
      }
    );

    gsap.fromTo(
      ".cta-section",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5,
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 60%",
        },
      }
    );
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      quote: "This travel planner made my dream vacation a reality. The personalized itinerary was perfect!",
      destination: "Bali, Indonesia"
    },
    {
      id: 2,
      name: "Michael Chen",
      quote: "I was able to plan my entire European adventure in minutes. Truly amazing service!",
      destination: "Paris, France"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      quote: "The recommendations were spot on for our family trip. Will definitely use again for our next vacation.",
      destination: "Costa Rica"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <>
      <div className="relative h-screen w-full overflow-hidden">
        {/* Full screen background iframe */}
        <div className="absolute inset-0 w-full h-full z-0">
          <iframe
            src="https://lumalabs.ai/embed/14e3a9f3-21f7-433a-bc3c-f5e275aafe50?mode=sparkles&background=%23ffffff&color=%23000000&showTitle=true&loadBg=true&logoPosition=bottom-left&infoPosition=bottom-right&cinematicVideo=undefined&showMenu=false"
            className="w-full h-full border-0"
            title="Background iframe"
          />

          
        </div>

        <ToastContainer />
        
        {/* Main content container */}
        <div className="relative z-10 h-full w-full">
          <Container className="h-full flex items-center">
            <Outlet />
            
            {/* Card positioned on the left */}
            <div className="w-full max-w-md ml-8 mt-0">
              <div className="bg-gradient-to-b from-[#dcebfe] to-yellow-100 p-6 rounded-lg shadow-md">
                {/* Call to Action Section */}
                <div className="cta-section text-left">
                  <p className="text-lg mb-4 font-semibold text-black">
                    Ready to start planning your dream vacation? Share your travel
                    destination, days, budget, and travel group preferences with us.
                  </p>
                  <Link to="/create-trip">
                    <Button className="py-3 px-6 text-lg font-bold bg-orange-500 hover:bg-orange-600">
                      Start Planning Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Slider Section (Pre-Footer) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <Container>
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">What Our Travelers Say</h2>
          
          <div className="relative overflow-hidden px-4">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-2xl">★</span>
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-blue-500">{testimonial.destination}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 w-3 mx-1 rounded-full ${currentSlide === index ? 'bg-blue-500' : 'bg-gray-300'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Travel Planner</h3>
              <p className="text-gray-400">Your perfect vacation is just a few clicks away. Let us help you create memories that last a lifetime.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
                <li><Link to="/destinations" className="text-gray-400 hover:text-white transition">Destinations</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Popular Destinations</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Bali, Indonesia</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Paris, France</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Tokyo, Japan</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">New York, USA</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Stay Connected</h4>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Facebook">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Twitter">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Instagram">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.987.01-4.04.059-.977.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.88-.344 1.857-.047 1.053-.059 1.37-.059 4.04 0 2.67.01 2.987.059 4.04.045.977.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.88.3 1.857.344 1.054.047 1.37.059 4.04.059 2.67 0 2.987-.01 4.04-.059.977-.045 1.504-.207 1.857-.344.467-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.88.344-1.857.047-1.054.059-1.37.059-4.04 0-2.67-.01-2.987-.059-4.04-.045-.977-.207-1.504-.344-1.857a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.88-.3-1.857-.344-1.053-.047-1.37-.059-4.04-.059zm0 3.065a5.23 5.23 0 0 1 5.233 5.233 5.23 5.23 0 0 1-5.233 5.233 5.23 5.23 0 0 1-5.233-5.233A5.23 5.23 0 0 1 12 6.867zm0 8.635a3.402 3.402 0 1 0 0-6.804 3.402 3.402 0 0 0 0 6.804zM16.133 6.632a1.221 1.221 0 1 1 0 2.442 1.221 1.221 0 0 1 0-2.442z"/></svg>
                </a>
              </div>
              <p className="text-gray-400">Subscribe to our newsletter</p>
              <div className="flex mt-2">
                <input type="email" placeholder="Your email" className="px-4 py-2 rounded-l focus:outline-none" />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition">Subscribe</button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Travel Planner. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </>
  );
};

export default Hero;