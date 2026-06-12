import type { ImproveInput, ImprovementGoal } from '@/lib/schemas/improve'

const goalInstructions: Record<ImprovementGoal, string> = {
  shorter: `Cut the length by roughly 40–60% while preserving every key point and the core message. Remove filler, redundancy, and hedging; tighten sentences; keep the strongest lines.`,
  persuasive: `Make it markedly more persuasive. Lead with benefits, add tasteful urgency and credibility cues, address the reader directly, and end with a stronger, clearer call to action. Do not invent facts or fake social proof.`,
  formal: `Raise the register to professional and formal. Remove slang and contractions, sharpen structure and transitions, and ensure precise, polished phrasing — without becoming stiff or bloated.`,
  seo: `Optimize for search while keeping it natural to read. Improve structure and scannability, use relevant terms and synonyms the audience would search for, strengthen the opening, and avoid keyword stuffing.`,
  rewrite_audience: `Rewrite the text for the specified target audience. Adjust vocabulary, tone, examples, and framing so it resonates with them, while keeping the original intent and key information.`
}

const system = `You are an expert marketing editor. You improve existing copy toward a specific goal and explain what you changed.

Return:
- improved: the full rewritten text, ready to use (Markdown allowed; no commentary, no placeholders).
- changeSummary: 2–5 short bullet points describing the concrete changes you made and why.

Never fabricate facts, statistics, or quotes. Preserve the author's meaning unless the goal requires reframing.`

export function buildImprovePrompt(input: ImproveInput) {
  const lines = [
    `Improvement goal: ${goalInstructions[input.goal]}`,
    input.audience ? `Target audience: ${input.audience}.` : null,
    '',
    'Original text:',
    '"""',
    input.text,
    '"""'
  ].filter(Boolean)

  return { system, user: lines.join('\n') }
}
