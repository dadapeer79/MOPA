import { useSpring, animated } from '@react-spring/web';
import { useEffect, useState } from 'react';

export function FloatingElement({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animation = useSpring({
    config: {
      mass: 1,
      tension: 280,
      friction: 60
    },
    transform: isVisible ? 'translateY(0px)' : 'translateY(50px)',
    opacity: isVisible ? 1 : 0,
  });

  return (
    <animated.div
      style={{
        ...animation,
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </animated.div>
  );
}