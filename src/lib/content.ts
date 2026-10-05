// Static club content sourced from the CP Club presentation and Core Committee poster.
// Dynamic data (events, registrations, monthly contest) lives behind src/lib/api.
import { assets } from "@/lib/assets";

export const LOGO_URL = assets.logo;
export const COLLAB_IMG = assets.achievements.collab;
export const INSTAGRAM = { handle: "@CPCLUB_MU", url: "https://www.instagram.com/cpclub_mu/" };

export const CLUB = {
  name: "Competitive Programming Club",
  short: "CP Club",
  department: "Department of Information and Communication Technology",
  university: "Marwadi University",
  tagline:
    "Empowering students with strong problem-solving, algorithmic, and coding skills to excel in technical interviews, global competitions, and real-world computational challenges.",
  slogan: "Same Passion, Bigger Possibilities",
  vision:
    "To empower students with strong problem-solving, algorithmic, and coding skills, enabling them to excel in competitive programming, technical interviews, and real world computational challenges.",
  mission: [
    "To develop students' ability to approach problems analytically through algorithmic and project-based learning.",
    "To provide structured learning paths, coding challenges, and assessments to enhance programming proficiency.",
    "To offer exposure to data structures, algorithms, competitive coding platforms, and real-world applications, helping students discover their interests.",
    "To engage with industry professionals, competitive programmers, and alumni to guide students toward placements, internships, and global coding competitions.",
  ],
  membershipFee: "Rs. 100 / year",
};

export const MENTOR = {
  name: "Prof. Nishith Kotak",
  role: "Faculty Mentor",
  dept: "Department of ICT",
  photo: assets.committee.mentor,
};

export type Member = { name: string; role: string; photo: string; badge: string; lead?: boolean };
export const COMMITTEE: Member[] = [
  { name: "Shivkumar Paun", role: "Convener", badge: "Student Lead", photo: assets.committee.shivkumar, lead: true },
  { name: "Heer Mehta", role: "Dy. Convener", badge: "Leadership", photo: assets.committee.heer },
  { name: "Keshvi Santoki", role: "General Secretary", badge: "Operations", photo: assets.committee.keshvi },
  { name: "Tejas Vadgama", role: "Event Coordinator", badge: "Events", photo: assets.committee.tejas },
  { name: "Rishi Bhuva", role: "Tech Lead", badge: "Technology", photo: assets.committee.rishi },
  { name: "Shweta Sanathara", role: "Content Manager", badge: "Content", photo: assets.committee.shweta },
];

// Pseudo-Core committee (from the official Pseudo-Core poster).
export const PSEUDO_COMMITTEE: Member[] = [
  { name: "Darshit Kacha", role: "Convener", badge: "Pseudo-Core", photo: assets.pseudo.darshit },
  { name: "Hit Depani", role: "Dy. Convener", badge: "Pseudo-Core", photo: assets.pseudo.hit },
  { name: "Yesha Joshi", role: "Member", badge: "Pseudo-Core", photo: assets.pseudo.yesha },
  { name: "Soham Vora", role: "Member", badge: "Pseudo-Core", photo: assets.pseudo.soham },
];

export const INTRO_STEPS = [
  { k: "Who we are", body: "The official coding and algorithmic community of the ICT Department, Marwadi University." },
  { k: "Our vision", body: CLUB.vision },
  {
    k: "Our mission",
    list: [
      "Algorithmic and project-based learning",
      "Structured learning paths and coding assessments",
      "Deep exposure to DSA, platforms, and real-world applications",
      "Industry, alumni, and competitive programmer interaction",
    ],
  },
  { k: "What we do", body: "Workshops, hackathons, coding relays, debugging challenges, peer mentoring, and interview preparation." },
  { k: "Learning & coding", body: "Consistent practice through curated daily problems shared with the CP Club community." },
  { k: "Industry / alumni exposure", body: "Expert talks, placement guidance, and competitive programming strategy sessions." },
  { k: "Competitive programming", body: "Preparing students for ICPC, Codeforces, LeetCode, HackerRank, and national hackathons." },
] as { k: string; body?: string; list?: string[] }[];

