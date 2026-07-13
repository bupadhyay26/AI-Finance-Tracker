function Navbar() {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          💰 AI Finance Tracker
        </h1>

        <button className="bg-zinc-800 px-4 py-2 rounded-lg text-white hover:bg-zinc-700">
          Profile
        </button>
      </div>
    </header>
  );
}

export default Navbar;