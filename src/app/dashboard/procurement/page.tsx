'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getProductProcurementSuggestions } from '@/ai/flows/product-procurement-suggestions';
import type { ProductProcurementSuggestionsOutput } from '@/ai/flows/product-procurement-suggestions';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Wand2, ShoppingCart, PackageSearch, Volume2, Square, Phone, MapPin, Star, Truck, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Wholesaler } from '@/types/business';
import Link from 'next/link';

const platformUrls: Record<string, string> = {
  'Zepto': 'https://www.zeptonow.com/',
  'Flipkart': 'https://www.flipkart.com/',
  'Blinkit': 'https://www.blinkit.com/',
  'Amazon': 'https://www.amazon.in/',
  'BigBasket': 'https://www.bigbasket.com/',
  'JioMart': 'https://www.jiomart.com/',
};

const wholesalers: Wholesaler[] = [
  {
    id: 'ws-1',
    shopName: 'Sharma General Wholesale',
    shopNumber: '+91-9876543210',
    location: 'Wholesale Market, Delhi',
    address: '123 Chandni Chowk Market, Ground Floor',
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110006',
    contactPerson: 'Rajesh Sharma',
    email: 'rajesh@sharmageneralwholesale.com',
    rating: 4.8,
    reviews: 342,
    speciality: 'Groceries & Dry Goods',
    products: [
      { name: 'Amul Gold Milk (1L)', price: 52, pricePerUnit: '₹52/unit', unit: 'Carton', stock: 500 },
      { name: 'Rice (10kg bag)', price: 480, pricePerUnit: '₹48/kg', unit: 'Bag', stock: 200 },
      { name: 'Atta (10kg bag)', price: 320, pricePerUnit: '₹32/kg', unit: 'Bag', stock: 150 }
    ],
    minOrderQuantity: 10,
    deliveryTime: '1-2 days',
    paymentMethods: ['Cash', 'Bank Transfer', 'Cheque', 'UPI'],
    featured: true
  },
  {
    id: 'ws-2',
    shopName: 'Patel Brothers Trading',
    shopNumber: '+91-8765432109',
    location: 'Bhagirath Palace, Delhi',
    address: 'Building A, Room 215, Bhagirath Palace',
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110006',
    contactPerson: 'Vikram Patel',
    email: 'vikram@patelbrothers.in',
    rating: 4.6,
    reviews: 287,
    speciality: 'Electronics & Appliances',
    products: [
      { name: 'LED Bulbs (9W)', price: 65, pricePerUnit: '₹65/bulb', unit: 'Piece', stock: 300 },
      { name: 'Mobile Phone Charger', price: 180, pricePerUnit: '₹180/unit', unit: 'Piece', stock: 400 },
      { name: 'USB Cables (1m)', price: 45, pricePerUnit: '₹45/unit', unit: 'Piece', stock: 600 }
    ],
    minOrderQuantity: 5,
    deliveryTime: '2-3 days',
    paymentMethods: ['Bank Transfer', 'Cheque', 'NEFT'],
    featured: true
  },
  {
    id: 'ws-3',
    shopName: 'Kumar & Sons Distributors',
    shopNumber: '+91-7654321098',
    location: 'Sadar Bazaar, Delhi',
    address: '456 Sadar Bazaar Road, First Floor',
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110007',
    contactPerson: 'Arun Kumar',
    email: 'arun@kumarandsons.co.in',
    rating: 4.7,
    reviews: 215,
    speciality: 'Clothing & Textiles',
    products: [
      { name: 'Cotton T-Shirts (M)', price: 150, pricePerUnit: '₹150/piece', unit: 'Piece', stock: 250 },
      { name: 'Denim Jeans', price: 450, pricePerUnit: '₹450/piece', unit: 'Piece', stock: 120 },
      { name: 'Cotton Bed Sheets', price: 280, pricePerUnit: '₹280/piece', unit: 'Piece', stock: 180 }
    ],
    minOrderQuantity: 12,
    deliveryTime: '3-4 days',
    paymentMethods: ['Cash', 'Bank Transfer', 'UPI'],
    featured: false
  },
  {
    id: 'ws-4',
    shopName: 'Singh Organic Farms',
    shopNumber: '+91-6543210987',
    location: 'Azadpur Market, Delhi',
    address: '789 Azadpur Market, Stall No. 45',
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110033',
    contactPerson: 'Harpreet Singh',
    email: 'harpreet@singorganicfarms.in',
    rating: 4.9,
    reviews: 198,
    speciality: 'Organic & Fresh Produce',
    products: [
      { name: 'Organic Vegetables Bundle', price: 320, pricePerUnit: '₹320/bundle', unit: 'Bundle', stock: 150 },
      { name: 'Fresh Fruits (Apples)', price: 180, pricePerUnit: '₹180/kg', unit: 'kg', stock: 200 },
      { name: 'Honey (Pure)', price: 480, pricePerUnit: '₹480/liter', unit: 'Liter', stock: 80 }
    ],
    minOrderQuantity: 5,
    deliveryTime: '1 day',
    paymentMethods: ['Cash', 'UPI', 'Bank Transfer'],
    featured: true
  },
  {
    id: 'ws-5',
    shopName: 'National Trading House',
    shopNumber: '+91-5432109876',
    location: 'Kinari Bazaar, Delhi',
    address: '321 Kinari Bazaar, Second Floor',
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110006',
    contactPerson: 'Mohit Verma',
    email: 'mohit@nationaltrading.com',
    rating: 4.5,
    reviews: 156,
    speciality: 'Kitchenware & Utensils',
    products: [
      { name: 'Stainless Steel Plates', price: 85, pricePerUnit: '₹85/plate', unit: 'Piece', stock: 400 },
      { name: 'Non-Stick Cookware Set', price: 1200, pricePerUnit: '₹1200/set', unit: 'Set', stock: 60 },
      { name: 'Glass Cups (200ml)', price: 35, pricePerUnit: '₹35/cup', unit: 'Piece', stock: 500 }
    ],
    minOrderQuantity: 8,
    deliveryTime: '2 days',
    paymentMethods: ['Bank Transfer', 'Cheque', 'Cash'],
    featured: false
  }
];