export const SKILLS = [
  { name: "C, C++", code: "</>", path: ["Syntax & pointers", "STL", "Fast I/O"], why: "The default language of contest programming — speed and STL make it the go-to for Codeforces and ICPC." },
  { name: "Java Programming", code: "{ }", path: ["OOP basics", "Collections", "Problem solving"], why: "Widely used in technical interviews and placement coding rounds." },
  { name: "Data Structures", code: "[ ]", path: ["Arrays & strings", "Stacks, queues, trees", "Graphs & heaps"], why: "The backbone of every interview question and contest problem." },
  { name: "Algorithms", code: "f(n)", path: ["Sorting & searching", "Greedy & recursion", "Dynamic programming"], why: "Turning a problem statement into a correct, provable solution." },
  { name: "Algorithmic Optimization", code: "O(1)", path: ["Complexity analysis", "Paradigms", "Optimizing under limits"], why: "Passing time limits — the difference between Accepted and TLE." },
  { name: "Git and GitHub", code: "git", path: ["Commits & branches", "Pull requests", "Open source"], why: "Version control every team and recruiter expects you to know." },
];

export const PLATFORMS = [
  { name: "HackerRank", use: "DSA Practice Sessions run on HackerRank." },
  { name: "LeetCode", use: "Members track streaks — badges celebrated on the Achiever's Wall." },
  { name: "Codeforces", use: "Contest practice for rated competitive programming." },
  { name: "CodeChef", use: "Contest practice and long challenges." },
  { name: "GitHub", use: "Introduction to Git and GitHub sessions every year." },
  { name: "Unity", use: "Unity Workshop and Unity Workshop 2.0." },
  { name: "Scratch", use: "STEM activity over Scratch programming." },
];

export type Achievement = { title: string; year?: string; body: string; photo: string; tag: string };
export const ACHIEVEMENTS: Achievement[] = [
  { title: "Hackentine Hackathon by Coding Ninjas 10x Club", year: "2025", tag: "1st Prize · National", body: "Ritesh Sanchala, Aryan Langhanoja and Abhay Nathwani won the 1st prize in the national level hackathon \"Hackentine\" organized by Coding Ninjas.", photo: assets.achievements.hackentine },
  { title: "TCS CodeVita", tag: "Top 1000 · International", body: "Kaushal Parmar and Mustafa Bharmal made it into the top 1000 coders in TCS CodeVita, an international coding contest organized by TCS.", photo: assets.achievements.codevita },
  { title: "IEEE Sampark 2025", year: "2025", tag: "1st Prize · Datathon", body: "Ruhaan Pathan, Devarsh Bhatt and Rudra Miyani won the 1st prize in the \"Datathon\" organized by SCET during the IEEE flagship – Sampark 2025.", photo: assets.achievements.sampark },
  { title: "Azadi ka Amrit Mahotsav Hackathon", year: "2022", tag: "3rd Prize · State", body: "Darshan Padia and team secured 3rd prize in a state level hackathon.", photo: assets.achievements.amrit3 },
  { title: "Azadi ka Amrit Mahotsav Hackathon", year: "2022", tag: "2nd Prize · State", body: "Abhay Nathwani and team won the 2nd prize in a state level hackathon.", photo: assets.achievements.amrit2 },
  { title: "IEEE Matlab Hackathon by IEEE Gujarat Section", year: "2025", tag: "2nd Runner-up", body: "Devarsh Bhatt, Heer Mehta and Akshat Shah were declared 2nd runner-ups at the \"IEEE Matlab\" Hackathon organized by IEEE Gujarat Section at PDEU.", photo: assets.achievements.matlab },
  { title: "Hackduino by Arduino", year: "2025", tag: "1st Prize", body: "Kaushal Parmar and Abhay Nathwani won the 1st prize in Hackduino 2025, an official hackathon organized by Arduino.", photo: assets.achievements.hackduino },
  { title: "NewGen IEDC Scheme", tag: "Rs. 2 Lakh Grant", body: "Darshan Padia was awarded Rs. 2 Lakh under the NewGen IEDC Scheme for the project \"ARICA – AI Powered assistant for your customised dataset\".", photo: assets.achievements.iedc },
  { title: "MITACS Internship", tag: "Research · Canada", body: "Darshan Padia secured a fully funded research internship under the guidance of Prof. Rita Orji at Dalhousie University, Canada under the MITACS Internship programme.", photo: assets.achievements.mitacs },
  { title: "Logic Leap Race", tag: "1st Place", body: "Vivek Chavda and his team secured 1st place in the Logic Leap Race with an e-commerce website that provides real-time data using a Flask API.", photo: assets.achievements.logicLeap },
  { title: "IEEE Mindroid", tag: "Publication", body: "Heer Mehta got her article \"TCL RayNeo X2: A Technological Marvel in augmented reality\" published in IEEE Mindroid.", photo: assets.achievements.mindroid },
  { title: "LeetCode 365 Days", year: "2024", tag: "Badge", body: "Aryan Langhanoja achieved the 365 days of coding badge on LeetCode for the year 2024.", photo: assets.achievements.leetcode365 },
];

