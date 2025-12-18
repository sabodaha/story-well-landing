'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const mockReviews: Review[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    rating: 5,
    comment: 'My kids absolutely love Story Well! The illustrations are magical and switching languages is so easy.',
    date: '2024-03-15',
  },
  {
    id: 2,
    name: 'Michael Schmidt',
    rating: 5,
    comment: 'Great app for bilingual families. We use it every night for bedtime stories.',
    date: '2024-03-10',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    rating: 4,
    comment: 'Beautiful stories. Would love to see more languages added in the future!',
    date: '2024-02-28',
  },
];

export default function ReviewsPage() {
  const t = useTranslations();
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    const newReview: Review = {
      id: reviews.length + 1,
      name,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews([newReview, ...reviews]);
    setSubmitted(true);
    setName('');
    setComment('');
    setRating(5);
    
    // Reset success message after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation - Same as Home but simplified */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Story Well
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-gray-700 hover:text-purple-600 transition">
                {t.navFeatures}
              </Link>
              <Link href="/#languages" className="text-gray-700 hover:text-purple-600 transition">
                {t.navLanguages}
              </Link>
              <Link href="/#faq" className="text-gray-700 hover:text-purple-600 transition">
                {t.navFAQ}
              </Link>
              <LanguageSwitcher />
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {t.navDownload}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
            {t.navReviews}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {t.reviewsTitle}
          </h1>
          <p className="text-xl text-gray-600">
            {t.reviewsSubtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Review Form */}
          <Card className="md:col-span-1 h-fit sticky top-24 border-2 border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle>{t.reviewsFormTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.reviewsNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.reviewsRatingLabel}
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.reviewsCommentLabel}
                  </label>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                  {t.reviewsSubmitButton}
                </Button>
                {submitted && (
                  <p className="text-green-600 text-sm text-center font-medium animate-pulse">
                    {t.reviewsSuccessMessage}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-10">{t.reviewsNoReviews}</p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="border-2 hover:border-purple-200 transition-all hover:shadow-md bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{review.name}</h3>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      "{review.comment}"
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Footer - Simplified */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            {t.footerCopyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
