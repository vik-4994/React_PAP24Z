import { trpc } from '@frontend/utils/trpc';
import { createContext, useContext, ReactNode, PropsWithChildren } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

const variants = {
  hidden: { opacity: 0, x: 0, y: 20 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: 20 },
};

const isLoadingVariants = {
  hidden: { opacity: 0 },
  enter: { opacity: 1 },
  exit: { opacity: 0 },
};

export const AnimatedPage: React.FC<
  PropsWithChildren & { isLoading?: boolean }
> = ({ children, isLoading }) => {
  const location = useLocation();

  const key = location.pathname + (isLoading ? '-loading' : '');

  return (
    <motion.div
      key={key}
      variants={isLoading ? isLoadingVariants : variants}
      initial="hidden"
      animate="enter"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};
