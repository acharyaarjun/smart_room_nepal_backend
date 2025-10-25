import { ValidationChain } from "express-validator";

const getUnreadSummaryValidator = (): ValidationChain[] => {
  // No query parameters needed for this endpoint
  // User authentication is handled by middleware
  return [];
};

export default getUnreadSummaryValidator;
