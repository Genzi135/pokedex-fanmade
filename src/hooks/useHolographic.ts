import { useEffect, useRef } from 'react';

export function useHolographic() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      
      // Calculate angle of pointer relative to card center
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 180; // 0 to 360 deg

      element.style.setProperty('--holo-x', `${px}%`);
      element.style.setProperty('--holo-y', `${py}%`);
      element.style.setProperty('--holo-angle', `${angle}deg`);
      element.style.setProperty('--holo-opacity', '0.5');
    };

    const handleMouseLeave = () => {
      element.style.setProperty('--holo-opacity', '0');
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return ref;
}
