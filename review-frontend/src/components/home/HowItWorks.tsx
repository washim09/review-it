'use client'

import { FaPencilAlt, FaSearch, FaThumbsUp } from 'react-icons/fa';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 * custom, duration: 0.5 }
    })
  };

  return (
    <div className="py-24 bg-neutral-950 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full filter blur-[80px]"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent-500/10 rounded-full filter blur-[100px]"></div>
        {/* Removed noise pattern SVG reference to fix 404 error */}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center rounded-full bg-white/5 px-3 py-1 mb-4 text-sm">
            <span className="text-secondary-400">SIMPLE STEPS</span>
          </div>
          <h2 className="text-3xl md:text-4xl text-white font-bold">How Review-It Works</h2>
          <div className="w-20 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            className="card-aurora"
          >
            <div className="card-aurora-content text-center">
              <div className="flex justify-center mb-5">
                <div className="relative bg-gradient-to-br from-primary-900/50 to-primary-800/50 p-4 rounded-full border border-primary-700/30 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <FaPencilAlt className="text-primary-400 text-3xl relative z-10" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Write Reviews</h3>
              <p className="text-white/60">
                Share your honest experience with products and services you've used. 
                Your feedback helps others make informed decisions.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
            className="card-aurora"
          >
            <div className="card-aurora-content text-center">
              <div className="flex justify-center mb-5">
                <div className="relative bg-gradient-to-br from-secondary-900/50 to-secondary-800/50 p-4 rounded-full border border-secondary-700/30 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-secondary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <FaSearch className="text-secondary-400 text-3xl relative z-10" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Discover Reviews</h3>
              <p className="text-white/60">
                Browse through reviews from other users to find the best products 
                and services tailored to your needs.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={3}
            className="card-aurora"
          >
            <div className="card-aurora-content text-center">
              <div className="flex justify-center mb-5">
                <div className="relative bg-gradient-to-br from-accent-900/50 to-accent-800/50 p-4 rounded-full border border-accent-700/30 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-accent-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <FaThumbsUp className="text-accent-400 text-3xl relative z-10" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect With Reviewers</h3>
              <p className="text-white/60">
                Message reviewers directly to ask questions or get more details 
                about their experience with a product.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
