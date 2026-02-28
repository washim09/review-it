'use client'

import React, { useState } from 'react';
import { FaHeadset, FaQuestionCircle, FaBook, FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

import Navbar from '../components/layout/Navbar';

const Support: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Send form data to backend API
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
        
        // Reset form submission status after 5 seconds
        setTimeout(() => {
          setFormSubmitted(false);
        }, 5000);
      } else {
        console.error('Error submitting support request:', data);
        setSubmitError(data.message || 'Failed to submit support request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common FAQs
  const faqs = [
    {
      question: "How do I submit a review?",
      answer: "To submit a review, log in to your account, navigate to the homepage, and click the 'Write a Review' button. Fill in the required details about the product or service and submit."
    },
    {
      question: "Can I edit my review after submission?",
      answer: "Yes, you can edit your review by going to your profile page, finding the review in your submissions list, and clicking the edit icon."
    },
    {
      question: "How do I report inappropriate reviews?",
      answer: "Each review has a 'Report' option. Click on it, select the reason for reporting, and submit the form. Our moderation team will review it promptly."
    },
    {
      question: "Why was my review not published?",
      answer: "Reviews are subject to our community guidelines. Your review may not be published if it contains inappropriate language, false information, or violates our terms of service."
    }
  ];

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
          <h1 className="text-5xl md:text-6xl font-bold mb-6"><span className="text-white">Support</span> <span className="text-purple-400">Center</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            We're here to help you with any questions or issues you might have.
          </p>
        </motion.div>
      </div>

      {/* Support Options Section */}
      <section className="py-16 bg-neutral-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How Can We <span className="text-purple-400">Help You?</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Option 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-neutral-800/70 p-6 rounded-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all text-center"
            >
              <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                <FaQuestionCircle className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">FAQ</h3>
              <p className="text-gray-300 mb-6">Find answers to commonly asked questions about using our platform.</p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors">
                View FAQs
              </button>
            </motion.div>

            {/* Option 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-neutral-800/70 p-6 rounded-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all text-center"
            >
              <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                <FaBook className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Knowledge Base</h3>
              <p className="text-gray-300 mb-6">Explore our detailed guides and tutorials on using all features.</p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors">
                Browse Guides
              </button>
            </motion.div>

            {/* Option 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-neutral-800/70 p-6 rounded-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all text-center"
            >
              <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                <FaHeadset className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Contact Us</h3>
              <p className="text-gray-300 mb-6">Need personalized help? Our support team is ready to assist you.</p>
              <a href="#contact-form" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors inline-block">
                Get Support
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked <span className="text-purple-400">Questions</span></h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-neutral-800/70 p-6 rounded-lg backdrop-blur-sm border border-purple-500/20"
              >
                <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <button className="bg-transparent border-2 border-purple-500 hover:bg-purple-500/20 text-white font-medium py-2 px-6 rounded-md transition-colors">
              View All FAQs
            </button>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 bg-neutral-800/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Contact <span className="text-purple-400">Support</span></h2>
          
          <div className="max-w-2xl mx-auto bg-neutral-800/70 p-8 rounded-lg backdrop-blur-sm border border-purple-500/20">
            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <FaEnvelope className="text-5xl text-purple-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-3">Message Received!</h3>
                <p className="text-gray-300">
                  Thank you for contacting us. Our support team will get back to you shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="account">Account Issues</option>
                    <option value="review">Review Submission</option>
                    <option value="technical">Technical Problems</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white resize-none"
                    placeholder="Describe your issue or question in detail..."
                  ></textarea>
                </div>
                {submitError && (
                  <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                    <p className="text-red-200">{submitError}</p>
                  </div>
                )}
                <div className="text-right">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`relative ${isSubmitting ? 'bg-purple-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} text-white font-medium py-2 px-8 rounded-md transition-colors`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="opacity-0">Submit Request</span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      </>
                    ) : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
