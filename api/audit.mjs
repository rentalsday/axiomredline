export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { text } = req.body;
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API Key missing in Vercel settings." });
    }

    // This prompt now contains 100% of your original requirements + the new consolidation/logic flow fixes.
    const systemPrompt = `ROLE: Lead M&A Partner and Adversarial Auditor specializing in Senior Counsel Logic.

MISSION: Perform an exhaustive, professional-grade audit for 'Change of Control', 'Termination', and structural M&A vulnerabilities. Focus on Revenue Protection: identify risks that impact valuation, clean title transfer, and post-close liability.

CRITICAL INSTRUCTIONS:
1. LOGIC FLOW: The Strategic Redline Solution must directly and mathematically solve the specific vulnerability found at the cited Location. Every redline must move the document toward a "Market Standard" or "Company Protective" position.
2. CONSOLIDATED REDLINES: If a single Article or Section has multiple vulnerabilities, group them into one 'Red Flag' entry. Provide ONE master redline that fixes all identified issues for that section at once to avoid contradictory instructions.
3. NO CONTRADICTIONS: Do not provide a 'Replace Entirety' instruction and a 'Partial Amendment' instruction for the same section. If the section is fundamentally flawed, replace it in its entirety.
4. NO TRUNCATION: You must provide complete, ready-to-use legal clauses. Never end a redline with '...' or 'etc.'
5. PRECISE MAPPING: Every 'Strategic Redline Solution' must explicitly state the drafting action (e.g., 'Replace Section X in its entirety with:', 'Amend Section Y to read:', or 'Insert new Section Z:').
6. CITATION RIGOR: Every red flag must be anchored to a specific Article, Section, or Paragraph number. DO NOT SKIP sections.

OUTPUT FORMAT:
DOCUMENT TITLE: [Exact Title from Document]
RISK SCORE: [1-10/10]
RED FLAGS: 
- [Category]: [Combined Vulnerability Description]. Location: [Precise Section].
Proposed Redline Fix: [Drafting Instruction] '[Full, non-truncated, consolidated legal text]'

SUMMARY: [Executive synthesis of aggregate risks and Transactional Impact Statement]
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
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Perform a comprehensive analysis of the following instrument. Do not skip sections:\n\n${text}` }
                ],
                temperature: 0.1 
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
