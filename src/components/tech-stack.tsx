import { useSpring, animated } from '@react-spring/web';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const technologies = [
  { name: 'React', category: 'Frontend', color: 'text-blue-500' },
  { name: 'Next.js', category: 'Framework', color: 'text-black dark:text-white' },
  { name: 'TypeScript', category: 'Language', color: 'text-blue-600' },
  { name: 'Node.js', category: 'Backend', color: 'text-green-500' },
  { name: 'Firebase', category: 'Database', color: 'text-yellow-500' },
  { name: 'TailwindCSS', category: 'Styling', color: 'text-cyan-500' },
  { name: 'AI Integration', category: 'Features', color: 'text-purple-500' },
  { name: 'REST APIs', category: 'Integration', color: 'text-red-500' },
];

export function TechStack() {
  const [props, api] = useSpring(() => ({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  return (
    <animated.div style={props} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {technologies.map((tech, index) => (
        <Card key={tech.name} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-2">
              <span className={`text-2xl font-bold ${tech.color}`}>{tech.name}</span>
              <Badge variant="secondary">{tech.category}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </animated.div>
  );
}