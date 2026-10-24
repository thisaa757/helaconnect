// Sample suggested jobs exist only for these two profile interests.

export const SUGGESTED_INTEREST_IDS = ["house-cleaning", "home-cooking"] as const;

export type SuggestedInterestId = (typeof SUGGESTED_INTEREST_IDS)[number];

export function isSuggestedInterest(id: string): id is SuggestedInterestId {
  return (SUGGESTED_INTEREST_IDS as readonly string[]).includes(id);
}

export function suggestedInterestsIn(ids: readonly string[]): SuggestedInterestId[] {
  return SUGGESTED_INTEREST_IDS.filter((id) => ids.includes(id));
}

export type InterestSampleJob = {
  interest: SuggestedInterestId;
  customer_name: string;
  raw_text: string;
  trade: SuggestedInterestId;
  area: string;
  size_estimate: string;
  timeframe: string;
  summary: string;
  created_at: string;
};

export const INTEREST_SAMPLE_JOBS: InterestSampleJob[] = [
  {
    interest: "house-cleaning",
    customer_name: "Demo Customer Sanduni",
    raw_text: "I need a weekly clean for a 3-bedroom house in Colombo. Saturday mornings. Floors, kitchen, and two bathrooms.",
    trade: "house-cleaning",
    area: "Colombo",
    size_estimate: "3-bedroom house",
    timeframe: "Saturday mornings",
    summary: "Weekly house cleaning for a 3-bedroom home in Colombo.",
    created_at: "2026-03-04 09:00:00",
  },
  {
    interest: "house-cleaning",
    customer_name: "Demo Customer Farzana",
    raw_text: "Deep clean a kitchen and two bathrooms in Galle before visitors arrive this Friday.",
    trade: "house-cleaning",
    area: "Galle",
    size_estimate: "kitchen and two bathrooms",
    timeframe: "this Friday",
    summary: "Deep clean a kitchen and two bathrooms in Galle this Friday.",
    created_at: "2026-03-03 09:00:00",
  },
  {
    interest: "home-cooking",
    customer_name: "Demo Customer Nishan",
    raw_text: "Cook weekday lunches for a family of four in Kandy. Rice and two curries. This month.",
    trade: "home-cooking",
    area: "Kandy",
    size_estimate: "4 people",
    timeframe: "weekdays this month",
    summary: "Weekday home cooking for a family of four in Kandy.",
    created_at: "2026-03-02 09:00:00",
  },
  {
    interest: "home-cooking",
    customer_name: "Demo Customer Priya",
    raw_text: "Cook rice and curry for ten guests at home in Negombo next Sunday.",
    trade: "home-cooking",
    area: "Negombo",
    size_estimate: "10 guests",
    timeframe: "next Sunday",
    summary: "Sunday rice and curry for ten guests in Negombo.",
    created_at: "2026-03-01 09:00:00",
  },
];
