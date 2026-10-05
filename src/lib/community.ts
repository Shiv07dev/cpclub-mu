// "Consistency in Competitive Programming" — members who submitted their LeetCode streak badge
// and photo through the club's form. Streak level shown only where the submission states it.
import { communityPhoto as photo } from "@/lib/assets";

const raw: [name: string, slug: string, streak?: string][] = [
  ["Vidya Bharti Sinha", "vidya-bharti-sinha", "200"],
  ["Aryan Mahida", "aryan-mahida", "200"],
  ["Fenil Vadher", "fenil-vadher", "100"],
  ["Victoria V.K", "victoria-v-k", "100"],
  ["Harsh Doshi", "harsh-doshi", "100"],
  ["Jay Mangukiya", "jay-mangukiya", "100"],
  ["Mit Jayesh Solanki", "mit-jayesh-solanki", "100"],
  ["Niki Majithiya", "niki-majithiya", "100"],
  ["Tanvi Kakadiya", "tanvi-kakadiya", "100"],
  ["Milan Jani", "milan-jani", "100"],
  ["Umang Hirani", "umang-hirani", "100"],
  ["Aditya Raj", "aditya-raj", "200"],
  ["Krishna Dixit", "krishna-dixit", "100"],
  ["Gouri Unnithan", "gouri-unnithan", "100"],
  ["Naman Jain", "naman-jain", "50"],
  ["Mihir Mithani", "mihir-mithani", "100"],
  ["Payal Makwana", "payal-makwana", "200"],
  ["Ritesh Sanchala", "ritesh-sanchala", "100"],
  ["Ashutosh Kumar Singh", "ashutosh-kumar-singh", "100"],
  ["Bhavin Muchhala", "bhavin-muchhala", "100"],
  ["Rajvi Dave", "rajvi-dave", "50"],
  ["Kirtan Makwana", "kirtan-makwana", "100"],
  ["Kirti Shingala", "kirti-shingala", "100"],
  ["Dhruviben Patel", "dhruviben-patel", "100"],
  ["Disha Vadoliya", "disha-vadoliya", "100"],
  ["Nidhi Dattani", "nidhi-dattani", "200"],
  ["Shivani Ambati", "shivani-ambati", "100"],
  ["Umutoni Justine", "umutoni-justine", "50"],
  ["Shivam Bhatt", "shivam-bhatt", "100"],
  ["Krish Mamtora", "krish-mamtora", "100"],
  ["Harshil Domadiya", "harshil-domadiya", "100"],
  ["Harsh Trivedi", "harsh-trivedi", "100"],
  ["Ruhaan Pathan", "ruhaan-pathan", "50"],
  ["Vrajkumar Nandwana", "vrajkumar-nandwana", "100"],
];

export type StreakMember = { name: string; photo?: string | undefined; streak?: string | undefined };
export const CONSISTENCY: StreakMember[] = raw.map(([name, slug, streak]) => ({ name, photo: photo(slug), streak }));
export const CONSISTENCY_ABOUT =
  "Consistency in Competitive Programming recognises CP Club members who kept a daily problem-solving streak on LeetCode and shared their streak badge with the club.";
