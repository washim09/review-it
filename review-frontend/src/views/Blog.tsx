'use client'

import React, { useState, useEffect } from 'react';
import { FaSearch, FaClock, FaEye, FaCalendar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/layout/Navbar';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  author: string;
  authorImage: string | null;
  readTime: number;
  viewCount: number;
  publishedAt: string;
}

const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiDomain = 'https://api.riviewit.com';
  return `${apiDomain}${url.startsWith('/') ? '' : '/'}${url}`;
};

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/categories`);
      const data = await response.json();
      setCategories(['all', ...data.categories]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '12',
        offset: '0',
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`${API_BASE_URL}/api/blog?${params}`);
      const data = await response.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

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
            <span className="text-white">Our</span> <span className="text-purple-400">Blog</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Expert insights, tips, and guides to help you make better purchasing decisions.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Filter */}
      <section className="py-8 bg-neutral-800/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-400">No blog posts found.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link href={`/blog/${post.slug}`} className="group block h-full">
                      <div className="bg-neutral-800/70 rounded-lg overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all h-full flex flex-col">
                        {/* Cover Image */}
                        <div className="aspect-video bg-neutral-700 overflow-hidden">
                          {post.coverImage ? (
                            <img
                              src={getImageUrl(post.coverImage)}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaCalendar className="text-6xl text-purple-400/30" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          {/* Category Badge */}
                          <div className="mb-3">
                            <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                              {post.category}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-gray-400 mb-4 line-clamp-3 flex-1">
                            {post.excerpt}
                          </p>

                          {/* Meta Info */}
                          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-neutral-700">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <FaClock className="text-purple-400" />
                                {post.readTime} min
                              </span>
                              <span className="flex items-center gap-1">
                                <FaEye className="text-purple-400" />
                                {post.viewCount}
                              </span>
                            </div>
                            <span className="text-gray-600">
                              {formatDate(post.publishedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>

              {/* Results Count */}
              <div className="text-center mt-12">
                <p className="text-gray-400">
                  Showing {filteredPosts.length} of {total} articles
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
