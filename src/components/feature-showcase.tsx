import { useSpring, animated } from '@react-spring/web';
import { Card, CardContent } from './ui/card';
import { 
  Zap, 
  Shield, 
  Smartphone, 
  BarChart4, 
  Users, 
  Globe 
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed and performance',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'Enterprise-grade security built-in',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Perfect experience on any device',
  },
  {
    icon: BarChart4,
    title: 'Smart Analytics',
    description: 'AI-powered business insights',
  },
  {
    icon: Users,
    title: 'Team Ready',
    description: 'Built for collaboration',
  },
  {
    icon: Globe,
    title: 'Global Ready',
    description: 'Multi-language support built-in',
  },
];

export function FeatureShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => {
        const [hover, setHover] = useSpring(() => ({
          scale: 1,
          rotate: 0,
        }));

        return (
          <animated.div
            key={feature.title}
            style={hover}
            onMouseEnter={() => {
              setHover({
                scale: 1.05,
                rotate: 5,
                config: { tension: 300, friction: 10 },
              });
            }}
            onMouseLeave={() => {
              setHover({
                scale: 1,
                rotate: 0,
                config: { tension: 300, friction: 10 },
              });
            }}
          >
            <Card className="h-full bg-gradient-to-br from-background to-muted">
              <CardContent className="p-6">
                <feature.icon className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </animated.div>
        );
      })}
    </div>
  );
}