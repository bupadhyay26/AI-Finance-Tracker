import { useCallback, useMemo, useRef, useState } from "react";

const TITLE_MAX_LENGTH = 50;

function AddTransactionForm({ addTransaction }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [touched, setTouched] = useState({ title: false, amount: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const trimmedTitle = title.trim();
  const parsedAmount = Number(amount);

  const fieldErrors = useMemo(() => {
    const errors = { title: "", amount: "" };

    if (!trimmedTitle) errors.title = "Title is required";
    else if (title.length > TITLE_MAX_LENGTH) {
      errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer`;
    }

    if (amount === "" || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    return errors;
  }, [title, trimmedTitle, amount, parsedAmount]);

  const isFormValid = !fieldErrors.title && !fieldErrors.amount;

  const resetForm = useCallback(() => {
    setTitle("");
    setAmount("");
    setType("Expense");
    setDate(new Date().toISOString().split("T")[0]);
    setTouched({ title: false, amount: false });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setTouched({ title: true, amount: true });

      if (!isFormValid || isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setIsSubmitting(true);

      try {
        await addTransaction({
          title: trimmedTitle,
          amount: parsedAmount,
          type,
          date,
        });
        resetForm();
      } catch (error) {
        console.error("Transaction submit error:", error);
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [isFormValid, addTransaction, trimmedTitle, parsedAmount, type, date, resetForm]
  );

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Add Transaction</h2>

      <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-6">
        <form noValidate onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              id="transaction-title"
              type="text"
              placeholder="Transaction Title"
              value={title}
              maxLength={TITLE_MAX_LENGTH}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
              className="w-full bg-[#17352f] p-3 rounded-lg outline-none"
            />
            <p className="mt-1 text-sm text-zinc-400">
              {title.length}/{TITLE_MAX_LENGTH}
            </p>
            {touched.title && fieldErrors.title && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.title}</p>
            )}
          </div>

          <div className="mb-4">
            <input
              id="transaction-amount"
              type="number"
              min="0"
              step="any"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, amount: true }))}
              className="w-full bg-[#17352f] p-3 rounded-lg outline-none"
            />
            {touched.amount && fieldErrors.amount && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.amount}</p>
            )}
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-[#17352f] p-3 rounded-lg mb-4 outline-none"
          >
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#17352f] p-3 rounded-lg mb-4 outline-none"
          />

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-emerald-500 text-[#061a16] hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-lg font-semibold"
          >
            {isSubmitting ? "Saving..." : "Add Transaction"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AddTransactionForm;
