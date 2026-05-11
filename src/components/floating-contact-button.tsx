import { useSpring, animated } from '@react-spring/web';
import { Button } from './ui/button';
import { MessageCircle } from 'lucide-react';

export function FloatingContactButton() {
  const [spring, api] = useSpring(() => ({
    from: { y: 100, opacity: 0 },
    to: { y: 0, opacity: 1 },
    config: { tension: 280, friction: 60 },
    delay: 1000,
  }));

  const [hover, setHover] = useSpring(() => ({
    scale: 1,
    rotate: 0,
  }));

  return (
    <animated.div
      style={{
        ...spring,
        ...hover,
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 50,
      }}
      onMouseEnter={() => {
        setHover({
          scale: 1.1,
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
      <Button
        size="lg"
        className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
      >
        <MessageCircle className="mr-2 h-5 w-5" />
        Chat with Us
      </Button>
    </animated.div>
  );
}