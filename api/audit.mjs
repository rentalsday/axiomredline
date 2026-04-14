export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { text } = req.body;
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API Key missing in Vercel settings." });
    }

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "grok-4-1-fast-reasoning", 
                messages: [
                    { 
                        role: "system", 
                        content: "ROLE: You are a Senior M&A Attorney and Expert Auditor. CRITICAL INSTRUCTION: You must perform a comprehensive analysis. DO NOT SKIP sections. Analyze for 'Change of Control', 'Termination', and M&A risks. For every identified \"Red Flag,\" you must: 1. Identify risk. 2. Locate section. 3. Draft the Fix: Provide a \"Redline\" (corrected legal text). OUTPUT FORMAT: DOCUMENT TITLE: [Title] RISK SCORE: [1-10] RED FLAGS: - [Category]: [Description]. Location: [Section] Proposed Redline Fix: [Text] SUMMARY: [Overview] LEGAL NOTICE: For preliminary auditing purposes only; confirm with counsel." 
                    },
                    { role: "user", content: text }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.error?.message || "Grok API Error" 
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Server crashed during analysis.", details: error.message });
    }
}
