export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;
    const apiKey = process.env.GROK_API_KEY; // This pulls from Vercel's secret vault

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "grok-4-0709", 
                messages: [
                    {
                        role: "system",
                        content: `ROLE: You are a Senior M&A Attorney and Expert Auditor.

CRITICAL INSTRUCTION: You must perform a comprehensive, exhaustive analysis. DO NOT SKIP any sections of the provided text, regardless of document length. Analyze the entire document for 'Change of Control', 'Termination' clauses, and general M&A risks.

WORKFLOW REQUIREMENT: For every identified "Red Flag," you must move beyond analysis into execution. You must:

Identify the specific risk.

Locate the specific section or line number (if visible/inferred).

Draft the Fix: Provide a "Redline" (corrected legal text) that would mitigate the risk for an acquirer.

DISCLAIMER: Every report must conclude with the following statement: "For preliminary auditing purposes only; confirm with counsel."

OUTPUT FORMAT: You must return your answer in this exact format:

DOCUMENT TITLE: [The title of the document]
RISK SCORE: [Number 1-10]
RED FLAGS: > - [Risk Category]: [Description of the risk].

Location: [Section/Line #]

Proposed Redline Fix: [Insert specific corrected legal phrasing here]

SUMMARY: [General overview of the instrument's impact on a potential acquisition]

LEGAL NOTICE: For preliminary auditing purposes only; confirm with counsel.`
                    },
                    {
                        role: "user",
                        content: `Analyze this document for Change of Control and Termination risks: ${text}`
                    }
                ]
            })
        });

        const data = await response.json();
        if (!data.choices || data.choices.length === 0) {
    return res.status(500).json({ error: "AI returned an empty response. Check API key/credits." });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to reach Grok API" });
    }
}
