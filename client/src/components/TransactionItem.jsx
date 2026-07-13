function TransactionItem({
  id,
  title,
  amount,
  type,
  date,
  deleteTransaction,
}) {
  return (
    <div className="flex justify-between items-center border-b border-zinc-800 py-5">

      <div>
        <h3 className="text-xl font-semibold">
          {title}
        </h3>

        <p className="text-zinc-500 text-sm mt-1">
  {date}
</p>
      </div>

      <div className="flex items-center gap-5">

        <span
          className={`text-xl font-bold ${
            type === "Income"
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          ₹ {amount}
        </span>

        <button
          onClick={() => deleteTransaction(id)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          Delete
        </button>

      </div>
    </div>
  );
}

export default TransactionItem;