export const PLACEMENTS = [
  { name: "Akshat Kakkad", company: "rtCamp", pkg: "12 LPA" },
  { name: "Hitkumar Bhalodiya", company: "rtCamp", pkg: "12 LPA" },
  { name: "Bhavik Kalpesh", company: "rtCamp", pkg: "12 LPA" },
  { name: "Rutvik Savsani", company: "rtCamp", pkg: "12 LPA" },
  { name: "Renish Surani", company: "rtCamp", pkg: "12 LPA" },
  { name: "Mustafa Bharmal", company: "rtCamp", pkg: "12 LPA" },
  { name: "Dev Mehta", company: "rtCamp", pkg: "12 LPA" },
  { name: "Karan Rajpara", company: "Astound Digital", pkg: "11 LPA" },
  { name: "Belvinraja Nadar", company: "Fintech Global Center", pkg: "10 LPA" },
  { name: "Darshan Padia", company: "Fintech Global Center", pkg: "10 LPA" },
  { name: "Abhay Nathwani", company: "Fintech Global Center", pkg: "10-15 LPA" },
  { name: "Kaushal Faldu", company: "Cresen Solutions", pkg: "6.5 LPA" },
  { name: "Mandeep Dangar", company: "Indexnine", pkg: "6 LPA" },
  { name: "Aryan Langhanoja", company: "Ace Analytics", pkg: "5.1 LPA" },
];

export const GATE = [
  { name: "Mustafa Bharmal", exam: "GATE 2024", paper: "Data Science and AI" },
  { name: "Mustafa Bharmal", exam: "GATE 2025", paper: "Computer Science" },
  { name: "Hitkumar Bhalodiya", exam: "GATE 2024", paper: "Computer Science and IT" },
  { name: "Hasti Hajipara", exam: "GATE 2025", paper: "Computer Science" },
  { name: "Rutik Parmar", exam: "GATE 2025", paper: "Computer Science" },
];

export const CODER_OF_MONTH = {
  about:
    "Coder of the Month is an initiative the Competitive Programming Club started to reward those who actively participate in club events and solve the daily questions uploaded on the CP Club community.",
  metric: { value: "30%", label: "Increase of students participation in the club" },
  winners: [
    "Twisha Gel", "Vivek Chavda", "Keval Bhotera", "Aryan Langhanoja", "Hitesh Jethwa", "Ritesh Sanchala", "Kaushal Parmar",
  ],
  period: "October 2020 to February 2021",
  criteria: ["Consistency", "Problem difficulty", "Contest rating", "Community help"],
};

export const MONTHLY_CONTEST = {
  title: "Monthly Coding Contest",
  slogan: "Code. Compete. Improve.",
  about:
    "A monthly coding challenge designed to build consistency, strengthen problem-solving skills, and give students a platform to compete, learn and improve.",
  short: "A new monthly coding challenge by the Competitive Programming Club.",
};

export const TENX = {
  body: "The Competitive Programming Club collaborated with Coding Ninjas and formed a committee called \"10X Club – Marwadi University Chapter\" where we do expert talks, competitions and more.",
  team: [
    { name: "Abhay", role: "10X CEO · Campus Executive Officer" },
    { name: "Yash", role: "10X CMO · Campus Marketing Officer" },
    { name: "Umang", role: "10X CTO · Campus Technology Officer" },
    { name: "Nandini", role: "10X COO · Campus Outreach Officer" },
    { name: "Raheelkhan", role: "10X CCO · Campus Creative Officer" },
  ],
};
