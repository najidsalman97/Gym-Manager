const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = async (req, res) => {
  if (req.method === "GET") {
    // Serve the simple HTML page for members
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Gym Check-In</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; padding: 16px;">
  <h2>Gym Check-In</h2>
  <p>Enter your phone number or member code to check in.</p>
  <input id="code" placeholder="Phone / Member Code"
         style="padding: 8px; width: 100%; max-width: 320px;" />
  <button onclick="checkIn()"
          style="margin-top: 12px; padding: 8px 16px;">Check-In</button>
  <p id="status" style="margin-top: 12px;"></p>

  <script>
    async function checkIn() {
      const code = document.getElementById("code").value.trim();
      const status = document.getElementById("status");
      if (!code) {
        status.textContent = "Please enter your code.";
        return;
      }
      try {
        const res = await fetch(window.location.pathname, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberCode: code })
        });
        if (res.ok) {
          status.textContent = "Check-in successful! ✅";
          document.getElementById("code").value = "";
        } else {
          const data = await res.json().catch(() => ({}));
          status.textContent = "Check-in failed: " + (data.error || res.statusText);
        }
      } catch (e) {
        status.textContent = "Network error. Try again.";
      }
    }
  </script>
</body>
</html>
    `);
    return;
  }

  if (req.method === "POST") {
    const { memberCode } = req.body || {};
    if (!memberCode) {
      return res.status(400).json({ error: "memberCode required" });
    }

    const { error } = await supabase
      .from("cloud_checkins")
      .insert([{ member_code: memberCode }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "db error" });
    }

    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
};
