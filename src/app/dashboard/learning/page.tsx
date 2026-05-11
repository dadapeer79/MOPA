'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap,
  Clock,
  Star,
  Users,
  PlayCircle,
  BookOpen,
  Calendar,
  Tag,
  ChevronRight,
  Headphones
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { BusinessCourse, BlogPost, Audiobook, CourseCategory } from '@/types/business';

// Dummy data for courses
const courses: BusinessCourse[] = [
  {
    id: 'fin-101',
    title: 'Business Finance Fundamentals',
    instructor: 'Dr. Rajesh Kumar',
    category: 'finance',
    level: 'beginner',
    description: 'Master the basics of business finance, from cash flow management to financial planning',
    price: 4999,
    duration: 12, // hours
    modules: [
      {
        title: 'Introduction to Business Finance',
        duration: 45,
        topics: ['Financial statements', 'Cash flow basics', 'Profit & loss']
      },
      {
        title: 'Financial Planning',
        duration: 60,
        topics: ['Budgeting', 'Forecasting', 'Risk management']
      }
    ],
    thumbnail: '/course-finance.jpg',
    rating: 4.8,
    studentsEnrolled: 1250,
    featured: true
  },
  {
    id: 'mkt-201',
    title: 'Digital Marketing Mastery',
    instructor: 'Priya Singh',
    category: 'marketing',
    level: 'intermediate',
    description: 'Learn advanced digital marketing strategies for business growth',
    price: 5999,
    duration: 15,
    modules: [
      {
        title: 'Social Media Marketing',
        duration: 60,
        topics: ['Platform strategy', 'Content creation', 'Analytics']
      },
      {
        title: 'SEO & SEM',
        duration: 90,
        topics: ['Keyword research', 'On-page SEO', 'Google Ads']
      }
    ],
    thumbnail: '/course-marketing.jpg',
    rating: 4.6,
    studentsEnrolled: 890
  }
];

// Dummy data for blog posts
const blogs: BlogPost[] = [
  {
    id: 'blog-1',
    title: '10 Essential Financial Tips for Small Business Owners',
    excerpt: 'Learn the crucial financial practices that can make or break your small business.',
    content: 'Full content here...',
    author: 'Rajesh Kumar',
    date: '2025-10-28',
    category: 'finance',
    readTime: 8,
    thumbnail: '/blog-finance.jpg',
    tags: ['Finance', 'Small Business', 'Money Management']
  },
  {
    id: 'blog-2',
    title: 'The Future of Digital Marketing in 2026',
    excerpt: 'Discover upcoming trends and technologies that will shape digital marketing.',
    content: 'Full content here...',
    author: 'Priya Singh',
    date: '2025-10-25',
    category: 'marketing',
    readTime: 6,
    thumbnail: '/blog-marketing.jpg',
    tags: ['Marketing', 'Digital', 'Trends']
  }
];

// Dummy data for audiobooks
const audiobooks: Audiobook[] = [
  {
    id: 'audio-1',
    title: 'The Art of Small Business Management',
    narrator: 'Vikram Verma',
    author: 'Dr. Rajesh Kumar',
    category: 'operations',
    level: 'beginner',
    description: 'Master the essential skills of managing a small business efficiently and profitably through this comprehensive audio guide.',
    price: 3999,
    duration: 10,
    chapters: 15,
    thumbnail: '/audiobook-ops.jpg',
    rating: 4.7,
    listeners: 650,
    featured: true,
    language: 'Multilingual'
  },
  {
    id: 'audio-2',
    title: 'Financial Freedom for Entrepreneurs',
    narrator: 'Ananya Sharma',
    author: 'Dr. Rajesh Kumar',
    category: 'finance',
    level: 'intermediate',
    description: 'Learn proven strategies to build wealth and achieve financial independence as an entrepreneur.',
    price: 4499,
    duration: 12,
    chapters: 18,
    thumbnail: '/audiobook-finance.jpg',
    rating: 4.9,
    listeners: 1200,
    language: 'English'
  },
  {
    id: 'audio-3',
    title: 'Digital Marketing Essentials for Business Growth',
    narrator: 'Rohan Patel',
    author: 'Priya Singh',
    category: 'marketing',
    level: 'intermediate',
    description: 'Discover practical digital marketing techniques to grow your business in the modern digital landscape.',
    price: 3499,
    duration: 8,
    chapters: 12,
    thumbnail: '/audiobook-marketing.jpg',
    rating: 4.5,
    listeners: 890,
    language: 'Hindi'
  },
  {
    id: 'audio-4',
    title: 'Leadership Skills for Modern Business',
    narrator: 'Meera Desai',
    author: 'Rajesh Kumar',
    category: 'leadership',
    level: 'advanced',
    description: 'Develop advanced leadership capabilities to inspire teams and drive organizational excellence.',
    price: 5499,
    duration: 14,
    chapters: 20,
    thumbnail: '/audiobook-leadership.jpg',
    rating: 4.8,
    listeners: 750,
    featured: true,
    language: 'Multilingual'
  }
];

const categoryColors: Record<CourseCategory, string> = {
  finance: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  marketing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  operations: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  leadership: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  technology: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  strategy: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
};

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'blogs' | 'audiobooks'>('courses');

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Business Learning Hub"
        description="Enhance your business skills with our expert-led courses and insightful blog articles."
      />

      <Tabs defaultValue="courses" className="w-full" onValueChange={(v) => setActiveTab(v as 'courses' | 'blogs' | 'audiobooks')}>
        <TabsList className="grid w-[600px] grid-cols-3">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="blogs">Blog Articles</TabsTrigger>
          <TabsTrigger value="audiobooks">Audiobooks</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className={course.featured ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge className={categoryColors[course.category]}>
                        {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                      </Badge>
                      {course.featured && <Badge>Featured</Badge>}
                    </div>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`/instructors/${course.id}.jpg`} />
                      <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{course.instructor}</div>
                      <div className="text-sm text-muted-foreground">Course Instructor</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{course.duration} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{course.rating} rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{course.studentsEnrolled} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{course.modules.length} modules</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="text-2xl font-bold">₹{course.price}</div>
                  <Button>
                    Enroll Now
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blogs" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {blogs.map((blog) => (
              <Card key={blog.id}>
                <CardHeader>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[blog.category]}>
                        {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                      </Badge>
                    </div>
                    <CardTitle>{blog.title}</CardTitle>
                    <CardDescription>{blog.excerpt}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(blog.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {blog.readTime} min read
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Article</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <div key={tag} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full">
                    Read Article
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audiobooks" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {audiobooks.map((audiobook) => (
              <Card key={audiobook.id} className={audiobook.featured ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge className={categoryColors[audiobook.category]}>
                        {audiobook.category.charAt(0).toUpperCase() + audiobook.category.slice(1)}
                      </Badge>
                      {audiobook.featured && <Badge>Featured</Badge>}
                    </div>
                    <CardTitle>{audiobook.title}</CardTitle>
                    <CardDescription>{audiobook.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`/narrators/${audiobook.id}.jpg`} />
                      <AvatarFallback>{audiobook.narrator.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{audiobook.narrator}</div>
                      <div className="text-sm text-muted-foreground">Narrator</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{audiobook.duration} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{audiobook.rating} rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{audiobook.listeners} listeners</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{audiobook.chapters} chapters</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{audiobook.language}</Badge>
                    <div className="text-sm text-muted-foreground">By {audiobook.author}</div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="text-2xl font-bold">₹{audiobook.price}</div>
                  <Button>
                    Listen Now
                    <Headphones className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}