import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

export function use3DTilt(strength = 15) {
  const ref = useRef<HTMLDivElement>(null);
  
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  // Spring configurations for smooth animations
  const springConfig = { stiffness: 120, damping: 20, mass: 0.5 };
  const springX = useSpring(rotateX, springConfig);
  const springY = useSpring(rotateY, springConfig);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Calculate coordinates relative to center of element
      const mouseX = e.clientX - rect.left - width / 2;
      const mouseY = e.clientY - rect.top - height / 2;
      
      // Map coordinates to rotation values
      const rX = -(mouseY / (height / 2)) * strength; // rotation around X-axis
      const rY = (mouseX / (width / 2)) * strength;  // rotation around Y-axis
      
      rotateX.set(rX);
      rotateY.set(rY);
    };

    const handleMouseLeave = () => {
      // Reset rotation back to 0
      rotateX.set(0);
      rotateY.set(0);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [rotateX, rotateY, strength]);

  return {
    ref,
    rotateX: springX,
    rotateY: springY,
  };
}
