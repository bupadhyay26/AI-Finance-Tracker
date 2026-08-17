import { useRef, useState } from "react";

function BankStatement({ addTransaction }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState([]);
  const [rows, setRows] = useState([]);

  const parseCsv = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) throw new Error("The CSV file has no transaction rows.");

    const split = (line) => line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
    const headers = split(lines[0]).map((h) => h.toLowerCase());

    const find = (names) => names.find((name) => headers.includes(name));
    const titleKey = find(["title", "description", "narration", "merchant", "particulars"]);
    const amountKey = find(["amount", "value", "transaction amount"]);
    const typeKey = find(["type", "transaction type", "credit/debit"]);
    const dateKey = find(["date", "transaction date"]);

    if (!titleKey || !amountKey) {
      throw new Error("CSV needs at least Description/Title and Amount columns.");
    }

    const parsed = lines.slice(1).map((line) => {
      const values = split(line);
      const get = (key) => values[headers.indexOf(key)] || "";
      const rawAmount = get(amountKey).replace(/[₹,\s]/g, "");
      const amount = Math.abs(Number(rawAmount));
      const rawType = typeKey ? get(typeKey).toLowerCase() : "";
      const type = rawType.includes("credit") || rawType.includes("income") ? "Income" : "Expense";

      return {
        title: get(titleKey) || "Bank Transaction",
        amount,
        type,
        date: dateKey ? get(dateKey) : new Date().toISOString().split("T")[0],
      };
    }).filter((item) => item.title && item.amount > 0);

    return parsed;
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("");
    setPreview([]);
    setRows([]);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setStatus("Please upload a CSV bank statement. PDF/Excel support can be added later.");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      setRows(parsed);
      setPreview(parsed.slice(0, 5));
      setStatus(`${parsed.length} transaction${parsed.length === 1 ? "" : "s"} found. Review and import.`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const importAll = async () => {
    if (!rows.length) return;
    setStatus("Importing transactions...");
    let imported = 0;

    for (const row of rows) {
      try {
        await addTransaction(row);
        imported += 1;
      } catch (error) {
        console.error("Bank import error:", error);
      }
    }

    setRows([]);
    setPreview([]);
    setStatus(`${imported} transaction${imported === 1 ? "" : "s"} imported successfully.`);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className="mt-10">
      <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Bank Statement</h2>
            <p className="text-sm text-zinc-500 mt-1">Import transactions from a CSV statement.</p>
          </div>
          <label className="cursor-pointer bg-[#17352f] hover:bg-[#23483e] px-5 py-3 rounded-lg font-semibold text-center">
            Choose CSV
            <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
          </label>
        </div>

        {status && <p className="mt-4 text-sm text-zinc-300">{status}</p>}

        {preview.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500 border-b border-[#25483f]">
                  <th className="py-3">Title</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, index) => (
                  <tr key={`${row.title}-${index}`} className="border-b border-[#25483f]">
                    <td className="py-3">{row.title}</td>
                    <td className={row.type === "Income" ? "py-3 text-green-400" : "py-3 text-red-400"}>{row.type}</td>
                    <td className="py-3">₹ {row.amount.toLocaleString("en-IN")}</td>
                    <td className="py-3 text-zinc-400">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={importAll} className="mt-5 bg-emerald-500 text-[#061a16] hover:bg-emerald-400 px-5 py-3 rounded-lg font-semibold">
              Import {rows.length} Transaction{rows.length === 1 ? "" : "s"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default BankStatement;
