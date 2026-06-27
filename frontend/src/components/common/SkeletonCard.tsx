const SkeletonCard = () => {
  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-card p-6 shadow-panel">
      <div className="h-5 w-3/5 rounded-full bg-white/10" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded-full bg-white/10" />
        <div className="h-4 w-4/5 rounded-full bg-white/10" />
        <div className="h-4 w-2/5 rounded-full bg-white/10" />
      </div>
    </div>
  );
};

export default SkeletonCard;
