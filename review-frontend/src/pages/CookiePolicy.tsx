'use client'

import React from 'react';
import { FaCookieBite, FaInfoCircle, FaCog } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';

const CookiePolicy: React.FC = () => {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6"><span className="text-white">Cookie</span> <span className="text-purple-400">Policy</span></h1>
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
                This Cookie Policy explains how Review-It ("we", "us", or "our") uses cookies and similar 
                technologies when you visit our website or use our services. This policy should be read 
                alongside our Privacy Policy, which explains how we use personal information.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center">
                <FaCookieBite className="inline mr-3 text-purple-400" /> 
                1. What are Cookies?
              </h2>
              <p className="mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when 
                you visit websites. They are widely used to make websites work more efficiently and provide 
                information to the website owners. Cookies enhance user experience by:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Remembering your preferences and settings</li>
                <li>Keeping you signed in</li>
                <li>Helping us understand how you use our site</li>
                <li>Improving site performance and functionality</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center">
                <FaInfoCircle className="inline mr-3 text-purple-400" /> 
                2. Types of Cookies We Use
              </h2>
              <p className="mb-4">
                We use the following types of cookies:
              </p>

              <h3 className="text-xl font-bold mt-6 mb-3">Essential Cookies</h3>
              <p className="mb-4">
                These cookies are necessary for the website to function properly. They enable core functionality 
                such as security, network management, and account access. You may disable these by changing your 
                browser settings, but this will affect how the website functions.
              </p>

              <h3 className="text-xl font-bold mt-6 mb-3">Performance Cookies</h3>
              <p className="mb-4">
                These cookies collect information about how visitors use our website, for instance which pages 
                visitors go to most often. We use this information to improve our website and provide a better user 
                experience. All information these cookies collect is aggregated and therefore anonymous.
              </p>

              <h3 className="text-xl font-bold mt-6 mb-3">Functionality Cookies</h3>
              <p className="mb-4">
                These cookies allow the website to remember choices you make (such as your username, language, or 
                region) and provide enhanced, more personal features. They may also be used to provide services you 
                have asked for, such as watching a video or commenting on a blog.
              </p>

              <h3 className="text-xl font-bold mt-6 mb-3">Targeting/Advertising Cookies</h3>
              <p className="mb-4">
                These cookies are used to deliver advertisements more relevant to you and your interests. They are 
                also used to limit the number of times you see an advertisement and help measure the effectiveness 
                of advertising campaigns.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. Third-Party Cookies</h2>
              <p className="mb-4">
                In addition to our own cookies, we may also use various third-party cookies to report usage 
                statistics, deliver advertisements, and so on. These cookies may include:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Analytics cookies:</strong> We use Google Analytics to help us understand how visitors 
                  engage with our website. These cookies collect information about your use of our website, including 
                  which pages you go to most often.</li>
                <li><strong>Social media cookies:</strong> These cookies allow you to share content from our website 
                  on social media platforms like Facebook, Twitter, and LinkedIn.</li>
                <li><strong>Advertising cookies:</strong> These cookies are used by advertising companies to serve 
                  ads that are relevant to your interests.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center">
                <FaCog className="inline mr-3 text-purple-400" /> 
                4. Managing Cookies
              </h2>
              <p className="mb-4">
                Most web browsers allow you to manage your cookie preferences. You can:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Delete cookies from your device</li>
                <li>Block cookies by activating the setting on your browser that allows you to refuse all or some cookies</li>
                <li>Set your browser to notify you when you receive a cookie</li>
              </ul>

              <p className="mb-4">
                Please note that if you choose to block or delete cookies, you may not be able to access certain 
                areas or features of our website, and some services may not function properly.
              </p>

              <h3 className="text-xl font-bold mt-6 mb-3">How to Manage Cookies in Different Browsers</h3>
              <p className="mb-4">
                Here are links to instructions on how to manage cookies in some popular browsers:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><a href="https://support.google.com/chrome/answer/95647" className="text-purple-400 hover:text-purple-300">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" className="text-purple-400 hover:text-purple-300">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471" className="text-purple-400 hover:text-purple-300">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-purple-400 hover:text-purple-300">Microsoft Edge</a></li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Cookie Consent</h2>
              <p className="mb-4">
                When you first visit our website, you will be shown a cookie banner that allows you to accept or 
                reject non-essential cookies. You can change your cookie preferences at any time by clicking on the 
                "Cookie Settings" link in the footer of our website.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Changes to this Cookie Policy</h2>
              <p className="mb-4">
                We may update this Cookie Policy from time to time. If we make material changes, we will notify 
                you by updating the "Last Updated" date at the top of this policy or by other means. Your continued 
                use of our website after such notification constitutes your acceptance of the updated Cookie Policy.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about our use of cookies, please contact us at privacy@review-it.com.
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
              By continuing to use our website, you acknowledge that you have read and understand our Cookie Policy.
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

export default CookiePolicy;
