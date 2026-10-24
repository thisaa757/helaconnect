// Loads fictional demo data. Safe to run again: it clears the tables first.
// Every name and phone number here is made up.

import { createJob, createRequest, createWorker, getDb, insertReview } from "../src/lib/db";
import type { NewWorker } from "../src/lib/types";

const workers: NewWorker[] = [
  {
    name: "Amal Fernando",
    phone: "070-000-1001",
    trade: "tiler",
    headline: "Bathroom tiler in Colombo",
    summary:
      "Amal lays and replaces bathroom tiles for houses in Colombo. He has 8 years of experience and levels floors before tiling. He speaks Sinhala and English.",
    skills: ["bathroom tiling", "floor leveling"],
    years_experience: 8,
    area: "Colombo",
    languages: ["Sinhala", "English"],
    raw_description: "මම අමල්. කොළඹ නාන කාමරවලට ටයිල් යනවා. බිම සමතලා කරනවා. අවුරුදු 8යි. සිංහලයි ඉංග්‍රීසියයි.",
  },
  {
    name: "Kumari Silva",
    phone: "070-000-1002",
    trade: "painter",
    headline: "House painter in Kandy",
    summary:
      "Kumari paints bedrooms and other interior walls in Kandy. She has 6 years of experience with interior and exterior walls. She speaks Sinhala.",
    skills: ["bedroom painting", "interior walls"],
    years_experience: 6,
    area: "Kandy",
    languages: ["Sinhala"],
    raw_description: "I paint bedrooms and house walls in Kandy. 6 years. Sinhala.",
  },
  {
    name: "Rajan Krishnan",
    phone: "070-000-1003",
    trade: "mason",
    headline: "Mason in Jaffna",
    summary:
      "Rajan builds brick walls and does plastering in Jaffna. He has 12 years of experience on house work. He speaks Tamil and English.",
    skills: ["brickwork", "plastering"],
    years_experience: 12,
    area: "Jaffna",
    languages: ["Tamil", "English"],
    raw_description: "நான் யாழ்ப்பாணத்தில் 12 வருடம் கொத்தனார் வேலை செய்கிறேன். சுவர் கட்டுதல் மற்றும் பிளாஸ்டர்.",
  },
  {
    name: "Sunil Jayawardena",
    phone: "070-000-1004",
    trade: "electrician",
    headline: "House electrician in Galle",
    summary:
      "Sunil replaces old house wiring and installs fans in Galle. He has 10 years of experience and explains the safety checks. He speaks Sinhala and English.",
    skills: ["house wiring", "ceiling fans"],
    years_experience: 10,
    area: "Galle",
    languages: ["Sinhala", "English"],
    raw_description: "I do house wiring in Galle. Fans and safety checks. 10 years. Sinhala and English.",
  },
  {
    name: "Fathima Nazeer",
    phone: "070-000-1005",
    trade: "plumber",
    headline: "Plumber in Colombo",
    summary:
      "Fathima repairs leaks and fits bathroom pipes in Colombo. She has 7 years of experience. She speaks Tamil and English.",
    skills: ["leak repair", "bathroom pipes"],
    years_experience: 7,
    area: "Colombo",
    languages: ["Tamil", "English"],
    raw_description: "I fix leaks and bathroom pipes in Colombo. 7 years. Tamil and English.",
  },
  {
    name: "Chaminda Rathnayake",
    phone: "070-000-1006",
    trade: "carpenter",
    headline: "Carpenter in Negombo",
    summary:
      "Chaminda builds doors and wooden cupboards in Negombo. He has 15 years of experience with house woodwork. He speaks Sinhala.",
    skills: ["doors", "wooden cupboards"],
    years_experience: 15,
    area: "Negombo",
    languages: ["Sinhala"],
    raw_description: "මම මීගමුවේ දොරවල් සහ කබඩ් හදනවා. අවුරුදු 15යි.",
  },
  {
    name: "Priya Selvarajah",
    phone: "070-000-1007",
    trade: "painter",
    headline: "Wall painter in Kandy",
    summary: "Priya paints walls and applies putty in Kandy. She has 4 years of experience. She speaks Tamil.",
    skills: ["wall painting", "putty"],
    years_experience: 4,
    area: "Kandy",
    languages: ["Tamil"],
    raw_description: "நான் கண்டியில் சுவர் பெயிண்ட் மற்றும் புட்டி வேலை செய்கிறேன். 4 ஆண்டுகள்.",
  },
  {
    name: "Lasith Bandara",
    phone: "070-000-1008",
    trade: "electrician",
    headline: "Electrician in Galle",
    summary:
      "Lasith installs inverters and small solar setups in Galle. He has 9 years of experience. He speaks Sinhala and English.",
    skills: ["inverters", "solar setups"],
    years_experience: 9,
    area: "Galle",
    languages: ["Sinhala", "English"],
    raw_description: "I install inverters and solar setups in Galle. 9 years. Sinhala and English.",
  },
  {
    name: "Nuwan Dias",
    phone: "070-000-1009",
    trade: "plumber",
    headline: "Plumber in Galle",
    summary: "Nuwan fits water tanks and pipes in Galle. He has 5 years of experience. He speaks Sinhala.",
    skills: ["water tanks", "pipes"],
    years_experience: 5,
    area: "Galle",
    languages: ["Sinhala"],
    raw_description: "I fit water tanks and pipes in Galle. 5 years. Sinhala.",
  },
  {
    name: "Sanduni Herath",
    phone: "070-000-1010",
    trade: "tiler",
    headline: "Kitchen tiler in Colombo",
    summary: "Sanduni tiles kitchens in Colombo. She has 3 years of experience on smaller kitchen jobs. She speaks Sinhala and English.",
    skills: ["kitchen tiles"],
    years_experience: 3,
    area: "Colombo",
    languages: ["Sinhala", "English"],
    raw_description: "I tile kitchens in Colombo. 3 years. Sinhala and English.",
  },
];

