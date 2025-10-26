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
    return 'You are an elite front-end developer and data visualization specialist with expertise in creating stunning, insight-driven dashboards.\n\n' +
      '\n' +
      'CONTEXT\n' +
      '\n' +
      'Source File: ' + filename + '\n' +
      'User Question: "' + question + '"\n\n' +
      'DASHBOARD PLAN:\n' +
      plan + '\n\n' +
      '\n' +
      'YOUR MISSION\n' +
      '\n\n' +
      'Create a production-ready, STUNNING dashboard that:\n' +
      '✓ Tells a compelling data story at first glance\n' +
      '✓ Uses interactive Chart.js visualizations that bring data to life\n' +
      '✓ Guides the user\'s eye to the most important insights\n' +
      '✓ Feels premium, modern, and delightful to use\n\n' +
      '\n' +
      'TECHNICAL REQUIREMENTS\n' +
      '\n\n' +
      '1. DOCUMENT STRUCTURE:\n' +
      '   ✓ Complete HTML5 document with <!DOCTYPE html>\n' +
      '   ✓ <head> section with:\n' +
      '     - <meta charset="UTF-8">\n' +
      '     - <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '     - <title>[Question] - Data Dashboard</title>\n' +
      '     - Chart.js CDN: <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>\n' +
      '   ✓ Semantic HTML5: <header>, <main>, <section>, <article>, <footer>\n\n' +
      '2. CHART.JS VISUALIZATION EXCELLENCE:\n\n' +
      '   CRITICAL: Use Chart.js for ALL major visualizations. Each chart must:\n\n' +
      '   A) CHART SELECTION (Choose the RIGHT chart type):\n' +
      '      • Line Chart → Trends over time, continuous data\n' +
      '      • Bar/Column Chart → Comparisons between categories\n' +
      '      • Horizontal Bar → Rankings, long category names\n' +
      '      • Pie/Doughnut → Part-to-whole (max 5-6 slices)\n' +
      '      • Area Chart → Volume over time, cumulative trends\n' +
      '      • Scatter Plot → Relationships, correlations\n' +
      '      • Mixed Charts → Multiple metrics (line + bar combo)\n\n' +
      '   B) CHART CONFIGURATION (Make charts BEAUTIFUL):\n' +
      '      ```javascript\n' +
      '      const config = {\n' +
      '        type: \'bar\', // or line, pie, doughnut, etc.\n' +
      '        data: {\n' +
      '          labels: [\'Jan\', \'Feb\', \'Mar\', ...],\n' +
      '          datasets: [{\n' +
      '            label: \'Revenue\',\n' +
      '            data: [12, 19, 3, ...],\n' +
      '            backgroundColor: \'rgba(99, 102, 241, 0.8)\', // Use your theme colors\n' +
      '            borderColor: \'rgba(99, 102, 241, 1)\',\n' +
      '            borderWidth: 2,\n' +
      '            borderRadius: 8, // Rounded corners\n' +
      '            tension: 0.4 // Smooth lines\n' +
      '          }]\n' +
      '        },\n' +
      '        options: {\n' +
      '          responsive: true,\n' +
      '          maintainAspectRatio: true,\n' +
      '          plugins: {\n' +
      '            legend: {\n' +
      '              display: true,\n' +
      '              position: \'top\',\n' +
      '              labels: {\n' +
      '                font: { size: 12, family: \'Inter, sans-serif\' },\n' +
      '                padding: 15,\n' +
      '                usePointStyle: true // Modern legend style\n' +
      '              }\n' +
      '            },\n' +
      '            tooltip: {\n' +
      '              backgroundColor: \'rgba(0, 0, 0, 0.8)\',\n' +
      '              padding: 12,\n' +
      '              cornerRadius: 8,\n' +
      '              titleFont: { size: 14, weight: \'bold\' },\n' +
      '              bodyFont: { size: 13 },\n' +
      '              callbacks: {\n' +
      '                label: (context) => {\n' +
      '                  // Format numbers: $1.2M, 45.3%, etc.\n' +
      '                  return ` ${context.dataset.label}: ${formatValue(context.parsed.y)}`;\n' +
      '                }\n' +
      '              }\n' +
      '            },\n' +
      '            title: {\n' +
      '              display: false // Use HTML h3 for titles instead\n' +
      '            }\n' +
      '          },\n' +
      '          scales: {\n' +
      '            y: {\n' +
      '              beginAtZero: true,\n' +
      '              grid: {\n' +
      '                color: \'rgba(0, 0, 0, 0.05)\', // Subtle grid lines\n' +
      '                drawBorder: false\n' +
      '              },\n' +
      '              ticks: {\n' +
      '                font: { size: 11 },\n' +
      '                callback: (value) => formatValue(value) // Format axis labels\n' +
      '              }\n' +
      '            },\n' +
      '            x: {\n' +
      '              grid: { display: false }, // Clean x-axis\n' +
      '              ticks: { font: { size: 11 } }\n' +
      '            }\n' +
      '          },\n' +
      '          interaction: {\n' +
      '            intersect: false,\n' +
      '            mode: \'index\' // Show all values on hover\n' +
      '          },\n' +
      '          animation: {\n' +
      '            duration: 1000,\n' +
      '            easing: \'easeInOutQuart\'\n' +
      '          }\n' +
      '        }\n' +
      '      };\n' +
      '      ```\n\n' +
      '   C) CHART IMPLEMENTATION PATTERN:\n' +
      '      ```html\n' +
      '      <div class="chart-container">\n' +
      '        <h3 class="chart-title">Revenue Trend</h3>\n' +
      '        <p class="chart-subtitle">Monthly performance over the last 12 months</p>\n' +
      '        <canvas id="revenueChart"></canvas>\n' +
      '      </div>\n' +
      '      <script>\n' +
      '        const ctx = document.getElementById(\'revenueChart\').getContext(\'2d\');\n' +
      '        new Chart(ctx, config);\n' +
      '      </script>\n' +
      '      ```\n\n' +
      '   D) COLOR PALETTES (Choose ONE cohesive scheme):\n\n' +
      '      Option 1 - Modern Blue:\n' +
      '      • Primary: [\'#6366f1\', \'#8b5cf6\', \'#ec4899\', \'#f59e0b\', \'#10b981\']\n' +
      '      • Use: Professional, tech, financial dashboards\n\n' +
      '      Option 2 - Vibrant Gradient:\n' +
      '      • Primary: [\'#667eea\', \'#764ba2\', \'#f093fb\', \'#4facfe\', \'#00f2fe\']\n' +
      '      • Use: Creative, marketing, engagement dashboards\n\n' +
      '      Option 3 - Sophisticated Dark:\n' +
      '      • Primary: [\'#3b82f6\', \'#8b5cf6\', \'#ec4899\', \'#f59e0b\', \'#14b8a6\']\n' +
      '      • Use: Executive, analytics, dark mode dashboards\n\n' +
      '      Option 4 - Warm Business:\n' +
      '      • Primary: [\'#f59e0b\', \'#ef4444\', \'#8b5cf6\', \'#3b82f6\', \'#10b981\']\n' +
      '      • Use: Sales, revenue, performance dashboards\n\n' +
      '      IMPORTANT: Use consistent alpha values for fills (0.7-0.8) and borders (1.0)\n\n' +
      '   E) DATA FORMATTING HELPER:\n' +
      '      ```javascript\n' +
      '      function formatValue(value) {\n' +
      '        if (value >= 1e9) return \'$\' + (value / 1e9).toFixed(1) + \'B\';\n' +
      '        if (value >= 1e6) return \'$\' + (value / 1e6).toFixed(1) + \'M\';\n' +
      '        if (value >= 1e3) return \'$\' + (value / 1e3).toFixed(1) + \'K\';\n' +
      '        return \'$\' + value.toFixed(0);\n' +
      '        // Adjust for percentages, counts, etc.\n' +
      '      }\n' +
      '      ```\n\n' +
      '3. DASHBOARD LAYOUT ARCHITECTURE:\n\n' +
      '   A) HERO SECTION (Top - Immediate Impact):\n' +
      '      ```html\n' +
      '      <section class="hero-metrics">\n' +
      '        <div class="kpi-card">\n' +
      '          <div class="kpi-icon">📈</div>\n' +
      '          <div class="kpi-content">\n' +
      '            <p class="kpi-label">Total Revenue</p>\n' +
      '            <h2 class="kpi-value">$2.4M</h2>\n' +
      '            <p class="kpi-change positive">↑ 23.5% vs last month</p>\n' +
      '          </div>\n' +
      '        </div>\n' +
      '        <!-- 3-5 key metrics -->\n' +
      '      </section>\n' +
      '      ```\n\n' +
      '   B) VISUALIZATION GRID (Main Content):\n' +
      '      • Use CSS Grid: 2-3 columns on desktop\n' +
      '      • Each chart in a card with padding and shadow\n' +
      '      • Prioritize: Most important chart = largest size\n' +
      '      • Aspect ratio: 16:9 for main charts, 1:1 for secondary\n\n' +
      '   C) INSIGHT CALLOUTS (Highlight Key Findings):\n' +
      '      ```html\n' +
      '      <div class="insight-box">\n' +
      '        <span class="insight-icon">💡</span>\n' +
      '        <div>\n' +
      '          <h4>Key Insight</h4>\n' +
      '          <p>Q4 sales exceeded targets by 34%, driven primarily by product category A</p>\n' +
      '        </div>\n' +
      '      </div>\n' +
      '      ```\n\n' +
      '4. CSS DESIGN SYSTEM:\n\n' +
      '   ```css\n' +
      '   :root {\n' +
      '     /* Colors */\n' +
      '     --primary: #6366f1;\n' +
      '     --secondary: #8b5cf6;\n' +
      '     --accent: #ec4899;\n' +
      '     --success: #10b981;\n' +
      '     --warning: #f59e0b;\n' +
      '     --danger: #ef4444;\n' +
      '     \n' +
      '     /* Backgrounds */\n' +
      '     --bg-primary: #ffffff;\n' +
      '     --bg-secondary: #f9fafb;\n' +
      '     --bg-card: #ffffff;\n' +
      '     \n' +
      '     /* Text */\n' +
      '     --text-primary: #111827;\n' +
      '     --text-secondary: #6b7280;\n' +
      '     --text-muted: #9ca3af;\n' +
      '     \n' +
      '     /* Shadows */\n' +
      '     --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);\n' +
      '     --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);\n' +
      '     --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);\n' +
      '     --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);\n' +
      '     \n' +
      '     /* Spacing */\n' +
      '     --space-xs: 4px;\n' +
      '     --space-sm: 8px;\n' +
      '     --space-md: 16px;\n' +
      '     --space-lg: 24px;\n' +
      '     --space-xl: 32px;\n' +
      '     --space-2xl: 48px;\n' +
      '     \n' +
      '     /* Border Radius */\n' +
      '     --radius-sm: 6px;\n' +
      '     --radius-md: 12px;\n' +
      '     --radius-lg: 16px;\n' +
      '     --radius-full: 9999px;\n' +
      '     \n' +
      '     /* Typography */\n' +
      '     --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;\n' +
      '     --font-mono: "SF Mono", Consolas, monospace;\n' +
      '   }\n\n' +
      '   body {\n' +
      '     font-family: var(--font-sans);\n' +
      '     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n' +
      '     /* OR: solid color with texture */\n' +
      '     color: var(--text-primary);\n' +
      '     line-height: 1.6;\n' +
      '     margin: 0;\n' +
      '     padding: var(--space-lg);\n' +
      '   }\n\n' +
      '   .dashboard-container {\n' +
      '     max-width: 1400px;\n' +
      '     margin: 0 auto;\n' +
      '     background: var(--bg-primary);\n' +
      '     border-radius: var(--radius-lg);\n' +
      '     box-shadow: var(--shadow-xl);\n' +
      '     padding: var(--space-2xl);\n' +
      '   }\n\n' +
      '   .chart-container {\n' +
      '     background: var(--bg-card);\n' +
      '     border-radius: var(--radius-md);\n' +
      '     padding: var(--space-lg);\n' +
      '     box-shadow: var(--shadow-md);\n' +
      '     transition: all 0.3s ease;\n' +
      '     border: 1px solid rgba(0, 0, 0, 0.05);\n' +
      '   }\n\n' +
      '   .chart-container:hover {\n' +
      '     box-shadow: var(--shadow-lg);\n' +
      '     transform: translateY(-2px);\n' +
      '   }\n\n' +
      '   .kpi-card {\n' +
      '     background: linear-gradient(135deg, var(--primary), var(--secondary));\n' +
      '     color: white;\n' +
      '     border-radius: var(--radius-md);\n' +
      '     padding: var(--space-xl);\n' +
      '     box-shadow: var(--shadow-lg);\n' +
      '   }\n\n' +
      '   .kpi-value {\n' +
      '     font-size: 48px;\n' +
      '     font-weight: 700;\n' +
      '     margin: var(--space-sm) 0;\n' +
      '     letter-spacing: -1px;\n' +
      '   }\n' +
      '   ```\n\n' +
      '5. RESPONSIVE DESIGN:\n\n' +
      '   ```css\n' +
      '   /* Desktop: 3-column grid */\n' +
      '   .visualization-grid {\n' +
      '     display: grid;\n' +
      '     grid-template-columns: repeat(3, 1fr);\n' +
      '     gap: var(--space-lg);\n' +
      '   }\n\n' +
      '   /* Featured charts span 2 columns */\n' +
      '   .chart-featured {\n' +
      '     grid-column: span 2;\n' +
      '   }\n\n' +
      '   /* Tablet: 2 columns */\n' +
      '   @media (max-width: 1024px) {\n' +
      '     .visualization-grid {\n' +
      '       grid-template-columns: repeat(2, 1fr);\n' +
      '     }\n' +
      '   }\n\n' +
      '   /* Mobile: 1 column */\n' +
      '   @media (max-width: 768px) {\n' +
      '     .visualization-grid {\n' +
      '       grid-template-columns: 1fr;\n' +
      '     }\n' +
      '     .chart-featured {\n' +
      '       grid-column: span 1;\n' +
      '     }\n' +
      '     .kpi-value {\n' +
      '       font-size: 36px;\n' +
      '     }\n' +
      '   }\n' +
      '   ```\n\n' +
      '6. ACCESSIBILITY EXCELLENCE:\n' +
      '   ✓ All charts have descriptive aria-label attributes\n' +
      '   ✓ Color is NOT the only way to convey information (use icons, labels)\n' +
      '   ✓ Sufficient contrast ratios (4.5:1 minimum)\n' +
      '   ✓ Semantic heading hierarchy (h1 → h2 → h3)\n' +
      '   ✓ Focus indicators on interactive elements\n\n' +
      '7. PERFORMANCE OPTIMIZATION:\n' +
      '   ✓ Inline critical CSS in <style> tag\n' +
      '   ✓ Load Chart.js from CDN (cached across sites)\n' +
      '   ✓ Initialize charts after DOM ready\n' +
      '   ✓ Use requestAnimationFrame for smooth animations\n' +
      '   ✓ Minimize chart data points if > 100 (aggregate as needed)\n\n' +
      '8. JAVASCRIPT STRUCTURE:\n\n' +
      '   ```javascript\n' +
      '   document.addEventListener(\'DOMContentLoaded\', function() {\n' +
      '     // Initialize all charts\n' +
      '     initRevenueChart();\n' +
      '     initGrowthChart();\n' +
      '     // ... etc\n' +
      '   });\n\n' +
      '   function initRevenueChart() {\n' +
      '     const ctx = document.getElementById(\'revenueChart\').getContext(\'2d\');\n' +
      '     const chart = new Chart(ctx, {\n' +
      '       // configuration\n' +
      '     });\n' +
      '   }\n' +
      '   ```\n\n' +
      '\n' +
      'DATA VISUALIZATION BEST PRACTICES\n' +
      '\n\n' +
      '✓ START WITH THE ANSWER: Most important insight = largest, top-left position\n' +
      '✓ VISUAL HIERARCHY: Guide the eye with size, color, position\n' +
      '✓ REDUCE COGNITIVE LOAD: Remove chart borders, excessive gridlines, 3D effects\n' +
      '✓ USE COLOR PURPOSEFULLY: \n' +
      '  • Green = positive/growth\n' +
      '  • Red = negative/decline  \n' +
      '  • Blue/Purple = neutral/primary data\n' +
      '  • Yellow/Orange = warnings/highlights\n' +
      '✓ CONTEXT MATTERS: Always show comparisons (vs last period, vs target, vs average)\n' +
      '✓ LABEL DIRECTLY: Put labels on the chart, not just in legend\n' +
      '✓ FORMAT NUMBERS: Use K, M, B suffixes; include currency symbols; show percentages\n' +
      '✓ TELL A STORY: Order charts to build narrative (overview → detail → insights)\n\n' +
      '\n' +
      'QUALITY CHECKLIST (Review before output)\n' +
      '\n\n' +
      '□ Chart.js CDN loaded in <head>\n' +
      '□ Every major visualization uses Chart.js (not CSS/Unicode)\n' +
      '□ Charts are properly configured with beautiful styling\n' +
      '□ Color palette is consistent across all charts\n' +
      '□ KPI cards show clear metrics with context (comparison/trend)\n' +
      '□ Layout has clear visual hierarchy (hero → visualizations → insights)\n' +
      '□ Responsive design works on mobile/tablet/desktop\n' +
      '□ All charts have descriptive titles and subtitles\n' +
      '□ Numbers are formatted appropriately ($1.2M, 23.5%, etc.)\n' +
      '□ Color contrast meets WCAG AA standards\n' +
      '□ JavaScript is clean, commented, and functional\n' +
      '□ Dashboard tells a clear data story\n' +
      '□ Design feels premium and modern\n\n' +
      '\n' +
      'CRITICAL OUTPUT REQUIREMENT\n' +
      '\n\n' +
      'Return ONLY the complete HTML code.\n' +
      'NO explanations. NO markdown code blocks. NO additional text.\n' +
      'Output must start with <!DOCTYPE html> and end with </html>\n\n' +
      'BEGIN GENERATING THE STUNNING DASHBOARD NOW:';
  }
}
