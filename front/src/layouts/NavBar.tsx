<<<<<<< HEAD
export type NavBarProps = {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
};

export default function NavBar({ onSelectCategory, activeCategory }: NavBarProps) {
  const categories = [
    { label: 'All', value: '' },
    { label: 'Culture', value: 'Culture' },
    { label: 'Sports', value: 'Sport' },
    { label: 'Music', value: 'Concert' },
    { label: 'Family', value: 'Enfants' },
  ];

  return (
    <div className="fixed top-2 w-full flex flex-row items-center justify-between px-6 py-3 z-500 pointer-events-none">
      <nav className="flex items-center gap-3 absolute top-2 left-1/2 -translate-x-1/2 pointer-events-auto">
        {categories.map((cat) => {
          const isActive = (activeCategory || '') === cat.value;
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => onSelectCategory?.(cat.value)}
              className={`glass-panel cursor-pointer hover:zoom-98 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white shadow-md' : ''
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
=======
export default function NavBar() {
  return (
    <div className="fixed top-2 w-full flex flex-row items-center justify-between px-6 py-3 z-500">
      <nav className="flex items-center gap-3 absolute top-2 left-1/2 -translate-x-1/2">
        <button className="glass-panel cursor-pointer hover:zoom-98">All</button>
        <button className="glass-panel cursor-pointer hover:zoom-98">Culture</button>
        <button className="glass-panel cursor-pointer hover:zoom-98">Sports</button>
        <button className="glass-panel cursor-pointer hover:zoom-98">Music</button>
        <button className="glass-panel cursor-pointer hover:zoom-98">Family</button>
      </nav>
    </div>
  );
}
>>>>>>> dev
