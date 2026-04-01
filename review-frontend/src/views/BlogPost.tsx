'use client'

import React, { useState, useEffect } from 'react';
import { FaClock, FaEye, FaCalendar, FaUser, FaArrowLeft, FaShare } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import Navbar from '../components/layout/Navbar';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BlogPostData {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  author: string;
  authorImage: string | null;
  readTime: number;
  viewCount: number;
  publishedAt: string;
  updatedAt: string;
}

const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiDomain = 'https://api.riviewit.com';
  return `${apiDomain}${url.startsWith('/') ? '' : '/'}${url}`;
};

const BlogPost: React.FC = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Blog post not found');
        } else {
          setError('Failed to load blog post');
        }
        return;
      }

      const data = await response.json();
      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 to-purple-900 text-white">
        <div className="h-[72px]">
          <Navbar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 to-purple-900 text-white">
        <div className="h-[72px]">
          <Navbar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">{error || 'Post not found'}</h2>
            <Link href="/blog" className="text-purple-400 hover:text-purple-300">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 to-purple-900 text-white">
      <div className="h-[72px]">
        <Navbar />
      </div>

      {/* Hero Section with Cover Image */}
      <div className="relative">
        {post.coverImage && (
          <div className="w-full h-96 overflow-hidden">
            <img
              src={getImageUrl(post.coverImage)}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
          </div>
        )}
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors">
          <FaArrowLeft />
          <span>Back to Blog</span>
        </Link>

        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          {post.title}
        </motion.h1>

        {/* Excerpt */}
        <p className="text-xl text-gray-300 mb-8">
          {post.excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 pb-8 mb-8 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            {post.authorImage ? (
              <img
                src={getImageUrl(post.authorImage)}
                alt={post.author}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <FaUser className="text-purple-400" />
              </div>
            )}
            <div>
              <p className="font-medium">{post.author}</p>
              <p className="text-sm text-gray-400">{formatDate(post.publishedAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <FaClock className="text-purple-400" />
              {post.readTime} min read
            </span>
            <span className="flex items-center gap-2">
              <FaEye className="text-purple-400" />
              {post.viewCount} views
            </span>
          </div>

          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <FaShare />
            <span>Share</span>
          </button>
        </div>

        {/* Article Content */}
        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-purple-400 prose-strong:text-white prose-blockquote:border-purple-500 prose-code:text-purple-300">
          <div
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-neutral-700">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-neutral-800 text-gray-300 rounded-lg text-sm hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <FaArrowLeft />
            <span>Read More Articles</span>
          </Link>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
