import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

// Adjusted color palette for the prompt-library theme (dark blues, purples, teals)
const lineColors = [
  'rgba(59, 130, 246, 0.5)',  // blue-500
  'rgba(96, 165, 250, 0.6)',  // blue-400
  'rgba(129, 140, 248, 0.5)', // indigo-400
  'rgba(165, 180, 252, 0.4)', // indigo-300
  'rgba(20, 184, 166, 0.4)',  // teal-500 (example, can be adjusted)
  'rgba(100, 116, 139, 0.3)', // slate-500 (example, for softer lines)
];

const InitialViewAnimation = () => {
  const canvasRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const frameCountRef = useRef(5);
  const animationFrameIdRef = useRef(null);
  const contextRef = useRef(null);
  const parentRef = useRef(null); // To store parent element for resize

  const draw = useCallback((ctx, frameCount) => {
    if (!ctx || !ctx.canvas) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const numLines = 20;
    const maxAmplitude = ctx.canvas.height / 6;
    const time = frameCount * 0.008;

    for (let i = 0; i < numLines; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1 + Math.random() * 0.5;
      ctx.strokeStyle = lineColors[i % lineColors.length];

      const freq = 0.008 + (i * 0.0015);
      const amp = maxAmplitude * (0.4 + Math.sin(time * 0.5 + i * 0.3) * 0.3);
      const yOffset = ctx.canvas.height / 2 + Math.sin(i * 0.15 + time * 0.6) * (ctx.canvas.height / 5.5);
      const phaseShift = i * 0.4;
      const speed = 0.4 + (i % 6) * 0.12;

      ctx.moveTo(0, yOffset + Math.sin(time * speed + phaseShift) * amp);
      for (let x = 0; x < ctx.canvas.width + 10; x += 10) {
        const yNoise = (Math.random() - 0.2) * 2;
        const y = yOffset + Math.sin(x * freq + time * speed + phaseShift) * amp * Math.cos(x / (150 + i * 12) + time * 1) + yNoise;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    contextRef.current = canvas.getContext('2d');
    parentRef.current = canvas.parentElement;

    const resizeCanvas = () => {
      if (canvasRef.current && parentRef.current && contextRef.current) {
        canvasRef.current.width = parentRef.current.clientWidth;
        canvasRef.current.height = parentRef.current.clientHeight;
        draw(contextRef.current, frameCountRef.current);
      }
    };

    const render = () => {
      if (isAnimating) {
        frameCountRef.current++;
      }
      if (contextRef.current) {
        draw(contextRef.current, frameCountRef.current);
      }
      if (isAnimating) {
        animationFrameIdRef.current = window.requestAnimationFrame(render);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (isAnimating) {
      animationFrameIdRef.current = window.requestAnimationFrame(render);
    }

    const animationTimeout = setTimeout(() => {
      setIsAnimating(false);
    }, 50000);

    return () => {
      window.cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(animationTimeout);
    };
  }, [draw, isAnimating]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.4, // Delay slightly after container fades in
        duration: 5,
        ease: "easeOut",
      },
    },
  };

  const taglineVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.6, // Delay slightly after title
        duration: 5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      key="initial-view-animation"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full h-full flex flex-col items-center justify-center dark-gradient-bg relative select-none" // Added dark-gradient-bg and relative for text positioning
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-60" /> {/* Adjusted opacity and ensure it's behind text */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6"
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={titleVariants}
          className="antialiased text-5xl sm:text-7xl md:text-8xl saturate-150 contrast-150 text-title-gradient tracking-tighter mb-2 font-title"
        >
          PromptLi
        </motion.h1>
        <motion.p
          variants={taglineVariants}
          className="text-lg sm:text-xl md:text-2xl text-light-secondary tracking-tight font-light font-body"
        >
          Craft. Test. Refine.
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default InitialViewAnimation; 