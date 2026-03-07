import { useEffect } from 'react';

/**
 * A highly optimized hook to read the scroll position and update a CSS custom property.
 * By keeping this in a custom variable `--scroll-y` on the document element,
 * CSS can simply use `transform: translateY(calc(var(--scroll-y) * 0.5px))`
 * to create a hardware-accelerated parallax effect without causing React re-renders.
 */
export const useParallax = () => {
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Initialize
        document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
};
