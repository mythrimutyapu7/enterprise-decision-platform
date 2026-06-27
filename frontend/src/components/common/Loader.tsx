const Loader = () => {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full bg-[#4f8cff]/20 blur-xl" />
        <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-primary shadow-[0_0_34px_rgba(79,140,255,0.35)]" />
      </div>
    </div>
  );
};

export default Loader;
