import { type ContentItem, type ContentGraph, type ContentGraphNode, type ContentRelation, type ContentKind } from './types';

/**
 * Parses a relation reference like "kind:id" or "id"
 */
export function parseRelationRef(ref: string): { kind: string | null; id: string } {
  const colonIndex = ref.indexOf(':');
  if (colonIndex === -1) {
    return { kind: null, id: ref };
  }
  return {
    kind: ref.slice(0, colonIndex),
    id: ref.slice(colonIndex + 1)
  };
}

/**
 * Builds a ContentGraph from a list of ContentItems
 */
export function buildContentGraph(items: ContentItem[]): ContentGraph {
  const nodes = new Map<string, ContentGraphNode>();
  const byId = new Map<string, ContentItem>();
  const byKind = new Map<ContentKind, ContentItem[]>();
  const byTag = new Map<string, ContentItem[]>();
  const byCategory = new Map<string, ContentItem[]>();

  // Helper to ensure lists exist in maps
  const getOrInitArray = <K, V>(map: Map<K, V[]>, key: K): V[] => {
    let arr = map.get(key);
    if (!arr) {
      arr = [];
      map.set(key, arr);
    }
    return arr;
  };

  // 1. First pass: Index all items and build initial nodes
  for (const item of items) {
    if (!item.id) continue;

    byId.set(item.id, item);

    if (item.kind) {
      getOrInitArray(byKind, item.kind).push(item);
    }

    if (item.tags) {
      for (const tag of item.tags) {
        if (tag) {
          getOrInitArray(byTag, tag.toLowerCase()).push(item);
        }
      }
    }

    if (item.category) {
      getOrInitArray(byCategory, item.category.toLowerCase()).push(item);
    }

    nodes.set(item.id, {
      item,
      incoming: [],
      outgoing: []
    });
  }

  // 2. Second pass: Build relations
  for (const item of items) {
    if (!item.id) continue;
    const sourceNode = nodes.get(item.id);
    if (!sourceNode) continue;

    const relatedRefs = item.related || [];
    for (const ref of relatedRefs) {
      if (!ref) continue;
      const { kind: targetKind, id: targetId } = parseRelationRef(ref);

      // Verify missing relations without crashing runtime
      const targetNode = nodes.get(targetId);
      if (!targetNode) {
        console.warn(`[ContentGraph] Missing relation target item: "${targetId}" referenced by "${item.id}" (ref: "${ref}")`);
        continue;
      }

      if (targetKind && targetNode.item.kind !== targetKind) {
        console.warn(`[ContentGraph] Relation target item "${targetId}" has kind "${targetNode.item.kind}", but ref "${ref}" expected "${targetKind}"`);
      }

      const relation: ContentRelation = {
        sourceId: item.id,
        targetId,
        kind: 'related'
      };

      sourceNode.outgoing.push(relation);
      targetNode.incoming.push(relation);
    }
  }

  return {
    nodes,
    byId,
    byKind,
    byTag,
    byCategory
  };
}

/**
 * Returns all content items of a specific kind
 */
export function getContentByKind(graph: ContentGraph, kind: ContentKind): ContentItem[] {
  return graph.byKind.get(kind) || [];
}

/**
 * Resolves related content items for a given item in the graph
 */
export function getRelatedContent(graph: ContentGraph, itemId: string): ContentItem[] {
  const node = graph.nodes.get(itemId);
  if (!node) return [];

  const related = new Map<string, ContentItem>();

  // Add outgoing explicit relations
  for (const rel of node.outgoing) {
    const target = graph.byId.get(rel.targetId);
    if (target) {
      related.set(target.id, target);
    }
  }

  // Add incoming explicit relations (bidirectional lookup support)
  for (const rel of node.incoming) {
    const source = graph.byId.get(rel.sourceId);
    if (source) {
      related.set(source.id, source);
    }
  }

  return Array.from(related.values());
}