const languageOptions = ['en', 'hi', 'kn'] as const;

const formSchema = z.object({
  productName: z.string(),
  currentInventory: z.number(),
  reorderPoint: z.number(),
  salesVelocity: z.number(),
  leadTimeDays: z.number(),
  safetyStockDays: z.number(),
  language: z.enum(languageOptions),
});

// Function to filter wholesalers based on product name
const getRelevantWholesalers = (productName: string): Wholesaler[] => {
  if (!productName.trim()) return wholesalers;
  
  const searchTerm = productName.toLowerCase();
  
  return wholesalers.filter(wholesaler => {
    // Check if product name matches speciality
    const specialityMatch = wholesaler.speciality.toLowerCase().includes(searchTerm);
    
    // Check if product name matches any of their products
    const productMatch = wholesaler.products.some(product =>
      product.name.toLowerCase().includes(searchTerm)
    );
    
    // Check for category keywords
    const categoryKeywords: Record<string, string> = {
      'milk|dairy|amul|paneer|yogurt|cheese': 'Dairy Products',
      'rice|atta|wheat|flour|grain': 'Groceries & Dry Goods',
      'bulb|charger|cable|electronics|wire': 'Electronics & Appliances',
      'shirt|tshirt|jeans|cloth|fabric|garment': 'Clothing & Textiles',
      'vegetable|fruit|organic|apple|banana|potato': 'Organic & Fresh Produce',
      'plate|cup|pan|cookware|utensil|kitchen': 'Kitchenware & Utensils'
    };
    
    let categoryMatch = false;
    for (const [keywords, category] of Object.entries(categoryKeywords)) {
      if (keywords.split('|').some(kw => searchTerm.includes(kw)) && 
          wholesaler.speciality.includes(category)) {
        categoryMatch = true;
        break;
      }
    }
    
    return specialityMatch || productMatch || categoryMatch;
  }).sort((a, b) => {
    // Sort featured first
    if (a.featured !== b.featured) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
    // Then by rating
    return b.rating - a.rating;
  });
};

