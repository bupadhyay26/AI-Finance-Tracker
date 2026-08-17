function SearchBar({ search, setSearch }) {
  return (
    <div className="mt-10">
      <input
        type="text"
        placeholder="Search transaction..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[#0c2420] border border-[#25483f] rounded-xl p-4 outline-none"
      />
    </div>
  );
}

export default SearchBar;