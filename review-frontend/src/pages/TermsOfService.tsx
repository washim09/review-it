'use client'

import React from 'react';
import { FaUserShield, FaRegHandshake } from 'react-icons/fa';
import { motion } from 'framer-motion';

import Navbar from '../components/layout/Navbar';

const TermsOfService: React.FC = () => {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6"><span className="text-white">Terms of</span> <span className="text-purple-400">Service</span></h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Last updated: July 1, 2025
          </p>
        </motion.div>
      </div>

      {/* Terms Content */}
      <section className="py-10 bg-neutral-800/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-neutral-800/70 p-8 rounded-lg backdrop-blur-sm border border-purple-500/20">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="mb-6">
                Welcome to Review-It. Please read these Terms of Service ("Terms") carefully as they contain 
                important information about your legal rights, remedies, and obligations. By accessing or using 
                the Review-It platform, you agree to comply with and be bound by these Terms.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center">
                <FaUserShield className="inline mr-3 text-purple-400" /> 
                1. Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy. 
                If you do not agree to these Terms, you may not access or use the services.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center">
                <FaRegHandshake className="inline mr-3 text-purple-400" /> 
                2. User Accounts
              </h2>
              <p className="mb-4">
                You may need to create an account to use some of our services. You are responsible for maintaining 
                the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <p className="mb-4">
                You agree to provide accurate and complete information when creating your account and to update 
                your information to keep it accurate and complete. You agree not to impersonate any person or entity 
                or misrepresent your identity or affiliation with any person or entity.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. Content Guidelines</h2>
              <p className="mb-4">
                Users are solely responsible for the content they post on the platform. All content must comply 
                with our guidelines and must not:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Contain false, misleading, or deceptive information</li>
                <li>Infringe upon any third-party rights, including intellectual property rights</li>
                <li>Contain defamatory, abusive, offensive, or hateful content</li>
                <li>Promote illegal activities or violate any applicable laws</li>
                <li>Contain spam, advertising, or promotional materials not related to the review subject</li>
                <li>Contain personal or identifying information about others without their consent</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Review Moderation</h2>
              <p className="mb-4">
                We reserve the right to moderate, edit, or remove any content that violates these Terms or our 
                content guidelines. We may also suspend or terminate accounts that repeatedly violate these Terms.
              </p>
              <p className="mb-4">
                We strive to maintain the integrity and authenticity of reviews on our platform. We do not 
                guarantee that we will publish all submitted reviews, and we may use automated systems and human 
                moderators to evaluate content.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Intellectual Property Rights</h2>
              <p className="mb-4">
                By submitting content to our platform, you grant us a non-exclusive, worldwide, royalty-free, 
                irrevocable, perpetual license to use, reproduce, modify, adapt, publish, translate, create 
                derivative works from, distribute, and display such content in any media.
              </p>
              <p className="mb-4">
                You represent and warrant that you own or have the necessary rights to the content you submit 
                and that the content does not infringe upon the rights of any third party.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law, Review-It and its officers, directors, employees, and 
                agents shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages, including without limitation, loss of profits, data, use, goodwill, or other intangible 
                losses, resulting from your access to or use of or inability to access or use the services.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Changes to Terms</h2>
              <p className="mb-4">
                We may modify these Terms at any time. If we make material changes to these Terms, we will 
                notify you by email or by posting a notice on our website. Your continued use of the services 
                after such notification constitutes your acceptance of the modified Terms.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Termination</h2>
              <p className="mb-4">
                We reserve the right to suspend or terminate your access to our services at any time, without 
                notice, for any reason, including if we believe you have violated these Terms.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the United States, 
                without regard to its conflict of law principles. Any disputes arising under or in connection with 
                these Terms shall be subject to the exclusive jurisdiction of the courts located within the United States.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us at legal@review-it.com.
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
              By using the Review-It platform, you acknowledge that you have read and understand our Terms of Service.
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

export default TermsOfService;
