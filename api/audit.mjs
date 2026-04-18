export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    const { text } = req.body;
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "API Key missing." });

    const systemPrompt = `ROLE: Lead M&A Partner. Auditing for Senior Counsel Logic.
MISSION: Perform an adversarial audit of M&A instruments. Focus on 'Change of Control' and 'Revenue Protection'.

RULES:
1. Every risk entry MUST be on one line.
2. Format: [Category]: [Vulnerability]. Location: [Section]. Proposed Redline Fix: [Instruction] '[Full Legal Text]'
3. Do not truncate the legal text. Provide complete clauses.

OUTPUT:
DOCUMENT TITLE: [Title]
RISK SCORE: [1-10/10]
RED FLAGS: 
- [Flag Line 1]
- [Flag Line 2]

SUMMARY: [Executive Synthesis]
LEGAL NOTICE: For auditing purposes only.`;

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
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Analyze: ${text.substring(0, 45000)}` }
                ],
                temperature: 0.1 
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "API Failure." });
    }
}
