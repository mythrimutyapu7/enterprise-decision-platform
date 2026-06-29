interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="glass-card p-10 text-center text-muted">
      <div className="mx-auto mb-5 h-12 w-12 rounded-full border border-dashed border-white/20 bg-white/[0.04]" />
      <h3 className="section-title">{title}</h3>
      <p className="mt-3 max-w-xl mx-auto text-sm leading-6">{description}</p>
    </div>
  );
};

export default EmptyState;
