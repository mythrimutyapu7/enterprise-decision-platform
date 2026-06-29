const SkeletonCard = () => {
  return (
    <div className="glass-card animate-pulse p-6">
      <div className="h-5 w-3/5 rounded-full bg-white/10" />
      <div className="mt-6 space-y-3">
        <div className="h-10 w-2/5 rounded-full bg-white/10" />
        <div className="flex h-10 items-end gap-1.5">
          <div className="h-5 flex-1 rounded-full bg-white/10" />
          <div className="h-8 flex-1 rounded-full bg-white/10" />
          <div className="h-6 flex-1 rounded-full bg-white/10" />
          <div className="h-10 flex-1 rounded-full bg-white/10" />
          <div className="h-7 flex-1 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
