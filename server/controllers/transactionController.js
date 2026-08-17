import supabase from "../config/supabase.js";

export const getTransactions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const addTransaction = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { title, amount, type } = req.body;

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          title,
          amount,
          type,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, type } = req.body;

    const { data, error } = await supabase
      .from("transactions")
      .update({
        title,
        amount,
        type,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};