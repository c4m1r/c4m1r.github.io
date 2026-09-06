/**
 * Loads markdown content by fetching the file at path.
 */
export async function loadMarkdownContent(path: string): Promise<string> {
  try {
    // Remove .md extension if present
    const cleanPath = path.replace(/\.md$/, '');
    const response = await fetch(`/src/content/${cleanPath}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading markdown:', error);
    throw error;
  }
}
