// Fictional people used on the customer home and the desktop side rail.

export type SampleWorker = {
  id: string;
  name: string;
  trade: string;
  area: string;
  years: number;
  rating: number;
  about: string;
};

export const SAMPLE_WORKERS: SampleWorker[] = [
  {
    id: "kumari",
    name: "Kumari Silva",
    trade: "House cleaning",
    area: "Colombo",
    years: 6,
    rating: 4.8,
    about: "Weekly cleaning for houses and apartments. Floors, kitchens, and bathrooms.",
  },
  {
    id: "rajan",
    name: "Rajan Krishnan",
    trade: "Home cooking",
    area: "Kandy",
    years: 9,
    rating: 4.6,
    about: "Weekday rice and curry for families.",
  },
  {
    id: "sunil",
    name: "Sunil Jayawardena",
    trade: "Tiling",
    area: "Gampaha",
    years: 12,
    rating: 4.9,
    about: "Bathroom and floor tiling for homes.",
  },
  {
    id: "fathima",
    name: "Fathima Nazeer",
    trade: "Painting",
    area: "Colombo",
    years: 7,
    rating: 4.7,
    about: "Interior painting for rooms and small houses.",
  },
];
