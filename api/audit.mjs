export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { text } = req.body;
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API Key missing in Vercel settings." });
    }

    const systemPrompt = `ROLE: Lead M&A Partner and Adversarial Auditor.
MISSION: Audit the document for 'Change of Control', 'Termination', and structural vulnerabilities.

STRICT OUTPUT RULES:
1. You MUST use this exact format for every Red Flag line:
   - [Risk Category]: [Vulnerability Description]. Location: [Section Number]. Proposed Redline Fix: [Specific Drafting Instruction] '[Exact Legal Language]'
2. Every Red Flag MUST be on its own line.
3. Every Red Flag MUST contain the exact string "Proposed Redline Fix:" to allow the system to parse it.

OUTPUT FORMAT:
DOCUMENT TITLE: [Title]
RISK SCORE: [1-10]/10
RED FLAGS: 
- [Flag 1 Line]
- [Flag 2 Line]

SUMMARY: [Executive Synthesis]
LEGAL NOTICE: For preliminary auditing purposes only.`;

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "grok-beta", 
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Audit this instrument. Do not skip sections:\n\n${text}` }
                ],
                temperature: 0.1 
            })
        });

        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "API Error" });
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Server Error", details: error.message });
    }
}
