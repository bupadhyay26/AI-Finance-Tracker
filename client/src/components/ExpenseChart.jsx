import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ExpenseChart({ income = 0, expense = 0 }) {
  const data = [
    { name: "Income", value: Number(income) || 0 },
    { name: "Expense", value: Number(expense) || 0 },
  ];

  return (
    <div className="bg-zinc-900 rounded-xl p-6 mt-10">
      <h2 className="text-2xl font-bold mb-4">
        Income vs Expense
      </h2>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
            >
              <Cell fill="#22c55e" />
              <Cell fill="#ef4444" />
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ExpenseChart;