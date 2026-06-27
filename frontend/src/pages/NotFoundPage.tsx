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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-card p-12 text-center shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Error {code}</p>
        <h1 className="mt-6 text-4xl font-semibold text-text">{page.title}</h1>
        <p className="mt-4 text-sm leading-7 text-muted">{page.description}</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
