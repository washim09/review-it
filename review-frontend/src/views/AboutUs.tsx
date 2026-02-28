'use client'

import { FaStar, FaUsers, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

import Navbar from '../components/layout/Navbar';

const AboutUs: React.FC = () => {
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6"><span className="text-white">About</span> <span className="text-purple-400">Review-It</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Delegating users with authentic standpoints through a community of honest reviewers.
          </p>
        </motion.div>
      </div>
      
      {/* Our Story Section */}
      <div className="container mx-auto px-4 py-16">
        {/* <h2 className="text-4xl font-bold mb-10 text-center text-white">Our Story</h2> */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">Our Story</h2>
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto shadow-xl">
            <p className="text-lg leading-relaxed mb-4">
              You know what’s frustrating? Trying to find a trustworthy review online, and it's difficult to find reliable, honest, and truthful reviews due to sponsored posts, fake ratings, or generic feedback. That’s the problem we kept running into—so I decided to do something about it.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              In 2025, during the toughest time of my life (health issue), I shared my idea with some of my mentors: what if there was a place where real people could share their real experiences, without filters or hidden agendas? As a result, Riviewit was born.
            </p>
            <p className="text-lg leading-relaxed">
              I didn’t want one more content farm or review site bestrewed with bots. So I built a platform where only verified users can leave reviews—straightforward, unedited, and accountable. I don't want Reviewit to remain only as a website. My dream is for it to become a growing community of people who believe in telling it like it is. Whether it’s a rave or a rant, every review helps someone else make a smarter decision—and gives businesses the kind of feedback they can use. That’s the kind of space we’re proud to have built. And we're just getting started.
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* Our Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Our Mission</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            To create the most trusted review platform by prioritizing authenticity, accessibility, and community.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-neutral-800/30 backdrop-blur-sm p-6 rounded-xl shadow-lg"
          >
            <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FaStar className="text-purple-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-3">Authentic Experiences</h3>
            <p className="text-gray-300 text-center">
              We verify reviewers and implement robust measures to ensure every review represents 
              a genuine experience, free from manipulation or bias.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-neutral-800/30 backdrop-blur-sm p-6 rounded-xl shadow-lg"
          >
            <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FaUsers className="text-purple-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-3">Community Powered</h3>
            <p className="text-gray-300 text-center">
              Our platform thrives on the collective wisdom of our diverse community, 
              bringing together insights from people across different backgrounds and experiences.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-neutral-800/30 backdrop-blur-sm p-6 rounded-xl shadow-lg"
          >
            <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FaShieldAlt className="text-purple-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-3">Trust & Transparency</h3>
            <p className="text-gray-300 text-center">
              We prioritize clear disclosure policies and maintain transparency about how reviews are collected, 
              verified, and displayed on our platform.
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Our Values Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Values</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex">
              <div className="mr-4 mt-1">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">01</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Honesty Above All</h3>
                <p className="text-gray-300">
                  We believe genuine reviews, both positive and critical, provide the greatest value to our community. 
                  We never suppress negative reviews or promote positive ones for compensation.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 mt-1">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">02</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">User Empowerment</h3>
                <p className="text-gray-300">
                  We design our platform to empower users with tools that make sharing experiences easy and 
                  finding relevant reviews intuitive. Users can also verify reviews through the message functionality
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 mt-1">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">03</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Inclusivity</h3>
                <p className="text-gray-300">
                  We strive to create a platform that welcomes diverse perspectives and makes review information 
                  accessible to everyone, regardless of background or ability.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 mt-1">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">04</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Continuous Improvement</h3>
                <p className="text-gray-300">
                  We're committed to constantly enhancing our platform based on community feedback and emerging technologies 
                  to better serve both reviewers and those seeking reviews.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Global Impact (Use this icon - FaGlobeAmericas when un comment this section) */}
      {/* <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-purple-900/80 to-indigo-900/80 rounded-2xl p-8 max-w-4xl mx-auto shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
              <FaGlobeAmericas className="text-8xl text-purple-300 opacity-80" />
            </div>
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-4">Our Global Impact</h2>
              <p className="text-lg mb-4">
                Since our launch, Review-It has helped over 500,000 users make informed decisions through 
                authentic reviews spanning 75+ countries and 30+ languages.
              </p>
              <p className="text-lg">
                By fostering transparency in consumer feedback, we've encouraged businesses to prioritize 
                quality and customer satisfaction, creating a positive cycle that benefits everyone.
              </p>
            </div>
          </div>
        </motion.div>
      </div> */}
      
      {/* Team Section */}
      {/* <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A passionate group of innovators dedicated to making honest reviews accessible to all.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Alex Rivera", role: "Founder & CEO", image: "https://ui-avatars.com/api/?name=Alex+Rivera&background=6D28D9&color=fff&size=200" },
            { name: "Mira Patel", role: "CTO", image: "https://ui-avatars.com/api/?name=Mira+Patel&background=6D28D9&color=fff&size=200" },
            { name: "Jordan Lee", role: "Head of Design", image: "https://ui-avatars.com/api/?name=Jordan+Lee&background=6D28D9&color=fff&size=200" },
            { name: "Taylor Morse", role: "Community Lead", image: "https://ui-avatars.com/api/?name=Taylor+Morse&background=6D28D9&color=fff&size=200" }
          ].map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-neutral-800/30 backdrop-blur-sm rounded-xl p-5 text-center"
            >
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-purple-400"
              />
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-purple-400">{member.role}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all"
          >
            Join Our Team
          </motion.button>
        </div>
      </div> */}
      
      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl p-12 text-center max-w-4xl mx-auto shadow-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Become part of Review-It today and help build a more transparent world 
            where authentic feedback drives better decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-purple-700 font-bold py-3 px-8 rounded-full transition-all"
            >
              Sign Up
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full transition-all"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;
