'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCode, FaPalette, FaMagic, FaLayerGroup } from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';

const DesignSystem = () => {
  const [activeTab, setActiveTab] = useState('colors');

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text-primary inline-block">Review-it Design System</h1>
          <div className="w-32 h-1 bg-gradient-primary mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A modern, accessible, and beautiful design system for our platform
          </p>
        </motion.div>

        {/* Navigation tabs */}
        <div className="flex justify-center mb-12 overflow-x-auto pb-2">
          <div className="card-glass px-2 py-1 rounded-full flex space-x-1">
            <button 
              onClick={() => setActiveTab('colors')} 
              className={`px-4 py-2 rounded-full flex items-center ${activeTab === 'colors' ? 'bg-white bg-opacity-20 shadow-sm' : 'hover:bg-white hover:bg-opacity-10'}`}
            >
              <FaPalette className="mr-2" />
              <span>Colors</span>
            </button>
            <button 
              onClick={() => setActiveTab('typography')} 
              className={`px-4 py-2 rounded-full flex items-center ${activeTab === 'typography' ? 'bg-white bg-opacity-20 shadow-sm' : 'hover:bg-white hover:bg-opacity-10'}`}
            >
              <FaCode className="mr-2" />
              <span>Typography</span>
            </button>
            <button 
              onClick={() => setActiveTab('effects')} 
              className={`px-4 py-2 rounded-full flex items-center ${activeTab === 'effects' ? 'bg-white bg-opacity-20 shadow-sm' : 'hover:bg-white hover:bg-opacity-10'}`}
            >
              <FaMagic className="mr-2" />
              <span>Effects</span>
            </button>
            <button 
              onClick={() => setActiveTab('components')} 
              className={`px-4 py-2 rounded-full flex items-center ${activeTab === 'components' ? 'bg-white bg-opacity-20 shadow-sm' : 'hover:bg-white hover:bg-opacity-10'}`}
            >
              <FaLayerGroup className="mr-2" />
              <span>Components</span>
            </button>
          </div>
        </div>
      
      {/* Color Palette */}
      <section className={`mb-12 ${activeTab !== 'colors' ? 'hidden' : ''}`}>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-6 flex items-center"
        >
          <FaPalette className="mr-3 text-primary-500" />
          <span>Color Palette</span>
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-2xl mb-4 gradient-text-primary">Primary Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="h-24 bg-primary-50 rounded-t-xl"></div>
              <div className="bg-white p-3 border border-t-0 rounded-b-xl">
                <div className="text-sm font-medium">50</div>
                <div className="text-xs text-neutral-500">#eff6ff</div>
              </div>
            </div>
            <div>
              <div className="h-24 bg-primary-100 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">100</div>
                <div className="text-xs text-neutral-500">#dbeafe</div>
              </div>
            </div>
            <div>
              <div className="h-24 bg-primary-300 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">300</div>
                <div className="text-xs text-neutral-500">#93c5fd</div>
              </div>
            </div>
            <div>
              <div className="h-24 bg-primary-500 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">500</div>
                <div className="text-xs text-neutral-500">#3b82f6</div>
              </div>
            </div>
            <div>
              <div className="h-24 bg-primary-700 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">700</div>
                <div className="text-xs text-neutral-500">#1d4ed8</div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-2xl mb-4 gradient-text-secondary">Secondary Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="h-24 bg-secondary-50 rounded-t-xl"></div>
              <div className="bg-white p-3 border border-t-0 rounded-b-xl">
                <div className="text-sm font-medium">50</div>
                <div className="text-xs text-neutral-500">#f0fdfa</div>
              </div>
            </div>
            <div>
              <div className="h-24 bg-secondary-100 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">100</div>
                <div className="text-xs text-neutral-500">#ccfbf1</div>
              </div>
            </div>
            <div>
              <div className="h-24 bg-secondary-300 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">300</div>
                <div className="text-xs text-neutral-500">#5eead4</div>
              </div>
            </div>
            <div>
              <div className="h-24 bg-secondary-500 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">500</div>
                <div className="text-xs text-neutral-500">#14b8a6</div>
              </div>
            </div>
            <div>
              <div className="h-24 bg-secondary-700 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">700</div>
                <div className="text-xs text-neutral-500">#0f766e</div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="mb-6">
          <h3 className="text-xl mb-2">Semantic Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <div className="h-24 bg-success-500 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">Success</div>
                <div className="text-xs text-neutral-500">#22c55e</div>
              </div>
            </div>
            <div>
              <div className="h-24 bg-warning-500 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">Warning</div>
                <div className="text-xs text-neutral-500">#f59e0b</div>
              </div>
            </div>
            <div>
              <div className="h-24 bg-danger-500 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">Danger</div>
                <div className="text-xs text-neutral-500">#ef4444</div>
              </div>
            </div>
            <div>
              <div className="h-24 bg-neutral-500 rounded-t-md"></div>
              <div className="bg-white p-2 border border-t-0 rounded-b-md">
                <div className="text-sm font-medium">Neutral</div>
                <div className="text-xs text-neutral-500">#737373</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Typography */}
      <section className={`mb-12 ${activeTab !== 'typography' ? 'hidden' : ''}`}>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-6 flex items-center"
        >
          <FaCode className="mr-3 text-primary-500" />
          <span>Typography</span>
        </motion.h2>
        
        <div className="mb-6">
          <h3 className="text-xl mb-4">Headings</h3>
          <div className="space-y-4 bg-white p-4 rounded-md border">
            <div>
              <h1>Heading 1</h1>
              <div className="text-sm text-neutral-500 mt-1">font-display, 3rem (48px), semibold</div>
            </div>
            <div>
              <h2>Heading 2</h2>
              <div className="text-sm text-neutral-500 mt-1">font-display, 2.25rem (36px), semibold</div>
            </div>
            <div>
              <h3>Heading 3</h3>
              <div className="text-sm text-neutral-500 mt-1">font-display, 1.875rem (30px), semibold</div>
            </div>
            <div>
              <h4>Heading 4</h4>
              <div className="text-sm text-neutral-500 mt-1">font-display, 1.5rem (24px), semibold</div>
            </div>
            <div>
              <h5>Heading 5</h5>
              <div className="text-sm text-neutral-500 mt-1">font-display, 1.25rem (20px), semibold</div>
            </div>
            <div>
              <h6>Heading 6</h6>
              <div className="text-sm text-neutral-500 mt-1">font-display, 1rem (16px), semibold</div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl mb-4">Body Text</h3>
          <div className="space-y-4 bg-white p-4 rounded-md border">
            <div>
              <p className="text-sm">Small Text: The quick brown fox jumps over the lazy dog.</p>
              <div className="text-xs text-neutral-500 mt-1">font-sans, 0.875rem (14px)</div>
            </div>
            <div>
              <p className="text-base">Base Text: The quick brown fox jumps over the lazy dog.</p>
              <div className="text-xs text-neutral-500 mt-1">font-sans, 1rem (16px)</div>
            </div>
            <div>
              <p className="text-lg">Large Text: The quick brown fox jumps over the lazy dog.</p>
              <div className="text-xs text-neutral-500 mt-1">font-sans, 1.125rem (18px)</div>
            </div>
            <div>
              <p className="text-xl">Extra Large Text: The quick brown fox jumps over the lazy dog.</p>
              <div className="text-xs text-neutral-500 mt-1">font-sans, 1.25rem (20px)</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Buttons */}
      <section className={`mb-12 ${activeTab !== 'components' ? 'hidden' : ''}`}>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-6 flex items-center"
        >
          <FaLayerGroup className="mr-3 text-primary-500" />
          <span>Components</span>
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-2xl mb-4">Buttons</h3>
        
        <div className="mb-6">
          <h3 className="text-xl mb-4">Button Variants</h3>
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-md border">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-outline">Outline Button</button>
            <button className="btn-danger">Danger Button</button>
            <button className="btn-primary" disabled>Disabled Button</button>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl mb-4">Button Sizes</h3>
          <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-md border">
            <button className="btn-primary btn-sm">Small Button</button>
            <button className="btn-primary">Default Button</button>
            <button className="btn-primary btn-lg">Large Button</button>
          </div>
        </div>
        </motion.div>
      </section>
      
      {/* Forms */}
      <section className={`mb-12 ${activeTab !== 'components' ? 'hidden' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-2xl mb-4">Form Elements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-md border">
          <div>
            <label htmlFor="example-input" className="form-label">Text Input</label>
            <input 
              type="text" 
              id="example-input" 
              placeholder="Enter text here" 
              className="form-input"
            />
            <div className="form-hint">This is a hint text for the input</div>
          </div>
          
          <div>
            <label htmlFor="example-select" className="form-label">Select Input</label>
            <select 
              id="example-select" 
              className="form-select"
            >
              <option value="">Select an option</option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="example-textarea" className="form-label">Textarea</label>
            <textarea 
              id="example-textarea" 
              placeholder="Enter text here" 
              className="form-input"
              rows={3}
            ></textarea>
          </div>
          
          <div className="space-y-2">
            <label className="form-label">Checkboxes</label>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="checkbox-1" 
                className="form-checkbox"
              />
              <label htmlFor="checkbox-1" className="ml-2 text-sm text-neutral-700">Option 1</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="checkbox-2" 
                className="form-checkbox"
              />
              <label htmlFor="checkbox-2" className="ml-2 text-sm text-neutral-700">Option 2</label>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="form-label">Radio Buttons</label>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="radio-1" 
                name="radio-group" 
                className="form-radio"
              />
              <label htmlFor="radio-1" className="ml-2 text-sm text-neutral-700">Option 1</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="radio-2" 
                name="radio-group" 
                className="form-radio"
              />
              <label htmlFor="radio-2" className="ml-2 text-sm text-neutral-700">Option 2</label>
            </div>
          </div>
          
          <div>
            <label htmlFor="example-error" className="form-label">Input with Error</label>
            <input 
              type="text" 
              id="example-error" 
              className="form-input border-danger-500 focus:border-danger-500 focus:ring-danger-500" 
              placeholder="Error state" 
            />
            <div className="form-error">This field is required</div>
          </div>
        </div>
        </motion.div>
      </section>
      
      {/* Cards */}
      <section className={`mb-12 ${activeTab !== 'components' ? 'hidden' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-2xl mb-4">Cards</h3>
        
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-glass">
            <div className="border-b border-white border-opacity-10 p-4">
              <h3 className="text-lg font-medium gradient-text-primary">Glass Card Title</h3>
            </div>
            <div className="p-6">
              <p className="mb-4">This is a glassmorphism card component with a header, body, and footer. Perfect for modern UI designs.</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Last updated: 3 mins ago</p>
            </div>
            <div className="border-t border-white border-opacity-10 p-4 flex justify-end">
              <button className="btn-glass btn-sm">Action</button>
            </div>
          </div>
          
          <motion.div 
            className="card-glass overflow-hidden"
            whileHover={{ y: -5 }}
          >
            <div className="relative">
              <img src="https://via.placeholder.com/400x200" alt="Card image" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <span className="badge-glass">Featured</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-2 gradient-text-secondary">Card with Image</h3>
              <p className="mb-4">This card has an image with overlay gradient. Great for highlighting content.</p>
              <div className="flex justify-end">
                <button className="btn-glass-primary btn-sm">View Details</button>
              </div>
            </div>
          </motion.div>
          
          <div className="card-glass bg-gradient-subtle p-6">
            <h3 className="text-lg font-medium mb-2 gradient-text-primary">Simple Glass Card</h3>
            <p>A simple glassmorphism card with gradient background. Perfect for elegant, minimalist UI sections.</p>
          </div>
        </div>
        </motion.div>
      </section>
      
      {/* Badges */}
      <section className={`mb-12 ${activeTab !== 'components' ? 'hidden' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-2xl mb-4">Badges</h3>
        
          <div className="flex flex-wrap gap-2 bg-white p-4 rounded-md border">
          <span className="badge-primary">Primary</span>
          <span className="badge-secondary">Secondary</span>
          <span className="badge-success">Success</span>
          <span className="badge-danger">Danger</span>
          <span className="badge-warning">Warning</span>
        </div>
        </motion.div>
      </section>
      
      {/* Alerts */}
      <section className={`mb-12 ${activeTab !== 'components' ? 'hidden' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-2xl mb-4">Alerts</h3>
        
          <div className="space-y-4">
            <div className="alert-info">
              <div className="font-medium">Information</div>
              <div>This is an information alert. Use it to provide general information to users.</div>
            </div>
            
            <div className="alert-success">
              <div className="font-medium">Success</div>
              <div>This is a success alert. Use it to indicate a successful action.</div>
            </div>
            
            <div className="alert-warning">
              <div className="font-medium">Warning</div>
              <div>This is a warning alert. Use it to warn users about potential issues.</div>
            </div>
            
            <div className="alert-danger">
              <div className="font-medium">Error</div>
              <div>This is an error alert. Use it to indicate errors or critical issues.</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Effects & Animations */}
      <section className={`mb-12 ${activeTab !== 'effects' ? 'hidden' : ''}`}>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-6 flex items-center"
        >
          <FaMagic className="mr-3 text-primary-500" />
          <span>Effects & Animations</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Gradients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card-glass p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Gradients</h3>
            <div className="space-y-4">
              <div className="h-16 bg-gradient-primary rounded-lg shadow-md"></div>
              <div className="h-16 bg-gradient-secondary rounded-lg shadow-md"></div>
              <div className="h-16 bg-gradient-accent rounded-lg shadow-md"></div>
              <div className="h-16 bg-gradient-subtle rounded-lg shadow-md"></div>
            </div>
          </motion.div>

          {/* Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-glass p-6 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-300 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary-300 rounded-full filter blur-3xl opacity-20"></div>
            
            <h3 className="text-xl font-semibold mb-4 relative z-10">Glassmorphism</h3>
            
            <div className="relative z-10 space-y-4">
              <div className="card-glass-dark p-4 rounded-lg">
                <p className="text-sm">Glass Dark</p>
              </div>
              <div className="card-glass p-4 rounded-lg">
                <p className="text-sm">Glass Normal</p>
              </div>
              <div className="card-glass-light p-4 rounded-lg">
                <p className="text-sm">Glass Light</p>
              </div>
            </div>
          </motion.div>

          {/* Animations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card-glass p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Animations</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm">Float</span>
                <div className="w-12 h-12 bg-primary-400 rounded-full animate-float"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Pulse</span>
                <div className="w-12 h-12 bg-secondary-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Slide</span>
                <div className="w-12 h-12 bg-accent-400 rounded-full animate-slide"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Spin</span>
                <div className="w-12 h-12 bg-gradient-primary rounded-full animate-spin-slow flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Text Gradients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card-glass p-6 md:col-span-2 lg:col-span-1"
          >
            <h3 className="text-xl font-semibold mb-4">Text Effects</h3>
            
            <div className="space-y-6">
              <div>
                <span className="text-sm text-gray-500 mb-2 block">Primary Gradient</span>
                <h4 className="text-2xl font-bold gradient-text-primary">Gradient Text</h4>
              </div>
              
              <div>
                <span className="text-sm text-gray-500 mb-2 block">Secondary Gradient</span>
                <h4 className="text-2xl font-bold gradient-text-secondary">Gradient Text</h4>
              </div>
              
              <div>
                <span className="text-sm text-gray-500 mb-2 block">Accent Gradient</span>
                <h4 className="text-2xl font-bold gradient-text-accent">Gradient Text</h4>
              </div>
              
              <div>
                <span className="text-sm text-gray-500 mb-2 block">Text Shadow</span>
                <h4 className="text-2xl font-bold text-white text-shadow-lg">Shadow Text</h4>
              </div>
            </div>
          </motion.div>
          
          {/* Interactive Effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card-glass p-6 md:col-span-2 lg:col-span-2"
          >
            <h3 className="text-xl font-semibold mb-4">Interactive Effects</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Hover Scale</p>
                <motion.div 
                  className="card-glass p-4 text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  Hover me to scale
                </motion.div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Hover Rotate</p>
                <motion.div 
                  className="card-glass p-4 text-center"
                  whileHover={{ rotate: 5 }}
                >
                  Hover me to rotate
                </motion.div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Button Fill Effect</p>
                <button className="btn-glass-primary group relative overflow-hidden w-full h-12 flex items-center justify-center">
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">Hover Me</span>
                  <span className="absolute bottom-0 left-0 w-full h-0 bg-primary-500 transition-all duration-300 group-hover:h-full -z-1"></span>
                </button>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Border Reveal</p>
                <div className="group relative p-4 text-center">
                  <span>Hover for border effect</span>
                  <span className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500 rounded-md transition-all duration-300"></span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      </div>
    </div>
  );
};

export default DesignSystem;
