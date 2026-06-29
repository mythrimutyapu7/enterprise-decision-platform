import { motion } from 'framer-motion';

interface NotFoundPageProps {
  code?: 404 | 403 | 500;
}

const NotFoundPage = ({ code = 404 }: NotFoundPageProps) => {
  const messages: Record<number, { title: string; description: string }> = {
    403: { title: 'Access denied', description: 'You do not have permission to view this page.' },
    404: { title: 'Page not found', description: 'The page you are looking for does not exist.' },
    500: { title: 'Server error', description: 'Something went wrong on our side. Please try again later.' },
  };

  const page = messages[code];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div className="pointer-events-none absolute left-[-8rem] top-[-8rem] h-96 w-96 rounded-full bg-[#7c5cff]/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-8rem] h-96 w-96 rounded-full bg-[#4f8cff]/14 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45 }} className="glass-card w-full max-w-2xl p-12 text-center">
        <p className="eyebrow text-primary">Error {code}</p>
        <h1 className="mt-6 text-4xl font-semibold text-text">{page.title}</h1>
        <p className="mt-4 text-sm leading-7 text-muted">{page.description}</p>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
