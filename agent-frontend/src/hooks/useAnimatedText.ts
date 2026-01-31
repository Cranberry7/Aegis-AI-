import { animate, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/useSession';

const delimiter = '';
const DURATION = 1;

export function useAnimatedText(text: string) {
  const animatedCursor = useMotionValue(0);
  const { shouldAnimate } = useSession();

  const [cursor, setCursor] = useState(shouldAnimate ? 0 : text.length);
  const [prevText, setPrevText] = useState(text);
  const [isSameText, setIsSameText] = useState(true);

  if (prevText !== text) {
    setPrevText(text);
    setIsSameText(text.startsWith(prevText));

    if (!text.startsWith(prevText)) {
      setCursor(0);
    }
  }

  useEffect(() => {
    if (!shouldAnimate) {
      setCursor(text.length);
      animatedCursor.jump(text.length);
      return;
    }

    if (!isSameText) {
      animatedCursor.jump(0);
    }

    const controls = animate(animatedCursor, text.split(delimiter).length, {
      duration: DURATION,
      ease: 'easeOut',
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [animatedCursor, isSameText, text]);

  return text.split(delimiter).slice(0, cursor).join(delimiter);
}
