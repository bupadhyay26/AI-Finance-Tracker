function TransactionItem({
  id,
  title,
  amount,
  type,
  date,
  deleteTransaction,
}) {
  const isIncome = type?.toLowerCase() === "income";

  return (
    <div className="flex justify-between items-center border-b border-[#25483f] py-5 gap-4">
      <div className="min-w-0">
        <h3 className="text-xl font-semibold truncate">{title}</h3>
        <p className="text-zinc-500 text-sm mt-1">{date}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span
          className={`text-xl font-bold ${
            isIncome ? "text-green-400" : "text-red-400"
          }`}
        >
          {isIncome ? "+" : "-"} ₹ {Number(amount).toLocaleString("en-IN")}
        </span>

        <button
          onClick={() => deleteTransaction(id)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default TransactionItem;
