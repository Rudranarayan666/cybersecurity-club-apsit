import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);

    useEffect(() => {
        const onMouseMove = (e) => {
            gsap.to(dotRef.current, {
                x: e.clientX,
                y: e.clientY,
                duration: 0,
            });
            gsap.to(ringRef.current, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.15,
            });
        };

        // Use event delegation instead of querying once at mount.
        // This ensures all dynamically rendered elements (lazy-loaded pages, etc.) are handled.
        const onMouseOver = (e) => {
            if (e.target.closest('.hover-trigger, a, button, input, textarea, select')) {
                document.body.classList.add('hover-active');
            }
        };
        const onMouseOut = (e) => {
            if (e.target.closest('.hover-trigger, a, button, input, textarea, select')) {
                document.body.classList.remove('hover-active');
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseover', onMouseOver);
        document.addEventListener('mouseout', onMouseOut);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mouseout', onMouseOut);
        };
    }, []);

    return (
        <>
            <div id="cursor-dot" ref={dotRef}></div>
            <div id="cursor-ring" ref={ringRef}></div>
        </>
    );
};

export default CustomCursor;
