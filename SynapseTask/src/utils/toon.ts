import type { Task, TaskPriority, TaskStatus } from '../types';

/**
 * TOON: Token-Optimized Object Notation
 * 
 * A minimalist notation for AI communication that reduces token consumption.
 * 
 * Format:
 * - Single-letter keys for common fields
 * - Pipe (|) as delimiter between key-value pairs
 * - Colon (:) for key-value separation
 * - Newline for multiple objects
 * 
 * Key Mappings:
 *   i = id
 *   t = title
 *   d = description
 *   s = status (0=todo, 1=inprogress, 2=done)
 *   p = priority (0=low, 1=medium, 2=high)
 *   c = categoryId
 *   e = timeEstimate
 */

const STATUSES: TaskStatus[] = ['todo', 'inprogress', 'done'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

/**
 * Convert a Task array to TOON string (for sending to AI)
 */
export function tasksToToon(tasks: Task[]): string {
  return tasks
    .map((task) => {
      const parts: string[] = [
        `i:${task.id}`,
        `t:${task.title}`,
      ];

      if (task.description) {
        parts.push(`d:${task.description.replace(/\|/g, '\\|').replace(/\n/g, '\\n')}`);
      }

      parts.push(`s:${STATUSES.indexOf(task.status)}`);
      parts.push(`p:${PRIORITIES.indexOf(task.priority)}`);

      if (task.categoryId) {
        parts.push(`c:${task.categoryId}`);
      }

      if (task.timeEstimate) {
        parts.push(`e:${task.timeEstimate}`);
      }

      return parts.join('|');
    })
    .join('\n');
}

/**
 * Parse TOON string to partial Task array (from AI response)
 */
export function toonToTasks(toon: string): Partial<Task>[] {
  const lines = toon.trim().split('\n').filter((line) => line.trim());

  return lines.map((line) => {
    const obj: Record<string, string> = {};

    // Split by | but not \|
    const pairs = line.split(/(?<!\\)\|/);

    pairs.forEach((pair) => {
      const colonIndex = pair.indexOf(':');
      if (colonIndex > 0) {
        const key = pair.substring(0, colonIndex).trim();
        const value = pair
          .substring(colonIndex + 1)
          .replace(/\\\|/g, '|')
          .replace(/\\n/g, '\n');
        obj[key] = value;
      }
    });

    const statusIndex = parseInt(obj.s) || 0;
    const priorityIndex = parseInt(obj.p) || 1;

    return {
      id: obj.i || crypto.randomUUID(),
      title: obj.t || '',
      description: obj.d || '',
      status: STATUSES[Math.min(statusIndex, 2)] || 'todo',
      priority: PRIORITIES[Math.min(priorityIndex, 2)] || 'medium',
      categoryId: obj.c || null,
      timeEstimate: obj.e || null,
    };
  });
}

/**
 * Check if a line is a valid TOON task line
 */
function isToonLine(line: string): boolean {
  const trimmed = line.trim();
  // Must have t: (title) and at least one | separator
  return trimmed.includes('t:') && trimmed.includes('|') && trimmed.includes(':');
}

/**
 * Extract TOON lines from mixed content (handles AI preamble/postamble)
 */
function extractToonLines(content: string): string[] {
  const lines = content.split('\n');
  return lines.filter(isToonLine);
}

/**
 * Check if a string contains valid TOON format
 */
export function isValidToon(str: string): boolean {
  const toonLines = extractToonLines(str);
  return toonLines.length > 0;
}

/**
 * Parse AI response - handles both TOON and JSON fallback
 * More robust: extracts TOON lines from mixed content
 */
export function parseAITaskResponse(content: string): Partial<Task>[] {
  if (!content || !content.trim()) {
    console.error('Empty AI response received');
    return [];
  }

  // Clean up the response
  const cleaned = content
    .replace(/```toon/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Extract TOON lines (works even with explanatory text before/after)
  const toonLines = extractToonLines(cleaned);
  
  if (toonLines.length > 0) {
    // Parse only the TOON lines
    return toonToTasks(toonLines.join('\n'));
  }

  // Fallback: Try to find and parse JSON
  try {
    // Try to extract JSON from the content (handle wrapped JSON)
    const jsonMatch = cleaned.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[0]);
      const tasks = json.tasks || json.updatedTasks || (Array.isArray(json) ? json : [json]);
      
      return tasks.map((t: Record<string, unknown>) => ({
        id: t.id as string || crypto.randomUUID(),
        title: t.title as string || '',
        description: t.description as string || '',
        status: (t.status as TaskStatus) || 'todo',
        priority: (t.priority as TaskPriority) || 'medium',
        categoryId: t.categoryId as string || t.category as string || null,
        timeEstimate: t.timeEstimate as string || null,
      }));
    }
  } catch {
    // JSON parsing failed
  }

  // Last resort: Try to create a single task from plain text
  const plainText = cleaned.split('\n')[0]?.trim();
  if (plainText && plainText.length > 0 && plainText.length < 200) {
    console.warn('Falling back to plain text task creation:', plainText);
    return [{
      id: crypto.randomUUID(),
      title: plainText,
      description: '',
      status: 'todo',
      priority: 'medium',
      categoryId: null,
      timeEstimate: null,
    }];
  }

  console.error('Failed to parse AI response:', cleaned.substring(0, 500));
  return [];
}

/**
 * Prepare minimal task data for AI prompt (to save tokens)
 */
export function prepareTasksForAI(tasks: Task[]): string {
  return tasksToToon(tasks);
}
