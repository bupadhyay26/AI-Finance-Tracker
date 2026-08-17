const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:6913";
const API_URL = `${API_BASE_URL}/api/transactions`;

// GET
export const getTransactions = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
};

// POST
export const addTransaction = async (transaction) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error("Failed to add transaction");
  }

  return response.json();
};

// DELETE
export const deleteTransaction = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete transaction");
  }

  return response.json();
};
