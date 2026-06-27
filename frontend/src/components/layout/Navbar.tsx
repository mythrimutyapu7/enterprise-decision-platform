import { FiBell, FiSearch } from 'react-icons/fi';

const Navbar = () => {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[#111827] px-6 py-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-text">Welcome back</h2>
        <p className="text-sm text-muted">Review the latest incident intelligence.</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f2937] text-muted transition hover:bg-[#374151]">
          <FiSearch className="h-5 w-5" />
        </button>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f2937] text-muted transition hover:bg-[#374151]">
          <FiBell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
