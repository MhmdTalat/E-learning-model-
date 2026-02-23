import { useEffect, useState } from 'react';

/**
 * Animation types available in the application
 */
export type AnimationType = 
  | 'fade-in'
  | 'fade-out'
  | 'slide-in-from-left'
  | 'slide-in-from-right'
  | 'slide-in-from-top'
  | 'slide-in-from-bottom'
  | 'slide-out-to-left'
  | 'slide-out-to-right'
  | 'scale-in'
  | 'scale-out'
  | 'bounce-in'
  | 'pulse-soft'
  | 'shimmer'
  | 'spin-slow'
  | 'float'
  | 'glow'
  | 'flip'
  | 'wiggle';

/**
 * Hook to manage animation triggers and classes
 * @param trigger - Condition to trigger the animation
 * @param animationType - Type of animation to apply
 * @returns Animation class string to apply to element
 */
export const useAnimation = (trigger: boolean = true, animationType: AnimationType = 'fade-in'): string => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (trigger) {
      setAnimate(true);
    }
  }, [trigger]);

  return animate ? `animate-${animationType}` : '';
};

/**
 * Hook to handle staggered animations for lists/grids
 * @param items - Array of items to animate
 * @param trigger - Condition to trigger animations
 * @returns Class string for stagger animation
 */
export const useStaggerAnimation = <T,>(items: T[], trigger: boolean = true): string => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (trigger && items.length > 0) {
      setAnimate(true);
    }
  }, [trigger, items.length]);

  return animate ? 'animate-fade-in-stagger' : '';
};

/**
 * Hook for page transition animations
 * @returns Animation class for page container
 */
export const usePageAnimation = (): string => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return animate ? 'page-container' : '';
};

/**
 * Hook to trigger animation on scroll
 * @param threshold - Intersection Observer threshold (0-1)
 * @returns Tuple of [ref, isVisible] where isVisible triggers the animation
 */
export const useScrollAnimation = (threshold: number = 0.1): [React.RefObject<HTMLDivElement>, boolean] => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (currentRef) {
            observer.unobserve(currentRef);
          }
        }
      },
      { threshold }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return [ref, isVisible];
};

/**
 * Hook to get animation delay class
 * @param index - Index of item in list
 * @param delayMs - Delay increment in milliseconds (default 100ms)
 * @returns Animation delay class
 */
export const useAnimationDelay = (index: number, delayMs: number = 100): string => {
  const delayClass: Record<number, string> = {
    100: 'delay-100',
    200: 'delay-200',
    300: 'delay-300',
    400: 'delay-400',
    500: 'delay-500',
    600: 'delay-600',
    700: 'delay-700',
    800: 'delay-800',
    1000: 'delay-1000',
  };

  const totalDelay = index * delayMs;
  const delays = Object.keys(delayClass).map(Number);
  const closest = delays.reduce((prev, curr) => {
    return Math.abs(curr - totalDelay) < Math.abs(prev - totalDelay) ? curr : prev;
  });

  return delayClass[closest] || '';
};

/**
 * Get animation class string
 * @param animationType - Type of animation
 * @param duration - Custom duration in ms (optional)
 * @param delay - Custom delay in ms (optional)
 * @returns Complete animation class string
 */
export const getAnimationClass = (
  animationType: AnimationType,
  duration?: number,
  delay?: number
): string => {
  let className = `animate-${animationType}`;
  
  if (duration) {
    const durationClass: Record<number, string> = {
      300: 'duration-300',
      500: 'duration-500',
      700: 'duration-700',
      1000: 'duration-1000',
    };
    className += ` ${durationClass[duration] || ''}`;
  }

  if (delay) {
    const delayClass: Record<number, string> = {
      100: 'delay-100',
      200: 'delay-200',
      300: 'delay-300',
      400: 'delay-400',
      500: 'delay-500',
      600: 'delay-600',
      700: 'delay-700',
      800: 'delay-800',
      1000: 'delay-1000',
    };
    className += ` ${delayClass[delay] || ''}`;
  }

  return className;
};

/**
 * Hook to manage sequential animations
 * @param stages - Number of animation stages
 * @param duration - Duration of each stage in ms
 * @returns Current stage index
 */
export const useSequentialAnimation = (stages: number = 3, duration: number = 500): number => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage < stages) {
      const timer = setTimeout(() => setStage(stage + 1), duration);
      return () => clearTimeout(timer);
    }
  }, [stage, stages, duration]);

  return stage;
};

/**
 * Hook to trigger animation on event
 * @param eventType - Type of event ('hover', 'click', 'focus')
 * @returns Tuple of [handlers, isAnimating]
 */
export const useEventAnimation = (eventType: 'hover' | 'click' | 'focus' = 'hover'): [
  { onMouseEnter: () => void; onMouseLeave: () => void; onFocus: () => void; onBlur: () => void; onClick: () => void },
  boolean
] => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMouseEnter = () => {
    if (eventType === 'hover') setIsAnimating(true);
  };

  const handleMouseLeave = () => {
    if (eventType === 'hover') setIsAnimating(false);
  };

  const handleFocus = () => {
    if (eventType === 'focus') setIsAnimating(true);
  };

  const handleBlur = () => {
    if (eventType === 'focus') setIsAnimating(false);
  };

  const handleClick = () => {
    if (eventType === 'click') {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return [
    { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onFocus: handleFocus, onBlur: handleBlur, onClick: handleClick },
    isAnimating
  ];
};

// Corrected import - add React at the top
import React from 'react';

// Export all animation utilities
export default {
  useAnimation,
  useStaggerAnimation,
  usePageAnimation,
  useScrollAnimation,
  useAnimationDelay,
  getAnimationClass,
  useSequentialAnimation,
  useEventAnimation,
};
