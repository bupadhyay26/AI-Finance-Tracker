function SummaryCard({ title, amount }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-zinc-400 text-sm">{title}</h3>

      <p className="text-3xl font-bold mt-2">
        ₹ {amount}
      </p>
    </div>
  );
}

export default SummaryCard;