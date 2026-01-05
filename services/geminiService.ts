
import { Order, MenuItem } from "../types";

/**
 * AI services disabled as per request.
 * Functions return static data or defaults to maintain app stability.
 */

export const generateBusinessInsight = async (orders: Order[]): Promise<string> => {
  return "AI Insights are currently disabled. Please check the reports tab for detailed manual analytics.";
};

export const generateMarketingCopy = async (item: MenuItem): Promise<string> => {
  return item.description || "Traditional Pakistani taste prepared with fresh ingredients.";
};
