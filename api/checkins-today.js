const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data, error } = await supabase
    .from("cloud_checkins")
    .select("id, member_code, timestamp")
    .gte("timestamp", today + "T00:00:00Z")
    .lte("timestamp", today + "T23:59:59Z")
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Supabase select error:", error);
    return res.status(500).json({ error: "db error" });
  }

  const mapped = (data || []).map((row) => ({
    id: row.id,
    memberCode: row.member_code,
    timestamp: row.timestamp
  }));

  res.status(200).json(mapped);
}
