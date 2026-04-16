export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { text } = req.body;
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API Key missing in Vercel settings." });
    }

    // JSON-compliant prompt logic integrated into the system message
    const systemPrompt = `ROLE: Lead M&A Partner and Adversarial Auditor.
MISSION: Perform an exhaustive audit of the provided instrument for 'Change of Control', 'Termination', and structural M&A vulnerabilities.

CRITICAL INSTRUCTIONS:
1. NO TRUNCATION: Provide complete, ready-to-use legal clauses. Never end a redline with '...' or 'etc.'
2. PRECISE MAPPING: Every 'Strategic Redline Solution' must explicitly state the drafting action (e.g., 'Replace Section X in its entirety with:', 'Amend Section Y to read:', or 'Insert new Section Z:').
3. LOGIC FLOW: The Redline must directly solve the specific vulnerability found at the cited Location.
4. CITATION RIGOR: Every red flag must be anchored to a specific Article, Section, or Paragraph number.

OUTPUT FORMAT:
DOCUMENT TITLE: [Title]
RISK SCORE: [1-10/10]
RED FLAGS: 
- [Category]: [Vulnerability Description]. Location: [Precise Section].
Proposed Redline Fix: [Drafting Instruction] '[Full, non-truncated legal text]'

SUMMARY: [Executive synthesis of aggregate risks]
LEGAL NOTICE: For preliminary auditing purposes only; confirm with counsel.`;

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
                        content: systemPrompt 
                    },
                    { 
                        role: "user", 
                        content: `Analyze the following legal text and provide the audit in the specified format:\n\n${text}` 
                    }
                ],
                temperature: 0.1 // Kept low for consistent, professional legal drafting
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
