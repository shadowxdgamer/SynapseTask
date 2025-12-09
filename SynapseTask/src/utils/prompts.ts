/**
 * AI Prompt Templates for SynapseTask
 * 
 * All prompts are optimized for minimal token usage using TOON format.
 */

/**
 * Magic Add: Convert natural language to structured tasks
 */
export function getMagicAddPrompt(input: string): string {
  return `Analyze this request and create tasks.

Request: "${input}"

Return tasks in TOON format (one per line):
t:title|d:description|p:0-2(0=low,1=medium,2=high)|c:categoryId|e:timeEstimate|s:0

Categories: work,personal,health,study,finance,creative

Example output:
t:Design homepage|d:Create mockups in Figma|p:2|c:work|e:2h|s:0
t:Review design|d:Get feedback from team|p:1|c:work|e:30m|s:0

Break complex goals into subtasks. Be specific with time estimates.
Output TOON only, no markdown or explanation.`;
}

/**
 * Auto-Organize: Refactor existing tasks
 */
export function getAutoOrganizePrompt(tasksToon: string): string {
  return `Analyze and organize these tasks.

Tasks:
${tasksToon}

For each task, update:
- p: priority (0=low,1=medium,2=high) based on urgency
- c: categoryId (work,personal,health,study,finance,creative)
- e: timeEstimate if missing

Return TOON with updates (keep id and title unchanged):
i:taskId|p:newPriority|c:categoryId|e:estimate

Output TOON only, no markdown.`;
}

/**
 * Notes to Tasks: Convert unstructured notes to tasks
 */
export function getNotesToTasksPrompt(notes: string): string {
  return `Extract actionable tasks from these notes.

Notes:
"${notes}"

Return tasks in TOON format:
t:title|d:description|p:0-2|c:categoryId|e:timeEstimate|s:0

Categories: work,personal,health,study,finance,creative

Be specific. Only include actionable items.
Output TOON only, no markdown.`;
}

/**
 * LaTeX Report: Generate report from completed tasks
 */
export function getLatexReportPrompt(
  tasksToon: string,
  reportTitle: string = 'Task Completion Report'
): string {
  return `Generate a LaTeX report for these completed tasks.

Tasks:
${tasksToon}

Requirements:
- Use 'article' document class
- Title: "${reportTitle}"
- Date: ${new Date().toLocaleDateString()}
- Include summary paragraph
- Table with: Task, Category, Time Estimate
- Calculate total estimated time
- Professional formatting

Output raw LaTeX only, no markdown code blocks.`;
}

/**
 * Smart Suggestions: Get suggestions for task improvements
 */
export function getSmartSuggestionsPrompt(tasksToon: string): string {
  return `Analyze these tasks and suggest improvements.

Tasks:
${tasksToon}

Provide brief suggestions for:
1. Tasks that might need breaking down
2. Missing time estimates
3. Priority adjustments
4. Potential blockers or dependencies

Keep response under 200 words. Be concise and actionable.`;
}
