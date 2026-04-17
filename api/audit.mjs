export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    const { text } = req.body;
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "API Key missing." });

    const systemPrompt = `ROLE: Lead M&A Partner. Perform a high-stakes adversarial audit.
STRICT FORMATTING:
1. Every risk found must be one single line.
2. Format: [Category]: [Risk Description]. Location: [Section]. Proposed Redline Fix: [Instruction] '[Legal Text]'
3. Do not use bolding or extra newlines within a red flag line.
4. If no risks are found, return 'No critical triggers detected.'

OUTPUT:
DOCUMENT TITLE: [Title]
RISK SCORE: [0-10]/10
RED FLAGS:
- [Flag Line 1]
- [Flag Line 2]

SUMMARY: [Executive Summary]
LEGAL NOTICE: Preliminary audit only.`;

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
                    { role: "user", content: `Analyze this text: ${text.substring(0, 40000)}` }
                ],
                temperature: 0.1 
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Analysis failed." });
    }
}
