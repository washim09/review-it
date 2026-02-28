'use client'

import React from 'react';
import { FaUserSecret, FaLock, FaCookieBite } from 'react-icons/fa';
import { motion } from 'framer-motion';

import Navbar from '../components/layout/Navbar';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 to-purple-900 text-white">
      {/* Navbar with placeholder for fixed positioning */}
      <div className="h-[72px]">
        <Navbar />
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6"><span className="text-white">Privacy</span> <span className="text-purple-400">Policy</span></h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Last updated: July 1, 2025
          </p>
        </motion.div>
      </div>

      {/* Policy Content */}
      <section className="py-10 bg-neutral-800/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-neutral-800/70 p-8 rounded-lg backdrop-blur-sm border border-purple-500/20">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="mb-6">
                At Review-It, we take your privacy seriously. This Privacy Policy describes how we collect, use, 
                and share information about you when you use our website, mobile applications, and other online 
                products and services (collectively, the "Services").
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center">
                <FaUserSecret className="inline mr-3 text-purple-400" /> 
                1. Information We Collect
              </h2>
              <p className="mb-4">
                We collect information you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Create an account or profile</li>
                <li>Submit or edit reviews</li>
                <li>Communicate with other users</li>
                <li>Contact our support team</li>
                <li>Participate in surveys or promotions</li>
              </ul>

              <p className="mb-4">
                This information may include your name, email address, username, password, profile picture, 
                and any other information you choose to provide.
              </p>

              <h3 className="text-xl font-bold mt-6 mb-3">Automatically Collected Information</h3>
              <p className="mb-4">
                When you access or use our Services, we automatically collect certain information, including:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Log Information:</strong> We collect log information about your use of the Services, 
                  including the type of browser you use, access times, pages viewed, your IP address, and the page 
                  you visited before navigating to our Services.</li>
                <li><strong>Device Information:</strong> We collect information about the device you use to access 
                  our Services, including hardware model, operating system and version, unique device identifiers, 
                  and mobile network information.</li>
                <li><strong>Location Information:</strong> We may collect information about your location when you 
                  access or use our Services, including your IP address or mobile device's GPS signal.</li>
                <li><strong>Information Collected by Cookies and Similar Technologies:</strong> We use various 
                  technologies to collect information, including cookies and web beacons.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center">
                <FaLock className="inline mr-3 text-purple-400" /> 
                2. How We Use Your Information
              </h2>
              <p className="mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Provide, maintain, and improve our Services</li>
                <li>Process and complete transactions</li>
                <li>Send you technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Personalize your experience on our Services</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our Services</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. Sharing of Information</h2>
              <p className="mb-4">
                We may share information about you as follows:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>With other users:</strong> When you submit a review, certain information such as your 
                  username and profile picture will be visible to other users.</li>
                <li><strong>With vendors, consultants, and other service providers:</strong> We may share your 
                  information with third-party vendors who need access to such information to carry out work on 
                  our behalf.</li>
                <li><strong>In response to legal process or requests:</strong> We may disclose your information if 
                  required to do so by law or in response to valid legal requests.</li>
                <li><strong>In connection with business transfers:</strong> We may share your information in 
                  connection with a merger, sale of company assets, financing, or acquisition of all or a portion 
                  of our business.</li>
                <li><strong>With your consent:</strong> We may share information with third parties when you 
                  give us your consent to do so.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center">
                <FaCookieBite className="inline mr-3 text-purple-400" /> 
                4. Cookies and Similar Technologies
              </h2>
              <p className="mb-4">
                We use cookies and similar technologies to collect information about your browsing activities and 
                to distinguish you from other users of our Services. For more information about the cookies we use 
                and how to manage them, please see our Cookie Policy.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Security</h2>
              <p className="mb-4">
                We take reasonable measures to help protect information about you from loss, theft, misuse, and 
                unauthorized access, disclosure, alteration, and destruction. However, no security system is 
                impenetrable, and we cannot guarantee the security of our systems or your information.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Your Rights and Choices</h2>
              <p className="mb-4">
                You have several rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Account Information:</strong> You may update, correct, or delete your account 
                  information at any time by logging into your account or contacting us.</li>
                <li><strong>Cookies:</strong> Most web browsers are set to accept cookies by default. You can 
                  usually choose to set your browser to remove or reject browser cookies.</li>
                <li><strong>Marketing Communications:</strong> You may opt out of receiving promotional emails 
                  from us by following the instructions in those emails.</li>
                <li><strong>Data Access, Correction, and Deletion:</strong> Depending on your location, you may 
                  have the right to access, correct, or delete the personal information we have about you.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. International Data Transfers</h2>
              <p className="mb-4">
                We may transfer your information to countries other than the one in which you live. We rely on 
                mechanisms such as standard contractual clauses to lawfully transfer data across borders.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Children's Privacy</h2>
              <p className="mb-4">
                Our Services are not directed to children under the age of 13. If we learn that we have collected 
                personal information from a child under 13, we will promptly delete such information.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Changes to this Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. If we make material changes, we will notify 
                you by email or through our Services. Your continued use of our Services after such notification 
                constitutes your acceptance of the updated Privacy Policy.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at 
                privacy@review-it.com.
              </p>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mt-12 mb-8"
          >
            <p className="text-gray-300 mb-6">
              By using the Review-It platform, you acknowledge that you have read and understand our Privacy Policy.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-md transition-colors">
              Back to Home
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