type FormData = z.infer<typeof formSchema>;

export default function ProcurementPage() {
  const [suggestion, setSuggestion] = useState<ProductProcurementSuggestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    defaultValues: {
      productName: '',
      currentInventory: 0,
      reorderPoint: 0,
      salesVelocity: 0,
      leadTimeDays: 1,
      safetyStockDays: 7,
      language: 'en',
    },
    resolver: zodResolver(formSchema)
  });

  const handleAudio = async () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (suggestion?.reasoning) {
      setAudioLoading(true);
      try {
        const result = await textToSpeech({
          text: suggestion.reasoning,
          language: form.getValues('language'),
        });
        if (result.media === 'speech-synthesis-active') {
          setIsPlaying(true);
        }
      } catch (e) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "Audio Error",
          description: "Could not play audio.",
        });
      } finally {
        setAudioLoading(false);
      }
    }
  };

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setSuggestion(null);
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
    try {
      const result = await getProductProcurementSuggestions(data);
      setSuggestion(result);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: "Could not generate suggestion. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Procurement Planner"
        description="Get AI-powered suggestions for your product procurement."
      />
      
      {/* Form & Results Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit shadow-sm border-border/60">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Enter product information to get a reorder suggestion.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Response Language</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="en" />
                            </FormControl>
                            <FormLabel className="font-normal">English</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="hi" />
                            </FormControl>
                            <FormLabel className="font-normal">Hindi</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="kn" />
                            </FormControl>
                            <FormLabel className="font-normal">Kannada</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Amul Gold Milk" {...field} suppressHydrationWarning />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentInventory"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Current Inventory (units)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          onChange={(e) => onChange(Number(e.target.value))} 
                          {...field} 
                          suppressHydrationWarning 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reorderPoint"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Reorder Point (units)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          onChange={(e) => onChange(Number(e.target.value))} 
                          {...field} 
                          suppressHydrationWarning 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salesVelocity"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Sales Velocity (units/day)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          onChange={(e) => onChange(Number(e.target.value))} 
                          {...field} 
                          suppressHydrationWarning 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leadTimeDays"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Lead Time (days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          onChange={(e) => onChange(Number(e.target.value))} 
                          {...field} 
                          suppressHydrationWarning 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="safetyStockDays"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Safety Stock (days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Defaults to 7" 
                          onChange={(e) => onChange(Number(e.target.value))} 
                          {...field} 
                          suppressHydrationWarning 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full" suppressHydrationWarning>
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Suggestion
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <div className="lg:col-span-2">
          <Card className="min-h-[400px] shadow-sm border-border/60">
            {isLoading ? (
              <div className="flex h-full min-h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Our AI is crunching the numbers...</p>
                </div>
              </div>
            ) : suggestion ? (
              <div className="animate-in fade-in-50">
                <CardHeader>
                  <CardTitle className="text-2xl">Procurement Suggestion</CardTitle>
                  <CardDescription>Based on the information provided, here is our AI-powered recommendation.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center p-6 bg-accent/20 rounded-lg border border-accent">
                      <p className="text-sm font-medium text-foreground/80">Suggested Order Quantity</p>
                      <p className="text-6xl font-bold text-primary">{suggestion.suggestedOrderQuantity}</p>
                      <p className="text-sm font-medium text-foreground/80">units</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-accent/20 rounded-lg border border-accent">
                      <p className="text-sm font-medium text-foreground/80">Inventory Runout In</p>
                      <p className="text-6xl font-bold text-primary">{Math.round(suggestion.inventoryRunoutDays)}</p>
                      <p className="text-sm font-medium text-foreground/80">days</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold flex items-center gap-2"><PackageSearch className="h-5 w-5 text-primary" />AI Reasoning</h3>
                        <Button onClick={handleAudio} variant="ghost" size="icon" disabled={audioLoading}>
                          {audioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          <span className="sr-only">Read aloud</span>
                        </Button>
                      </div>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-muted/50 p-4 rounded-md border">{suggestion.reasoning}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" />Suggested Platforms</h3>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.suggestedApps?.map((app, index) => {
                          const url = platformUrls[app];
                          return url ? (
                            <Link key={index} href={url} target="_blank" rel="noopener noreferrer">
                              <Badge variant="secondary" className="text-base hover:bg-secondary/80 cursor-pointer">{app}</Badge>
                            </Link>
                          ) : (
                            <Badge key={index} variant="secondary" className="text-base">{app}</Badge>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center border-dashed">
                <div className="text-center text-muted-foreground">
                  <Wand2 className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-semibold">Your AI suggestion will appear here</h3>
                  <p className="text-sm">Fill out the form to get started.</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Wholesalers Section - Shows after suggestion is generated */}
      {suggestion && (
        <div className="animate-in fade-in-50 slide-in-from-bottom-4">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Recommended Wholesalers for {form.getValues('productName')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {getRelevantWholesalers(form.getValues('productName')).length > 0 
              ? 'These wholesalers specialize in products matching your requirements'
              : 'All trusted wholesalers available for you'}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getRelevantWholesalers(form.getValues('productName')).map((wholesaler) => (
              <Card key={wholesaler.id} className={`flex flex-col shadow-sm border-border/60 hover:shadow-lg transition-shadow ${wholesaler.featured ? 'border-primary border-2' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{wholesaler.shopName}</CardTitle>
                      <CardDescription className="text-xs mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {wholesaler.city}, {wholesaler.state}
                      </CardDescription>
                    </div>
                    {wholesaler.featured && <Badge className="text-xs">Featured</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">{wholesaler.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({wholesaler.reviews} reviews)</span>
                  </div>

                  {/* Contact & Location */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a href={`tel:${wholesaler.shopNumber}`} className="text-primary hover:underline truncate">
                        {wholesaler.shopNumber}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <div>{wholesaler.address}</div>
                        <div className="text-muted-foreground">{wholesaler.city} - {wholesaler.pinCode}</div>
                      </div>
                    </div>
                  </div>

                  {/* Speciality */}
                  <div>
                    <Badge variant="outline" className="text-xs">{wholesaler.speciality}</Badge>
                  </div>

                  {/* Contact Person & Email */}
                  <div className="text-xs space-y-1 border-t pt-2">
                    <div><span className="font-semibold">Contact:</span> {wholesaler.contactPerson}</div>
                    <div className="truncate">
                      <span className="font-semibold">Email:</span> <a href={`mailto:${wholesaler.email}`} className="text-primary hover:underline">{wholesaler.email}</a>
                    </div>
                  </div>

                  {/* Delivery & Payment Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-accent/20 p-2 rounded-md">
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3 text-muted-foreground" />
                      <span>{wholesaler.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                      <span>{wholesaler.paymentMethods[0]}</span>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Top Products:</h4>
                    <div className="space-y-1">
                      {wholesaler.products.slice(0, 2).map((product, idx) => {
                        const isMatching = product.name.toLowerCase().includes(form.getValues('productName').toLowerCase());
                        return (
                          <div key={idx} className={`text-xs p-2 rounded transition-colors ${
                            isMatching 
                              ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' 
                              : 'bg-muted/50'
                          }`}>
                            <div className="font-medium flex items-center gap-2">
                              {isMatching && <span className="text-green-600 dark:text-green-400">✓</span>}
                              {product.name}
                            </div>
                            <div className="text-primary font-semibold">{product.pricePerUnit}</div>
                            <div className="text-muted-foreground text-xs">Stock: {product.stock} units</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm" className="flex-1" variant="default">
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" className="flex-1" variant="outline">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Request Quote
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}