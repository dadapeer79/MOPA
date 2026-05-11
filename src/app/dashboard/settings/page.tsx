

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { sendOtp, verifyOtp } from '@/ai/flows/otp-flow';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, LogOut, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email(),
  storeName: z.string().min(2, {
    message: 'Store name must be at least 2 characters.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultProfileValues: ProfileFormValues = {
  name: 'Retailer',
  email: 'store.owner@example.com',
  storeName: 'My Awesome Store',
};

const colors = [
  { name: "indigo", hsl: "234 89% 74%", description: "Professional & trustworthy" },
  { name: "blue", hsl: "206 100% 50%", description: "Reliable & calm" },
  { name: "green", hsl: "142 72% 29%", description: "Growth & stability" },
  { name: "teal", hsl: "166 76% 41%", description: "Balanced & sophisticated" },
  { name: "purple", hsl: "266 100% 60%", description: "Creative & luxurious" },
  { name: "rose", hsl: "336 80% 58%", description: "Energetic & bold" },
  { name: "amber", hsl: "38 92% 50%", description: "Warm & inviting" },
  { name: "slate", hsl: "215 25% 27%", description: "Professional & neutral" },
  { name: "red", hsl: "0 84% 60%", description: "Dynamic & attention-grabbing" },
  { name: "emerald", hsl: "152 76% 44%", description: "Fresh & natural" },
  { name: "violet", hsl: "272 72% 47%", description: "Elegant & mysterious" },
  { name: "cyan", hsl: "190 95% 39%", description: "Clean & refreshing" },
];


export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeColor, setActiveColor] = useState(colors[0]?.hsl ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState(defaultProfileValues);

  const [otpSent, setOtpSent] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileData,
    mode: 'onChange',
  });

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      setProfileData(parsedProfile);
      profileForm.reset(parsedProfile);
    }
    if(storedAvatar) {
      setAvatarPreview(storedAvatar);
    }
    setMounted(true);
  }, [profileForm]);
  
  useEffect(() => {
    if (mounted) {
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      if(primaryColor) {
        const [h, s, l] = primaryColor.split(' ').map(v => parseFloat(v));
        const currentHsl = `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;

        const matchedColor = colors.find(color => {
          const colorHsl = color.hsl.replace(/%/g, '').replace(/\s/g, '');
          const currentHslFormatted = currentHsl.replace(/%/g, '').replace(/\s/g, '');
          return colorHsl === currentHslFormatted;
        });

        if (matchedColor) {
          setActiveColor(matchedColor.hsl);
        }
      }
    }
  }, [mounted]);

  async function onProfileSubmit(data: ProfileFormValues) {
    const originalProfile = JSON.parse(localStorage.getItem('userProfile') || JSON.stringify(defaultProfileValues));

    if (data.email !== originalProfile.email) {
      setEmailToVerify(data.email);
      try {
        const response = await sendOtp(data.email);
        alert(`OTP sent! For testing, your OTP is: ${response.otp}`); // Mock OTP sending
        setOtpSent(true);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to send OTP",
          description: "Could not send OTP to the new email address. Please try again.",
        });
      }
      return;
    }

    localStorage.setItem('userProfile', JSON.stringify(data));
    if(avatarPreview) {
      localStorage.setItem('userAvatar', avatarPreview);
    }
    setProfileData(data);
    
    window.dispatchEvent(new Event('storage'));

    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been successfully updated.',
    });
  }

  async function handleVerifyOtp() {
    setVerifying(true);
    try {
      const success = await verifyOtp({ email: emailToVerify, otp });
      if (success) {
        const updatedProfile = { ...profileData, email: emailToVerify };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        if (avatarPreview) {
          localStorage.setItem('userAvatar', avatarPreview);
        }
        setProfileData(updatedProfile);
        profileForm.reset(updatedProfile);
        window.dispatchEvent(new Event('storage'));
        setOtpSent(false);
        setEmailToVerify('');
        setOtp('');
        toast({
          title: 'Email Updated',
          description: 'Your email has been successfully updated.',
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "An error occurred during OTP verification.",
      });
    } finally {
      setVerifying(false);
    }
  }

  const handleThemeChange = (colorHsl: string) => {
      const root = document.documentElement;
      const [h, s, l] = colorHsl.split(' ').map(val => val.replace('%', ''));
      if(h && s && l) {
        root.style.setProperty('--primary', `${h} ${s}% ${l}%`);
        setActiveColor(colorHsl);
      }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userAvatar');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences."
        actions={
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        }
      />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal and store information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-6"
              >
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24 cursor-pointer relative group" onClick={handleAvatarClick}>
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="User profile" />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <User className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <AvatarFallback>
                      {profileData.name?.[0].toUpperCase()}
                    </AvatarFallback>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <span className="text-white text-sm">Change</span>
                    </div>
                  </Avatar>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <Button type="button" variant="outline" onClick={handleAvatarClick}>
                    Change Picture
                  </Button>
                </div>
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                       <FormDescription>
                        You will need to verify your new email address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={profileForm.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Store" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Update Profile</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 h-fit">
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Accent Color</div>
                    <p className="text-sm text-muted-foreground">Select a primary color for the UI.</p>
                </div>
                 <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                    {colors.map((color) => {
                        const isActive = activeColor === color.hsl;
                        return (
                        <TooltipProvider key={color.name}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handleThemeChange(color.hsl)}
                                        className={cn(
                                          'h-16 w-16 rounded-lg transition-all hover:scale-110 relative overflow-hidden',
                                          isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                        )}
                                        style={{
                                          background: `hsl(${color.hsl})`,
                                          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                      {isActive && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="rounded-full bg-white w-2 h-2" />
                                        </div>
                                      )}
                                      <span className="sr-only">{color.name}</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="capitalize">{color.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        );
                    })}
                    
                    <div className="col-span-full mt-6 border-t pt-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">UPI Integration</h3>
                        <p className="text-sm text-muted-foreground">Connect your UPI for seamless payments</p>
                        <Button variant="outline" className="w-fit" asChild>
                          <Link href="/dashboard/upi-link">
                            Link with UPI
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
    <AlertDialog open={otpSent} onOpenChange={setOtpSent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Your New Email</AlertDialogTitle>
            <AlertDialogDescription>
              An OTP has been sent to {emailToVerify}. Please enter it below to confirm your new email address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4">
            <Input 
              placeholder="Enter OTP" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOtpSent(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVerifyOtp} disabled={verifying}>
              {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
