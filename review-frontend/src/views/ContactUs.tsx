'use client'

import React, { useState } from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaPhone, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/layout/Navbar';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/support/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setFormSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        setTimeout(() => {
          setFormSubmitted(false);
        }, 5000);
      } else {
        setSubmitError(data.message || 'Failed to submit your message. Please try again.');
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: 'Email',
      details: 'contact@riviewit.com',
      description: 'Send us an email anytime'
    },
    {
      icon: FaPhone,
      title: 'Phone',
      details: '+91 (999) 941-3369',
      description: 'Mon-Fri from 9am to 6pm'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Office',
      details: '178 Inder Enclave Phase - II',
      description: 'North West Delhi, ND 110086'
    },
    {
      icon: FaClock,
      title: 'Business Hours',
      details: 'Mon-Fri: 9:00 AM - 6:00 PM',
      description: 'Weekend: Closed'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 to-purple-900 text-white">
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Get in</span> <span className="text-purple-400">Touch</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>
      </div>

      {/* Contact Info Cards */}
      <section className="py-16 bg-neutral-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-neutral-800/70 p-6 rounded-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all text-center"
              >
                <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                  <info.icon className="text-2xl text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">{info.title}</h3>
                <p className="text-white font-medium mb-1">{info.details}</p>
                <p className="text-gray-400 text-sm">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Send Us a <span className="text-purple-400">Message</span>
            </h2>
            <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Fill out the form below and our team will get back to you within 24 hours.
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-neutral-800/70 p-8 md:p-10 rounded-lg backdrop-blur-sm border border-purple-500/20">
              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="bg-purple-500/20 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-6 mx-auto">
                    <FaPaperPlane className="text-4xl text-purple-400" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Message Sent!</h3>
                  <p className="text-gray-300 text-lg mb-2">
                    Thank you for reaching out to us.
                  </p>
                  <p className="text-gray-400">
                    We'll get back to you as soon as possible.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    >
                      <option value="">Select a subject</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="media">Media & Press</option>
                      <option value="business">Business Proposal</option>
                      <option value="advertising">Advertising Opportunities</option>
                      <option value="general">General Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>
                  
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
                    >
                      <p className="text-red-200 flex items-center">
                        <FaEnvelope className="mr-2" />
                        {submitError}
                      </p>
                    </motion.div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      <span className="text-red-400">*</span> Required fields
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`relative flex items-center gap-2 ${
                        isSubmitting 
                          ? 'bg-purple-500 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      } text-white font-medium py-3 px-8 rounded-lg transition-all transform hover:scale-105`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <FaPaperPlane />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map or Additional Info Section */}
      <section className="py-16 bg-neutral-800/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Visit Our <span className="text-purple-400">Office</span>
            </h2>
            <p className="text-gray-300 mb-8">
              We're located in the heart of India. Feel free to drop by during business hours.
            </p>
            <div className="bg-neutral-800/70 rounded-lg p-8 border border-purple-500/20">
              <div className="aspect-video bg-neutral-700/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="text-6xl text-purple-400 mb-4 mx-auto" />
                  <p className="text-gray-400">Map integration placeholder</p>
                  <p className="text-sm text-gray-500 mt-2">178 Inder Enclave, Phase - II<br />North West Delhi, ND 110086</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
