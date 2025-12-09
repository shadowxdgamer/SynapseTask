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
 * Check if a string is valid TOON format
 */
export function isValidToon(str: string): boolean {
  const lines = str.trim().split('\n');
  if (lines.length === 0) return false;

  // Check if most lines have the TOON structure
  const validLines = lines.filter(
    (line) => line.includes('|') && line.includes(':') && line.includes('t:')
  );

  return validLines.length >= lines.length * 0.5;
}

/**
 * Parse AI response - handles both TOON and JSON fallback
 */
export function parseAITaskResponse(content: string): Partial<Task>[] {
  // Clean up the response
  const cleaned = content
    .replace(/```toon/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Try TOON first
  if (isValidToon(cleaned)) {
    return toonToTasks(cleaned);
  }

  // Fallback to JSON
  try {
    const json = JSON.parse(cleaned);
    const tasks = json.tasks || json.updatedTasks || (Array.isArray(json) ? json : []);
    
    return tasks.map((t: Record<string, unknown>) => ({
      id: t.id as string || crypto.randomUUID(),
      title: t.title as string || '',
      description: t.description as string || '',
      status: (t.status as TaskStatus) || 'todo',
      priority: (t.priority as TaskPriority) || 'medium',
      categoryId: t.categoryId as string || t.category as string || null,
      timeEstimate: t.timeEstimate as string || null,
    }));
  } catch {
    console.error('Failed to parse AI response:', cleaned);
    return [];
  }
}

/**
 * Prepare minimal task data for AI prompt (to save tokens)
 */
export function prepareTasksForAI(tasks: Task[]): string {
  return tasksToToon(tasks);
}
