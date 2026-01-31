import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useStore } from '@/store/global';

const Unauthorised: React.FC = () => {
  const navigate = useNavigate();
  const setUnauthorised = useStore((state) => state.setUnauthorised);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 h-screen w-screen fixed top-0 left-0 z-30">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6 rounded-2xl bg-card p-10 shadow-[0px_0px_14px_rgba(109,40,217,0.25)]"
      >
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="text-5xl sm:text-6xl font-extrabold text-center text-foreground/80"
        >
          Oops!
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex items-center justify-center"
        >
          <LockKeyhole className="w-12 h-12 text-foreground/70" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="text-3xl sm:text-4xl font-bold text-center text-foreground drop-shadow-lg max-w-2xl text-balance"
        >
          You are not authorised to access this page
        </motion.h1>

        <Button
          className="px-8 py-4 text-lg font-semibold shadow-[0px_0px_10px_rgba(175,103,242,0.35)]"
          onClick={() => {
            navigate('/');
            setUnauthorised(false);
          }}
        >
          Take me home
        </Button>
      </motion.div>
    </div>
  );
};

export default Unauthorised;
