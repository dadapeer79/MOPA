import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  formatOptions?: Intl.NumberFormatOptions;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  formatOptions,
  duration = 1,
  className,
}: AnimatedNumberProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(prevValue, value, {
      duration,
      onUpdate(value) {
        node.textContent = new Intl.NumberFormat('en-IN', formatOptions).format(value);
      },
      onComplete() {
        setPrevValue(value);
      },
    });

    return () => controls.stop();
  }, [value, formatOptions, duration, prevValue]);

  return <span ref={nodeRef} className={className} />;
}