export const METAMASK_GAS_LIMIT_ASSOCIATE = 800_000;
export const METAMASK_GAS_LIMIT_TRANSFER_FT = 50_000;
export const METAMASK_GAS_LIMIT_TRANSFER_NFT = 100_000;
export const REGULATIONS = {
  regA: {
    name: "Regulation A+",
    subtypes: ["Tier 1", "Tier 2"],
    rules: {
      "Tier 1": [
        { restriction: "Deal size", rule: "Up to $20 million" },
        { restriction: "Investors", rule: "Open to all" },
        {
          restriction: "Verification",
          rule: "No income verification required",
        },
        { restriction: "International investors", rule: "Allowed" },
        { restriction: "Resale hold period", rule: "Not applicable" },
      ],
      "Tier 2": [
        { restriction: "Deal size", rule: "Up to $75 million" },
        { restriction: "Investors", rule: "Open to all" },
        { restriction: "Verification", rule: "Income verification required" },
        { restriction: "International investors", rule: "Allowed" },
        { restriction: "Resale hold period", rule: "Not applicable" },
      ],
    },
  },
  regD: {
    name: "Regulation D",
    subtypes: ["506 B", "506 C"],
    rules: {
      "506 B": [
        { restriction: "Deal size", rule: "Unlimited capital" },
        { restriction: "Accredited investors", rule: "Accreditation required" },
        { restriction: "Max non-accredited investors", rule: "35" },
        { restriction: "General solicitation", rule: "Not allowed" },
        {
          restriction: "Manual verification",
          rule: "Investor documents required",
        },
        { restriction: "International investors", rule: "Not allowed" },
        { restriction: "Resale hold period", rule: "6 months to 1 year" },
      ],
      "506 C": [
        { restriction: "Deal size", rule: "Unlimited capital" },
        { restriction: "Accredited investors", rule: "Accreditation required" },
        { restriction: "Max non-accredited investors", rule: "Not allowed" },
        { restriction: "General solicitation", rule: "Allowed" },
        {
          restriction: "Manual verification",
          rule: "Investor documents required",
        },
        { restriction: "International investors", rule: "Allowed" },
        { restriction: "Resale hold period", rule: "Not applicable" },
      ],
    },
  },
  regS: {
    name: "Regulation S",
    subtypes: ["Non-U.S. Offers"],
    rules: {
      "Non-U.S. Offers": [
        { restriction: "Deal size", rule: "Unlimited capital" },
        { restriction: "Investors", rule: "Non-U.S. investors only" },
        { restriction: "General solicitation", rule: "Allowed" },
        {
          restriction: "Manual verification",
          rule: "May be required based on jurisdiction",
        },
        { restriction: "Resale hold period", rule: "1 year" },
      ],
    },
  },
  regCF: {
    name: "Regulation CF",
    subtypes: ["Crowdfunding"],
    rules: {
      Crowdfunding: [
        { restriction: "Deal size", rule: "Up to $5 million annually" },
        { restriction: "Investors", rule: "Open to all" },
        { restriction: "Verification", rule: "Income verification required" },
        { restriction: "International investors", rule: "Allowed" },
        { restriction: "Resale hold period", rule: "1 year" },
      ],
    },
  },
};
