// Work categories for Hela Connect.
// Business type and interests both store the category id.
// Labels are shown in the user's language. Keep ids in sync with supabase/profile_ratings.sql.

import type { Lang } from "@/lib/types";

export const CATEGORY_GROUPS = [
  { id: "household", labels: { en: "Household", si: "ගෘහස්ථ", ta: "வீட்டு வேலை" } },
  { id: "construction", labels: { en: "Construction", si: "ඉදිකිරීම්", ta: "கட்டுமானம்" } },
  { id: "repair", labels: { en: "Repair", si: "අලුත්වැඩියා", ta: "பழுதுபார்ப்பு" } },
  { id: "outdoor", labels: { en: "Outdoor", si: "එළිමහන්", ta: "வெளிப்புறம்" } },
  { id: "transport", labels: { en: "Transport", si: "ප්‍රවාහන", ta: "போக்குவரத்து" } },
  { id: "events", labels: { en: "Events", si: "උත්සව", ta: "நிகழ்வுகள்" } },
] as const;

export type CategoryGroupId = (typeof CATEGORY_GROUPS)[number]["id"];

export type Category = {
  id: string;
  group: CategoryGroupId;
  labels: Record<Lang, string>;
};

export const CATEGORIES: Category[] = [
  { id: "house-cleaning", group: "household", labels: { en: "House cleaning", si: "ගෙය පිරිසිදු කිරීම", ta: "வீட்டு சுத்தம்" } },
  { id: "home-cooking", group: "household", labels: { en: "Home cooking", si: "ගෙදර ආහාර පිසීම", ta: "வீட்டு சமையல்" } },
  { id: "laundry", group: "household", labels: { en: "Laundry and ironing", si: "රෙදි සේදීම සහ ඉස්ත්‍රි කිරීම", ta: "துணி துவைத்தல்" } },
  { id: "childcare", group: "household", labels: { en: "Childcare", si: "ළමා රැකවරණය", ta: "குழந்தை பராமரிப்பு" } },
  { id: "elder-care", group: "household", labels: { en: "Elder care", si: "වැඩිහිටි රැකවරණය", ta: "முதியோர் பராமரிப்பு" } },
  { id: "domestic-help", group: "household", labels: { en: "Domestic help", si: "ගෘහ සහාය", ta: "வீட்டு உதவி" } },
  { id: "masonry", group: "construction", labels: { en: "Masonry", si: "පෙදරේරු වැඩ", ta: "கொத்தனார் வேலை" } },
  { id: "tiling", group: "construction", labels: { en: "Tiling", si: "ටයිල්", ta: "ஓடு வேலை" } },
  { id: "painting", group: "construction", labels: { en: "Painting", si: "තීන්ත", ta: "பெயிண்ட்" } },
  { id: "carpentry", group: "construction", labels: { en: "Carpentry", si: "වඩු වැඩ", ta: "தச்சு வேலை" } },
  { id: "welding", group: "construction", labels: { en: "Welding", si: "වෙල්ඩින්", ta: "வெல்டிங்" } },
  { id: "roofing", group: "construction", labels: { en: "Roofing", si: "වහල වැඩ", ta: "கூரை வேலை" } },
  { id: "electrical", group: "repair", labels: { en: "Electrical repair", si: "විදුලි අලුත්වැඩියා", ta: "மின்சார பழுது" } },
  { id: "plumbing", group: "repair", labels: { en: "Plumbing", si: "ජල නල", ta: "குழாய் வேலை" } },
  { id: "appliance-repair", group: "repair", labels: { en: "Appliance repair", si: "උපකරණ අලුත්වැඩියා", ta: "சாதன பழுது" } },
  { id: "phone-repair", group: "repair", labels: { en: "Phone and computer repair", si: "දුරකථන සහ පරිගණක අලුත්වැඩියා", ta: "தொலைபேசி மற்றும் கணினி பழுது" } },
  { id: "vehicle-repair", group: "repair", labels: { en: "Vehicle repair", si: "වාහන අලුත්වැඩියා", ta: "வாகன பழுது" } },
  { id: "ac-repair", group: "repair", labels: { en: "AC repair", si: "වායුසමීකරණ අලුත්වැඩියා", ta: "ஏசி பழுது" } },
  { id: "gardening", group: "outdoor", labels: { en: "Gardening", si: "ගෙවත්ත", ta: "தோட்ட வேலை" } },
  { id: "landscaping", group: "outdoor", labels: { en: "Landscaping", si: "භූමි අලංකරණය", ta: "நில அலங்காரம்" } },
  { id: "pest-control", group: "outdoor", labels: { en: "Pest control", si: "පළිබෝධ පාලනය", ta: "பூச்சி கட்டுப்பாடு" } },
  { id: "tree-cutting", group: "outdoor", labels: { en: "Tree cutting", si: "ගස් කැපීම", ta: "மரம் வெட்டுதல்" } },
  { id: "farm-help", group: "outdoor", labels: { en: "Farm help", si: "ගොවි වැඩ", ta: "விவசாய உதவி" } },
  { id: "three-wheeler", group: "transport", labels: { en: "Three-wheeler rides", si: "ත්‍රීවීල් සේවය", ta: "முச்சக்கர வண்டி" } },
  { id: "goods-transport", group: "transport", labels: { en: "Goods transport", si: "භාණ්ඩ ප්‍රවාහනය", ta: "பொருள் போக்குவரத்து" } },
  { id: "house-moving", group: "transport", labels: { en: "House moving", si: "නිවස මාරු කිරීම", ta: "வீடு மாற்றுதல்" } },
  { id: "private-driver", group: "transport", labels: { en: "Private driver", si: "පුද්ගලික රියදුරු", ta: "தனியார் ஓட்டுநர்" } },
  { id: "delivery", group: "transport", labels: { en: "Delivery", si: "බෙදාහැරීම", ta: "டெலிவரி" } },
  { id: "catering", group: "events", labels: { en: "Catering", si: "ආහාර සැපයීම", ta: "கேட்டரிங்" } },
  { id: "decoration", group: "events", labels: { en: "Decoration", si: "සැරසිලි", ta: "அலங்காரம்" } },
  { id: "music", group: "events", labels: { en: "Music and DJ", si: "සංගීතය සහ ඩීජේ", ta: "இசை மற்றும் டிஜே" } },
  { id: "photography", group: "events", labels: { en: "Photography", si: "ඡායාරූප", ta: "புகைப்படம்" } },
  { id: "tent-hire", group: "events", labels: { en: "Tent and chair hire", si: "කූඩාරම් සහ පුටු කුලිය", ta: "கூடாரம் மற்றும் நாற்காலி வாடகை" } },
  { id: "bridal-makeup", group: "events", labels: { en: "Bridal makeup", si: "මනාලියන්ගේ වේශ නිරූපණය", ta: "மணமகள் ஒப்பனை" } },
];

const byId = new Map(CATEGORIES.map((category) => [category.id, category]));

export function categoryById(id: string): Category | undefined {
  return byId.get(id);
}

export function isCategoryId(id: string): boolean {
  return byId.has(id);
}

export function categoryLabel(id: string, lang: Lang): string {
  return byId.get(id)?.labels[lang] ?? id;
}

export function groupedCategories() {
  return CATEGORY_GROUPS.map((group) => ({
    ...group,
    categories: CATEGORIES.filter((category) => category.group === group.id),
  }));
}
