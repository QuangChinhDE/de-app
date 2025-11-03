/**
 * Node color palette based on category
 * Inspired by n8n's design system
 */

export const NODE_CATEGORY_COLORS = {
  trigger: {
    bg: "bg-amber-100",
    border: "border-amber-400",
    borderHover: "hover:border-amber-500",
    text: "text-amber-700",
    icon: "bg-amber-50",
    description: "Workflow triggers and starters (Manual, Webhook, Schedule, etc.)",
  },
  action: {
    bg: "bg-blue-100",
    border: "border-blue-400",
    borderHover: "hover:border-blue-500",
    text: "text-blue-700",
    icon: "bg-blue-50",
    description: "External app integrations (HTTP, Database, APIs, CRM, etc.)",
  },
  utility: {
    bg: "bg-purple-100",
    border: "border-purple-400",
    borderHover: "hover:border-purple-500",
    text: "text-purple-700",
    icon: "bg-purple-50",
    description: "Data transformation and logic (IF, SWITCH, FILTER, SET, SPLIT, etc.)",
  },
} as const;

export type NodeCategory = keyof typeof NODE_CATEGORY_COLORS;

/**
 * Get combined color classes for a node category
 */
export function getNodeColorClasses(category: NodeCategory): string {
  const colors = NODE_CATEGORY_COLORS[category];
  return `${colors.bg} ${colors.border} ${colors.borderHover}`;
}

/**
 * Map legacy node types to categories (for backward compatibility)
 */
export function getCategoryFromNodeType(nodeType?: string): NodeCategory {
  switch (nodeType) {
    case "trigger":
      return "trigger";
    case "action":
      return "action";
    case "utility":
      return "utility";
    default:
      return "utility"; // Default fallback
  }
}
