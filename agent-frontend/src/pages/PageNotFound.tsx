import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 h-screen w-screen fixed top-0 left-0 z-30">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6 rounded-2xl bg-card p-10 shadow-[0px_0px_14px_rgba(109,40,217,0.25)]"
      >
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
          404 - Page Not Found
        </h1>
        <p className="max-w-md text-center text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button
          className="mt-2 w-48 self-center bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => navigate('/')}
          size="lg"
        >
          Go Home
        </Button>
      </motion.div>
    </div>
  );
};

export default PageNotFound;
