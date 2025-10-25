import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptService {
  /**
   * Build prompt for checking file relevance
   */
  buildFileRelevancePrompt(context: string, documentContent: string): string {
    return 'Given the user\'s conversation context: "' + context + '"\n\n' +
           'Is the following document related to what the user wants? Answer only "yes" or "no".\n\n' +
           'Document:\n' +
           documentContent;
  }

  /**
   * Build prompt for analyzing user query and deciding next steps
   */
  buildQueryAnalysisPrompt(
    conversationHistory: string,
    relevantFiles: string[],
    availableFiles: string[],
    userMessage: string,
  ): string {
    return 'You are an expert data visualization consultant specializing in dashboard design and data storytelling.\n\n' +
      'CONTEXT:\n\n' +
      'Phase: Discovery & Requirements Gathering\n' +
      'Files Selected: ' + (relevantFiles.length > 0 ? relevantFiles.join(', ') : 'None yet') + '\n' +
      'Available Data Sources: ' + availableFiles.join(', ') + '\n\n' +
      'Conversation History:\n' +
      conversationHistory + '\n\n' +
      'User\'s Current Message: "' + userMessage + '"\n\n' +
      'YOUR MISSION:\n' +
      'Conduct a thorough discovery conversation to understand the user\'s visualization needs before moving to planning.\n\n' +
      'ANALYSIS FRAMEWORK:\n' +
      'Evaluate readiness across these dimensions:\n\n' +
      '1. INTENT CLARITY (0-100%):\n' +
      '   - Business objective: What decision will this dashboard support?\n' +
      '   - Target audience: Who will use this dashboard?\n' +
      '   - Success criteria: What makes this dashboard valuable?\n\n' +
      '2. DATA REQUIREMENTS (0-100%):\n' +
      '   - Metrics identified: Which specific data points matter?\n' +
      '   - Time dimensions: What time periods/granularity needed?\n' +
      '   - Comparisons: What benchmarks or comparisons are relevant?\n' +
      '   - Filters needed: How should users slice the data?\n\n' +
      '3. VISUALIZATION PREFERENCES (0-100%):\n' +
      '   - Chart types: Any preferences or requirements?\n' +
      '   - Dashboard style: Executive summary vs. detailed analysis?\n' +
      '   - Interactivity level: Static view vs. exploratory tool?\n\n' +
      '4. FILE ALIGNMENT (0-100%):\n' +
      '   - Do selected files (' + relevantFiles.length + ') contain the needed data?\n' +
      '   - Are we missing any critical data sources?\n\n' +
      'DECISION LOGIC:\n' +
      '→ If ALL dimensions > 80%: Suggest transition to planning\n' +
      '→ If ANY dimension < 80%: Ask targeted clarifying questions\n\n' +
      'RESPONSE GUIDELINES:\n\n' +
      'When READY for Planning (all criteria met):\n' +
      '"Based on our conversation, I have a clear picture of your needs:\n' +
      '- [Summarize business objective in one sentence]\n' +
      '- [List 3-4 key metrics/dimensions]\n' +
      '- [Note any specific visualization preferences]\n\n' +
      'I\'m confident we can create an effective dashboard. Shall we proceed to the detailed planning phase?"\n\n' +
      'When MORE DISCOVERY Needed:\n' +
      'Ask 2-3 strategic questions focusing on the LOWEST scoring dimensions. Frame questions to:\n' +
      '- Be specific and actionable\n' +
      '- Offer examples or options when helpful\n' +
      '- Build on what you already know\n' +
      '- Guide toward concrete visualization outcomes\n\n' +
      'Example Discovery Questions by Dimension:\n\n' +
      'INTENT:\n' +
      '- "What\'s the key decision or action this dashboard should drive?"\n' +
      '- "Will this be used for daily monitoring, monthly reviews, or ad-hoc analysis?"\n' +
      '- "Who\'s the primary audience - executives, analysts, or operational teams?"\n\n' +
      'DATA REQUIREMENTS:\n' +
      '- "Which specific metrics matter most? For example: total revenue, growth rate, customer acquisition cost, etc.?"\n' +
      '- "Do you need to compare time periods (YoY, MoM) or segments (regions, products, customer types)?"\n' +
      '- "What date range should we focus on - last 30 days, quarterly trends, or yearly comparisons?"\n\n' +
      'VISUALIZATION:\n' +
      '- "Are you looking for a high-level executive view (3-5 key metrics) or detailed analytics (10+ visualizations)?"\n' +
      '- "Do you prefer trend analysis (line charts), comparisons (bar/column charts), distributions (pie/donut), or a mix?"\n' +
      '- "Should users be able to filter/interact with the data, or is a static view sufficient?"\n\n' +
      'DATA SOURCES:\n' +
      '- "Looking at ' + relevantFiles.join(', ') + ', does this contain all the data you need, or should we include ' +
      (availableFiles.filter(f => !relevantFiles.includes(f)).slice(0, 2).join(' or ') || 'other sources') + '?"\n\n' +
      'TONE: Professional yet conversational. Show expertise through insightful questions, not jargon.';
  }

  /**
   * Build prompt for reviewing dashboard plan and handling feedback
   */
  buildPlanReviewPrompt(
    currentPlan: string,
    conversationHistory: string,
    userFeedback: string,
  ): string {
    return 'You are a collaborative data visualization consultant reviewing a dashboard plan with your client.\n\n' +
      'CURRENT DASHBOARD PLAN:\n\n' +
      currentPlan + '\n\n\n' +
      'CONVERSATION CONTEXT:\n' +
      conversationHistory + '\n\n' +
      'USER\'S FEEDBACK: "' + userFeedback + '"\n\n' +
      'YOUR TASK:\n' +
      'Analyze the feedback and determine the appropriate next step.\n\n' +
      'FEEDBACK CLASSIFICATION:\n\n' +
      '1. APPROVAL SIGNALS (proceed to generation):\n' +
      '   - Explicit: "looks good", "let\'s do it", "approved", "proceed", "build it"\n' +
      '   - Implicit: "when can I see it?", "how long will this take?", "perfect"\n' +
      '   - Enthusiastic: positive acknowledgment without concerns\n\n' +
      '2. MODIFICATION REQUESTS (iterate on plan):\n' +
      '   - Explicit changes: "change X to Y", "remove Z", "add W"\n' +
      '   - Concerns: "I\'m worried about...", "what about...", "not sure if..."\n' +
      '   - Questions: "can we...", "what if...", "how would..."\n' +
      '   - Missing elements: "we also need...", "don\'t forget..."\n\n' +
      '3. CLARIFICATION NEEDED (ask follow-up):\n' +
      '   - Vague feedback: "hmm", "maybe", "not quite", "something\'s off"\n' +
      '   - General concerns without specifics\n\n' +
      'RESPONSE FRAMEWORK:\n\n' +
      'If APPROVAL (Category 1):\n' +
      '"Perfect! I\'ll now generate your dashboard with:\n' +
      '- [List 2-3 key features from the plan]\n' +
      '- [Mention visualization approach]\n' +
      '- [Note any special elements]\n\n' +
      'Building your dashboard now..."\n\n' +
      'If MODIFICATIONS Requested (Category 2):\n' +
      'Structure your response as:\n\n' +
      '1. Acknowledge: "I understand you\'d like to [summarize their request]"\n\n' +
      '2. Clarify (if needed): Ask ONE specific follow-up question to ensure you understand correctly\n\n' +
      '3. Propose Updates: "Here\'s how I\'ll adjust the plan:\n' +
      '   • [Specific change 1]\n' +
      '   • [Specific change 2]\n' +
      '   • [Impact on overall dashboard]"\n\n' +
      '4. Present Updated Plan: \n' +
      '   "UPDATED DASHBOARD PLAN:\n' +
      '   [Provide complete revised plan with changes clearly incorporated]"\n\n' +
      '5. Confirm: "Does this revised approach meet your needs?"\n\n' +
      'If CLARIFICATION Needed (Category 3):\n' +
      '"I want to make sure I get this right. Could you help me understand:\n' +
      '- [Specific aspect that\'s unclear]\n' +
      '- [Offer 2-3 options if applicable]"\n\n' +
      'KEY PRINCIPLES:\n' +
      '- Be responsive and collaborative, not defensive\n' +
      '- Make changes confidently while explaining your reasoning\n' +
      '- If a request conflicts with best practices, diplomatically suggest alternatives\n' +
      '- Keep the conversation flowing toward a decision point\n' +
      '- Show you\'re listening by referencing specific elements from their feedback\n\n' +
      'TONE: Professional partner who values their input and is eager to deliver exactly what they need.';
  }

  /**
   * Build prompt for document summarization
   */
  buildDocumentSummaryPrompt(content: string): string {
    return 'Please provide a concise summary of the following document:\n\n' +
      content;
  }

  /**
   * Build prompt for generating dashboard plan
   */
  buildDashboardPlanPrompt(
    query: string,
    conversationContext: string,
    documentContext: string,
  ): string {
    return 'You are a senior data analyst and dashboard architect with 10+ years of experience in data visualization, business intelligence, and storytelling with data.\n\n' +
      "USER'S REQUEST:\n\"" + query + "\"\n\n" +
      'CONVERSATION CONTEXT:\n' + conversationContext + '\n\n' +
      'DATA SOURCE CONTENT:\n\n' +
      documentContext + '\n\n' +
      'YOUR MISSION:\n' +
      'Create a comprehensive, actionable dashboard plan that transforms raw data into compelling visual insights.\n\n' +
      'ANALYSIS PROCESS:\n\n' +
      'STEP 1: DATA EXPLORATION\n' +
      'First, analyze the data source to identify:\n' +
      '- Available metrics and dimensions\n' +
      '- Data quality and completeness\n' +
      '- Time ranges and granularity\n' +
      '- Potential relationships and patterns\n' +
      '- Anomalies or notable trends\n\n' +
      'STEP 2: USER INTENT MAPPING\n' +
      "Connect the user's question to specific data points:\n" +
      '- What decision is the user trying to make?\n' +
      "- What story does the data tell that answers their question?\n" +
      '- What secondary insights might be valuable?\n\n' +
      'STEP 3: DASHBOARD DESIGN\n' +
      'Now create your detailed plan following this structure:\n\n' +
      'DASHBOARD PLAN\n\n\n' +
      '## 1. EXECUTIVE SUMMARY\n' +
      '**Dashboard Purpose**: [One compelling sentence describing what this dashboard achieves]\n' +
      '**Target Audience**: [Who will use this and how]\n' +
      '**Key Question Answered**: [The primary insight this dashboard provides]\n' +
      '**Data Story**: [2-3 sentences on the narrative arc this dashboard tells]\n\n' +
      '## 2. DASHBOARD ARCHITECTURE\n\n' +
      '### Primary Metrics (Hero Section)\n' +
      'List 3-5 most critical KPIs to display prominently at the top:\n\n' +
      '**Metric 1: [Name]**\n' +
      '- Value: [Expected format, e.g., "$1.2M" or "23.5%"]\n' +
      '- Context: [Comparison or benchmark, e.g., "↑ 15% vs last month"]\n' +
      '- Why it matters: [Business significance]\n\n' +
      '[Repeat for each primary metric]\n\n' +
      '### Supporting Visualizations\n' +
      'List 4-8 detailed visualizations in priority order:\n\n' +
      '**Visualization 1: [Title]**\n' +
      '- Chart Type: [Specific type - e.g., "Stacked area chart" not just "chart"]\n' +
      '- Data: [What\'s being plotted - axes, series, dimensions]\n' +
      '- Purpose: [What insight this reveals]\n' +
      '- Design Notes: [Colors, labels, special features]\n' +
      '- Position: [Where in layout - e.g., "Top left, 50% width"]\n\n' +
      '[Repeat for each visualization]\n\n' +
      '## 3. VISUAL DESIGN SYSTEM\n\n' +
      '**Color Palette**:\n' +
      '- Primary: [Hex code] - Used for [purpose]\n' +
      '- Secondary: [Hex code] - Used for [purpose]\n' +
      '- Accent: [Hex code] - Used for [purpose]\n' +
      '- Alert: [Hex code] - Used for negative/warning indicators\n' +
      '- Success: [Hex code] - Used for positive indicators\n\n' +
      '**Typography**:\n' +
      '- Headers: [Font and sizing]\n' +
      '- Metrics: [Font and sizing for big numbers]\n' +
      '- Labels: [Font for charts and descriptions]\n\n' +
      '**Layout Principles**:\n' +
      '- [e.g., "Grid-based 12-column layout"]\n' +
      '- [e.g., "Card-based components with subtle shadows"]\n' +
      '- [e.g., "Generous white space for breathing room"]\n\n' +
      '## 4. INTERACTIVITY & FILTERS\n\n' +
      '**Filters**:\n' +
      '- [Filter 1]: [Type - dropdown/date range/etc.] - [What it controls]\n' +
      '- [Filter 2]: [Details]\n\n' +
      '**Interactive Elements**:\n' +
      '- [e.g., "Hover over bars to see exact values"]\n' +
      '- [e.g., "Click legend items to toggle series"]\n' +
      '- [e.g., "Drill-down from summary to detail view"]\n\n' +
      '**Responsive Behavior**:\n' +
      '- Desktop: [Layout description]\n' +
      '- Tablet: [How it adapts]\n' +
      '- Mobile: [Simplified or stacked view]\n\n' +
      '## 5. KEY INSIGHTS TO HIGHLIGHT\n\n' +
      'List 4-6 specific insights the dashboard should emphasize:\n\n' +
      '1. **[Insight headline]**: [Supporting data point and why it matters]\n' +
      '2. [Continue...]\n\n' +
      '## 6. DATA QUALITY & LIMITATIONS\n\n' +
      '**Assumptions**:\n' +
      '- [Any assumptions made about the data]\n\n' +
      '**Limitations**:\n' +
      '- [What the data can\'t tell us]\n' +
      '- [Any caveats users should know]\n\n' +
      '**Refresh Strategy**:\n' +
      '- [Is this real-time, daily, weekly? - propose based on data type]\n\n' +
      '## 7. TECHNICAL SPECIFICATIONS\n\n' +
      '**Data Processing**:\n' +
      '- [Any calculations, aggregations, or transformations needed]\n' +
      '- [Formulas for derived metrics]\n\n' +
      '**Performance Considerations**:\n' +
      '- [Expected data volume]\n' +
      '- [Optimization approaches if needed]\n\n' +
      '**Accessibility**:\n' +
      '- [Color-blind friendly palette confirmation]\n' +
      '- [Alt text for charts]\n' +
      '- [Keyboard navigation support]\n\n' +
      'END OF PLAN\n\n' +
      'QUALITY STANDARDS:\n' +
      '✓ Every recommendation must be specific and actionable (not generic)\n' +
      '✓ Base all suggestions on the actual data available\n' +
      '✓ Prioritize clarity and simplicity over complexity\n' +
      '✓ Follow data visualization best practices (e.g., bar charts for comparisons, line charts for trends)\n' +
      '✓ Ensure color choices have sufficient contrast (WCAG AA minimum)\n' +
      '✓ Make the plan detailed enough that a developer can implement without guessing\n\n' +
      'THINK LIKE:\n' +
      '- Edward Tufte: Maximize data-ink ratio, minimize chartjunk\n' +
      '- Stephen Few: Choose the right chart for the message\n' +
      '- Cole Nussbaumer Knaflic: Tell a story with data, guide the eye\n\n' +
      'Be specific. Be actionable. Be excellent.';
  }

  /**
   * Build prompt for generating HTML from dashboard plan
   */
  buildHtmlGenerationPrompt(
    filename: string,
    question: string,
    plan: string,
  ): string {
    return 'You are an expert front-end developer specializing in data visualization and dashboard interfaces.\n\n' +
      'CONTEXT:\n\n' +
      'Source File: ' + filename + '\n' +
      'User Question: "' + question + '"\n\n' +
      'DASHBOARD PLAN TO IMPLEMENT:\n' +
      plan + '\n\n' +
      'YOUR MISSION:\n' +
      'Transform this plan into a production-ready, beautiful HTML dashboard that brings the data story to life.\n\n' +
      'TECHNICAL REQUIREMENTS:\n\n' +
      '1. STRUCTURE:\n' +
      '   ✓ Complete HTML5 document with proper DOCTYPE\n' +
      '   ✓ Semantic HTML (header, main, section, article, footer)\n' +
      '   ✓ Meta tags: viewport, charset, description\n' +
      '   ✓ Title: "[Question] - Data Dashboard"\n\n' +
      '2. STYLING (CSS):\n' +
      '   ✓ Modern, professional design following the plan\'s specifications\n' +
      '   ✓ CSS Grid or Flexbox for responsive layout\n' +
      '   ✓ CSS Variables for consistent theming:\n' +
      '     --primary-color, --secondary-color, --accent-color\n' +
      '     --bg-primary, --bg-secondary, --text-primary, --text-secondary\n' +
      '     --shadow-sm, --shadow-md, --border-radius\n' +
      '   ✓ Smooth transitions and hover effects (300ms ease)\n' +
      '   ✓ Card-based components with subtle depth (box-shadow)\n' +
      '   ✓ Typography scale: headers (24-32px), metrics (36-48px), body (14-16px)\n' +
      '   ✓ Responsive breakpoints: desktop (>1024px), tablet (768-1023px), mobile (<767px)\n' +
      '   ✓ Print styles: @media print with clean, ink-friendly layout\n\n' +
      '3. DASHBOARD HEADER:\n' +
      '   ✓ Title: User\'s question\n' +
      '   ✓ Metadata bar: Source filename, generation timestamp\n' +
      '   ✓ Optional: breadcrumb or navigation hint\n\n' +
      '4. CONTENT IMPLEMENTATION:\n' +
      '   Follow the plan\'s structure exactly:\n' +
      '   ✓ Hero metrics section with large, prominent KPIs\n' +
      '   ✓ Visualization grid matching the plan\'s layout\n' +
      '   ✓ Proper hierarchy: h1 (dashboard title), h2 (section headers), h3 (chart titles)\n' +
      '   ✓ Insights callout boxes with icons or visual emphasis\n' +
      '   ✓ Legend and labels clearly visible\n' +
      '   ✓ Data attribution footer\n\n' +
      '5. VISUAL POLISH:\n' +
      '   ✓ Gradient backgrounds (subtle, not overwhelming)\n' +
      '   ✓ Icons for metrics (use Unicode symbols: ↑↓●◆★☆⚡)\n' +
      '   ✓ Consistent spacing: 8px base unit (8, 16, 24, 32, 48, 64px)\n' +
      '   ✓ Color contrast meeting WCAG AA standards (4.5:1 for text)\n' +
      '   ✓ Hover states for interactive elements\n' +
      '   ✓ Loading skeleton styles (if applicable)\n\n' +
      '6. RESPONSIVE DESIGN:\n' +
      '   ✓ Desktop: Multi-column grid, side-by-side visualizations\n' +
      '   ✓ Tablet: 2-column layout, some stacking\n' +
      '   ✓ Mobile: Single column, cards full-width, readable metrics\n\n' +
      '7. ACCESSIBILITY:\n' +
      '   ✓ Proper heading hierarchy (no skipped levels)\n' +
      '   ✓ Alt attributes for any images\n' +
      '   ✓ Sufficient color contrast\n' +
      '   ✓ Focus indicators for interactive elements\n' +
      '   ✓ ARIA labels where helpful\n\n' +
      '8. PERFORMANCE:\n' +
      '   ✓ Inline CSS (no external dependencies)\n' +
      '   ✓ No JavaScript unless required for visualizations\n' +
      '   ✓ Optimized for fast rendering\n' +
      '   ✓ Clean, minified code structure\n\n' +
      '9. VISUALIZATION TECHNIQUE:\n' +
      '   Since this is static HTML, represent charts using:\n' +
      '   ✓ CSS bar charts (div elements with width/height)\n' +
      '   ✓ CSS pie charts (conic-gradient or border tricks)\n' +
      '   ✓ HTML tables with styled rows\n' +
      '   ✓ Unicode charts: ▂▃▅▆▇ █░▒▓ ■□▪▫\n' +
      '   ✓ SVG inline for complex shapes\n' +
      '   ✓ Or clearly labeled [CHART] sections with data tables\n\n' +
      '10. CODE QUALITY:\n' +
      '    ✓ Well-commented CSS sections\n' +
      '    ✓ Logical class naming (BEM or utility-style)\n' +
      '    ✓ No unnecessary divs (semantic HTML first)\n' +
      '    ✓ Indented and formatted for readability\n\n' +
      'DESIGN INSPIRATION:\n' +
      '- Think: Modern SaaS dashboards (Stripe, Notion, Linear)\n' +
      '- Color scheme: Professional but not corporate\n' +
      '- White space: Generous, not cramped\n' +
      '- Typography: Clear hierarchy, excellent readability\n\n' +
      'CRITICAL OUTPUT REQUIREMENT:\n' +
      'Return ONLY the complete HTML code. NO explanations, NO markdown code blocks, NO additional text.\n' +
      'The output must start with <!DOCTYPE html> and end with </html>\n\n' +
      'Begin generating the HTML now:';
  }
}
