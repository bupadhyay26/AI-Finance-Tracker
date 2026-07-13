import { useState } from "react";

function AddTransactionForm({ addTransaction }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [date, setDate] = useState(
  new Date().toISOString().split("T")[0]
);

  const handleSubmit = () => {
    if (!title || !amount) return;
addTransaction({
  id: Date.now(),
  title,
  amount: Number(amount),
  type,
  date,
});
    setTitle("");
    setAmount("");
    setType("Expense");
    setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        Add Transaction
      </h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

        <input
          type="text"
          placeholder="Transaction Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-zinc-800 p-3 rounded-lg mb-4 outline-none"
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-zinc-800 p-3 rounded-lg mb-4 outline-none"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-zinc-800 p-3 rounded-lg mb-4 outline-none"
        >
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        <input
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
  className="w-full bg-zinc-800 p-3 rounded-lg mb-4 outline-none"
/>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold"
        >
          Add Transaction
        </button>

      </div>
    </section>
  );
}

export default AddTransactionForm;