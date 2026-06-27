interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-card p-10 text-center text-muted">
      <h3 className="text-xl font-semibold text-text">{title}</h3>
      <p className="mt-3 max-w-xl mx-auto text-sm leading-6">{description}</p>
    </div>
  );
};

export default EmptyState;