function resetTables() {
  const db = getDb();
  db.exec(`
    DELETE FROM job_comments;
    DELETE FROM job_reactions;
    DELETE FROM requests;
    DELETE FROM reviews;
    DELETE FROM worker_photos;
    DELETE FROM jobs;
    DELETE FROM workers;
  `);
  try {
    db.exec("DELETE FROM sqlite_sequence");
  } catch {
    // The sequence table appears after the first autoincrement insert.
  }
}

function main() {
  resetTables();
  const saved = workers.map((worker) => createWorker(worker));
  const byName = Object.fromEntries(saved.map((worker) => [worker.name, worker.id]));

  const bathroom = createJob({
    customer_name: "Demo Customer Anu",
    raw_text: "I need a bathroom retiled in Colombo, about 6 by 8 feet, within 2 weeks.",
    trade: "tiler",
    area: "Colombo",
    size_estimate: "about 6 by 8 feet",
    timeframe: "within 2 weeks",
    summary: "Retile a bathroom in Colombo, about 6 by 8 feet, within 2 weeks.",
  });
  const bedrooms = createJob({
    customer_name: "Demo Customer Ravi",
    raw_text: "Please paint two bedrooms in Kandy this week.",
    trade: "painter",
    area: "Kandy",
    size_estimate: "two bedrooms",
    timeframe: "this week",
    summary: "Paint two bedrooms in Kandy this week.",
  });
  createJob({
    customer_name: "Demo Customer Meera",
    raw_text: "Replace the old house wiring in Galle. Three rooms. This month.",
    trade: "electrician",
    area: "Galle",
    size_estimate: "three rooms",
    timeframe: "this month",
    summary: "Replace old house wiring for three rooms in Galle this month.",
  });

  createRequest(bathroom.id, byName["Amal Fernando"]);

  insertReview(byName["Amal Fernando"], 5, "Demo review: the bathroom tiles were straight.", "Demo Neighbour Nadee");
  insertReview(byName["Kumari Silva"], 4, "Demo review: the bedroom paint looked neat.", "Demo Neighbour Bimal");
  insertReview(byName["Sunil Jayawardena"], 5, "Demo review: he explained the wiring clearly.", "Demo Neighbour Ayesha");
  insertReview(byName["Rajan Krishnan"], 5, "Demo review: the boundary wall is solid.", "Demo Neighbour Kabilan");
  insertReview(byName["Fathima Nazeer"], 4, "Demo review: the leak stopped the same day.", "Demo Neighbour Farhan");

  console.log(`Seeded ${saved.length} fictional workers, 3 jobs, 5 reviews, and 1 request.`);
  console.log(`Sample job ids: bathroom ${bathroom.id}, bedrooms ${bedrooms.id}.`);
}

main();
