
import { Order, MenuItem } from "../types";

/**
 * AI services disabled as per request to avoid paid API quotas.
 * All logic below is strictly local or mocked.
 */

export const generateBusinessInsight = async (orders: Order[]): Promise<string> => {
  // Purely static/local logic placeholder. No external paid requests made.
  return "AI Insights are currently disabled to maintain 100% free operation. Please check the reports tab for detailed manual analytics.";
};

export const generateMarketingCopy = async (item: MenuItem): Promise<string> => {
  return item.description || "Traditional Pakistani taste prepared with fresh ingredients and authentic spices.";
};
