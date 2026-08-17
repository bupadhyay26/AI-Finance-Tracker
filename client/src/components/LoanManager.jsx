function LoanManager({ loans, repayLoan }) {
  const format = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
  const activeLoans = loans.filter((loan) => Number(loan.remaining) > 0);
  const lentOutstanding = activeLoans
    .filter((loan) => loan.direction === "lent")
    .reduce((sum, loan) => sum + Number(loan.remaining || 0), 0);
  const borrowedOutstanding = activeLoans
    .filter((loan) => loan.direction === "borrowed")
    .reduce((sum, loan) => sum + Number(loan.remaining || 0), 0);

  const handleRepay = (loan) => {
    const value = window.prompt(
      loan.direction === "lent"
        ? `How much did ${loan.person} return?`
        : `How much did you pay back to ${loan.person}?`,
      String(loan.remaining)
    );
    if (value === null) return;

    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Enter a valid positive amount.");
      return;
    }
    if (amount > Number(loan.remaining)) {
      window.alert(`Amount cannot be greater than ${format(loan.remaining)}.`);
      return;
    }
    repayLoan(loan.id, amount);
  };

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-bold">💸 Money Lent & Borrowed</h2>
          <p className="text-sm text-zinc-500 mt-1">PocketIQ automatically tracks what is still to receive or pay.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-5">
          <p className="text-zinc-500 text-sm">To Receive</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">{format(lentOutstanding)}</p>
        </div>
        <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-5">
          <p className="text-zinc-500 text-sm">To Pay</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">{format(borrowedOutstanding)}</p>
        </div>
      </div>

      <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-6">
        {loans.length === 0 ? (
          <p className="text-zinc-500 text-center py-4">No money lent or borrowed yet.</p>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => {
              const original = Number(loan.original || 0);
              const settled = Number(loan.settled || 0);
              const remaining = Number(loan.remaining || 0);
              const lent = loan.direction === "lent";
              return (
                <div key={loan.id} className="border border-[#25483f] rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{lent ? "💸" : "💰"}</span>
                        <h3 className="font-semibold text-lg">{lent ? `Given to ${loan.person}` : `Taken from ${loan.person}`}</h3>
                        {remaining === 0 && <span className="text-xs bg-emerald-900/60 text-emerald-300 px-2 py-1 rounded-full">Settled</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div><p className="text-zinc-500">Original</p><p className="font-semibold">{format(original)}</p></div>
                        <div><p className="text-zinc-500">{lent ? "Received" : "Paid Back"}</p><p className="font-semibold text-emerald-400">{format(settled)}</p></div>
                        <div><p className="text-zinc-500">Remaining</p><p className={`font-semibold ${remaining ? "text-amber-300" : "text-emerald-400"}`}>{format(remaining)}</p></div>
                      </div>
                    </div>
                    {remaining > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRepay(loan)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-[#061a16] px-4 py-2 rounded-lg font-semibold shrink-0"
                      >
                        {lent ? "Add Received" : "Add Repayment"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default LoanManager;
