'use client'

import React from 'react';
import { FaBriefcase, FaCode, FaUserAlt, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

import Navbar from '../components/layout/Navbar';

const Careers: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 to-purple-900 text-white">
      {/* Navbar with placeholder for fixed positioning */}
      <div className="h-[72px]">
        <Navbar />
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6"><span className="text-white">Join Our</span> <span className="text-purple-400">Team</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Help us build the future of authentic reviews and transform how people make informed decisions.
          </p>
        </motion.div>
      </div>

      {/* Why Join Us Section */}
      <section className="py-16 bg-neutral-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why Work at <span className="text-purple-400">Review-It</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-neutral-800/70 p-6 rounded-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                <FaChartLine className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-3">Growth Potential</h3>
              <p className="text-gray-300 text-center">Join a rapidly growing platform with opportunities for career advancement and professional development.</p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-neutral-800/70 p-6 rounded-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                <FaCode className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-3">Innovative Technology</h3>
              <p className="text-gray-300 text-center">Work with cutting-edge technologies and help shape the future of our review platform.</p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-neutral-800/70 p-6 rounded-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                <FaUserAlt className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-3">Inclusive Culture</h3>
              <p className="text-gray-300 text-center">Join a diverse team that values different perspectives and fosters a collaborative environment.</p>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-neutral-800/70 p-6 rounded-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                <FaBriefcase className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-center mb-3">Meaningful Impact</h3>
              <p className="text-gray-300 text-center">Help consumers make informed decisions through authentic reviews and build trust in the digital economy.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Open <span className="text-purple-400">Positions</span></h2>
          
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-neutral-800/70 p-10 rounded-lg backdrop-blur-sm border border-purple-500/20 text-center"
            >
              <div className="bg-purple-500/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">No Current Openings</h3>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                We don't have any open positions at the moment, but we're always interested in connecting with talented individuals who are passionate about our mission.
              </p>
              <div className="space-y-6">
                <div className="border-t border-purple-500/20 pt-6 max-w-md mx-auto">
                  <h4 className="text-xl font-medium mb-4">Future Opportunities</h4>
                  <p className="text-gray-300">
                    We're growing rapidly and anticipate new positions opening soon. Submit your resume to be considered for future opportunities.
                  </p>
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-md transition-colors">
                  Submit Your Resume
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* No Open Positions CTA */}
      <section className="py-16 bg-neutral-800/30">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Don't see a role that fits your skills?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals to join our team. Send us your resume, and we'll keep you in mind for future opportunities.
          </p>
          <button className="bg-transparent border-2 border-purple-500 hover:bg-purple-500/20 text-white font-medium py-2 px-6 rounded-md transition-colors">
            Submit Your Resume
          </button>
        </div>
      </section>
    </div>
  );
};

export default Careers;
