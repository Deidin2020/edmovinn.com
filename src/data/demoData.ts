import type { Room, Accommodation } from "@/hooks/useSearchResults";
import type { FilterData } from "@/hooks/useFilterData";

export const demoFilterData: FilterData = {
  countries: [
    { id: 461, key: "turkey", name: "Turkey" },
    { id: 462, key: "cyprus", name: "Northern Cyprus" },
  ],
  StudyingField: [
    { id: 1, key: "engineering", name: "Engineering" },
    { id: 2, key: "medicine", name: "Medicine" },
    { id: 3, key: "business", name: "Business" },
  ],
  StudyingDegrees: [
    { id: 1, key: "bachelor", name: "Bachelor" },
    { id: 2, key: "master", name: "Master" },
    { id: 3, key: "phd", name: "PhD" },
  ],
  ProgramIntake: [
    { id: 1, key: "fall", name: "Fall" },
    { id: 2, key: "spring", name: "Spring" },
  ],
  UniversityName: [
    { id: 4, key: "istanbul-university", name: "Istanbul University" },
    { id: 5, key: "ankara-university", name: "Ankara University" },
    { id: 6, key: "cukurova-university", name: "Cukurova University" },
  ],
  languages: [
    { id: 1, key: "english", name: "English" },
    { id: 2, key: "turkish", name: "Turkish" },
  ],
};

type DemoRoom = Room & { countryId: number; universityId: number };
type DemoAcc = Accommodation & { countryId: number; universityId: number; minPrice: number };

const cities = [
  { city: "Istanbul", state: "Fatih", uni: 4, uniName: "Istanbul University" },
  { city: "Ankara", state: "Cankaya", uni: 5, uniName: "Ankara University" },
  { city: "Adana", state: "Saricam", uni: 6, uniName: "Cukurova University" },
];
const types = ["Single", "Double", "Triple"];
const genders = ["Male", "Female", "Mixed"];

export const demoRooms: DemoRoom[] = Array.from({ length: 18 }, (_, i) => {
  const c = cities[i % 3];
  const t = types[i % 3];
  return {
    id: i + 1,
    name: `${t} Room ${i + 1}`,
    slug: `room-${i + 1}`,
    image: "",
    price: 250 + (i % 6) * 75,
    description: `Comfortable ${t.toLowerCase()} room close to ${c.uniName}.`,
    city: c.city,
    state: c.state,
    capacity: (i % 3) + 1,
    room_type: t,
    gender: genders[i % 3],
    university_name: c.uniName,
    countryId: 461,
    universityId: c.uni,
  };
});

export const demoAccommodations: DemoAcc[] = Array.from({ length: 9 }, (_, i) => {
  const c = cities[i % 3];
  return {
    id: i + 1,
    name: `Student Accommodation ${i + 1}`,
    slug: `accommodation-${i + 1}`,
    image: "",
    state: c.state,
    city: c.city,
    description: `Modern student residence near ${c.uniName}.`,
    address: `${c.state}, ${c.city}`,
    rating: 4 + (i % 10) / 10,
    price_range: `$${250 + (i % 4) * 50} - $${600 + (i % 4) * 50}`,
    countryId: 461,
    universityId: c.uni,
    minPrice: 250 + (i % 4) * 50,
  };
});
