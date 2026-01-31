"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState } from "react";
import { Check, X } from "lucide-react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onLike?: () => void;
  onNope?: () => void;
  threshold?: number;
}

export default function SwipeableCard({ children, onLike, onNope, threshold = 150 }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-5, 5]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]); // Fade out on strong swipes

  // Like Overlay Opacity (Right)
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  // Nope Overlay Opacity (Left)
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
    // Vibratic feedback removed
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x > threshold) {
      // Swiped Right (Like)
      // Trigger valid swipe haptic removed
      if (onLike) onLike();
    } else if (info.offset.x < -threshold) {
      // Swiped Left (Nope)
      if (onNope) onNope();
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7} // Resistance feel
      // Prevent accidental scrolling while swiping horizontally
      dragDirectionLock
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="relative touch-pan-y cursor-grab active:cursor-grabbing w-full"
      whileTap={{ scale: 1.02 }}
    >
      {/* Like Overlay Indicator (Right) */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-4 left-4 z-10 pointer-events-none"
      >
        <div className="bg-green-500/80 rounded-full p-2">
          <Check size={48} className="text-white" strokeWidth={3} />
        </div>
      </motion.div>

      {/* Nope Overlay Indicator (Left) */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-4 right-4 z-10 pointer-events-none"
      >
        <div className="bg-red-500/80 rounded-full p-2">
          <X size={48} className="text-white" strokeWidth={3} />
        </div>
      </motion.div>

      {children}
    </motion.div>
  );
}
