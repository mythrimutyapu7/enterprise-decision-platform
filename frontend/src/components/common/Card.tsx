import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const Card = ({ title, children, footer }: CardProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass-card p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">{title}</h2>
      </div>
      <div>{children}</div>
      {footer && <div className="mt-6 border-t border-white/10 pt-4">{footer}</div>}
    </motion.section>
  );
};

export default Card;
