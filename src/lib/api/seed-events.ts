import type { ClubEvent, EventCategory, EventMode } from "./types";
import { photosFor } from "../event-photos";

// Report-backed events: every date, venue, attendance figure, overview point and outcome
// below is taken from the club's formal event reports / CP Club Event List sheet.
type R = {
  r: string; title: string; date: string; cat: EventCategory; mode?: EventMode; venue?: string;
  participants?: number; audience?: string; description: string; overview: string[]; outcomes: string[];
};

const reports: R[] = [
  { r: "r4", title: "E- Long Hour Coding Session", date: "2022-11-01", cat: "Competition", mode: "Online", participants: 74, audience: "Students across different semesters",
    description: "An online session where students attempted and solved competitive coding questions to sharpen problem-solving, logical thinking and coding efficiency.",
    overview: ["Introduction to competitive programming and its significance", "Online competitive coding questions of varying difficulty", "Guidance on problem-solving approaches and efficient algorithms", "Live problem-solving demonstrations", "Individual attempts with feedback on solutions", "Doubts addressed by mentors"],
    outcomes: ["Enhanced problem-solving skills", "Improved algorithmic thinking", "Real-time coding practice for speed and accuracy", "Familiarity with competitive coding platforms"] },
  { r: "r6", title: "Introduction to C Programming", date: "2022-11-06", cat: "Workshop", mode: "Online", participants: 62,
    description: "An online session introducing the fundamentals of C programming — concepts and syntax essential for beginners.",
    overview: ["Introduction to programming and the significance of C", "Basic syntax, variables and data types", "Loops and conditional statements", "Functions and modular programming", "Live coding demonstrations", "Interactive Q&A"],
    outcomes: ["Introductory understanding of C programming", "Hands-on learning through live demonstrations", "Basic programming logic and structured coding", "Groundwork for advanced concepts"] },
  { r: "r3", title: "Competitive Coding Guidance", date: "2022-12-29", cat: "Technical Talk", mode: "Offline", venue: "MA106", participants: 25,
    description: "A session equipping students with the problem-solving skills and strategies required for competitive coding.",
    overview: ["Competitive programming and its significance", "Commonly used data structures and algorithms", "Problem-solving techniques and optimisation strategies", "Hands-on practice with competitive programming problems", "Participating in online contests and improving speed", "Interactive Q&A"],
    outcomes: ["Clear understanding of key competitive coding concepts", "Exposure to efficient problem-solving techniques", "Hands-on coding practice", "Preparation for coding contests"] },
  { r: "r5", title: "Expert Talk on Google Summer of Code", date: "2023-01-13", cat: "Technical Talk", mode: "Offline", venue: "MA115", participants: 13,
    description: "Insights into the GSoC programme, its application process, and how students can contribute to open-source projects — delivered by a speaker with GSoC experience.",
    overview: ["Introduction to GSoC and its objectives", "Eligibility criteria and application process", "Selecting organisations and writing a strong proposal", "Benefits and career opportunities", "Experiences from previous GSoC contributors", "Interactive Q&A"],
    outcomes: ["Comprehensive understanding of GSoC", "Stronger application strategies", "Motivation to explore open source", "First-hand advice from an experienced speaker"] },
  { r: "r2", title: "Coding Task on MVC Architecture", date: "2023-01-13", cat: "Hands-on Lab", mode: "Offline", venue: "MA115", participants: 13,
    description: "Hands-on experience implementing the Model-View-Controller design pattern through practical coding exercises.",
    overview: ["Introduction to MVC and its importance", "Roles of Model, View and Controller", "Hands-on coding exercises implementing MVC", "Debugging and optimising MVC-based applications", "Best practices and real-world applications", "Interactive Q&A"],
    outcomes: ["Solid understanding of MVC principles", "Practical implementation skills", "Debugging and optimisation with MVC", "Confidence applying MVC to projects"] },
  { r: "r1", title: "CodeCrack Challenge 1.0", date: "2023-03-24", cat: "Competition", mode: "Offline", venue: "MA107", participants: 19,
    description: "The first edition of the CodeCrack Challenge coding competition by the CP Club.",
    overview: [], outcomes: [] },
  { r: "r10", title: "Introduction to Linux and Ubuntu", date: "2023-08-05", cat: "Hands-on Lab", mode: "Offline", venue: "MB314", participants: 67, audience: "Diploma students",
    description: "Introduced students to Linux and OS basics, with a step-by-step Ubuntu installation in VirtualBox and command-line fundamentals.",
    overview: ["Linux, Ubuntu, kernel — Windows vs Linux, kernel vs OS", "Installing Ubuntu in VirtualBox step by step", "Basics of Ubuntu", "CLI basics including bash commands", "Doubt solving"],
    outcomes: ["Hands-on Linux and VirtualBox setup", "Command line proficiency", "Community and open-source awareness"] },
  { r: "r13", title: "STEM Training over Programming using Scratch (Shakti School)", date: "2023-08-28", cat: "Fun & Creative", mode: "Offline", venue: "MA115", participants: 120, audience: "Standard 9 & 10 students, Shakti School",
    description: "A roughly 4-hour hands-on introduction to game development with the Scratch offline editor for school students.",
    overview: ["Introduction to CP Club", "Introduction to Scratch", "Hands-on implementation of game movement logic", "Session conclusion"],
    outcomes: ["Active engagement in discussions and hands-on work", "Exploration of new domains", "Insight into the world of game development"] },
  { r: "r12", title: "STEM Training over Programming using Scratch (Nirmala Convent)", date: "2023-08-28", cat: "Fun & Creative", mode: "Offline", venue: "MA115", participants: 90, audience: "Standard 9 & 10 students, Nirmala School",
    description: "A roughly 4-hour hands-on Scratch session plus a quiz, with gifts for the top quiz performers.",
    overview: ["Introduction to CP Club", "Introduction to Scratch", "Hands-on implementation of game movement logic", "Quiz", "Session conclusion"],
    outcomes: ["Enhanced creativity and thinking", "Insight into game development", "Top quiz performers rewarded"] },
  { r: "r9", title: "Git & GitHub", date: "2024-01-06", cat: "Hands-on Lab", mode: "Offline", venue: "MA115", participants: 29, audience: "Club prime members",
    description: "Introduced club members to version control with Git and collaboration on GitHub, including local installation and setup.",
    overview: ["Introduction to Git and GitHub", "Git basics — commands, branches, merges, conflict resolution", "GitHub — repositories, pull requests, issues", "Repository structure, commit history, best practices", "Git installation and setup", "Doubt solving"],
    outcomes: ["Git and GitHub mastery", "Streamlined collaboration with branches and merges", "Successful Git setup on various platforms"] },
  { r: "r7", title: "CodeQuest: Troubleshooting Tigers", date: "2024-03-14", cat: "Competition", mode: "Offline", venue: "MA115", participants: 31, audience: "Students from different departments and semesters · MU Fest 2024",
    description: "A solo two-round troubleshooting contest at MU Fest 2024 — debug code on paper, then tackle interview-style case studies.",
    overview: ["Round 1 (10 AM): troubleshoot given code on paper and mark the fix", "Selected participants move to Round 2", "Round 2 (1 PM – 4 PM): case studies similar to company coding interviews", "Languages: C, C++, Java, Python"],
    outcomes: ["High participation from varied backgrounds", "Skill demonstration across languages", "Experience in problem solving under pressure"] },
  { r: "r8", title: "Coding Relay Race", date: "2024-03-14", cat: "Competition", mode: "Offline", venue: "MA102", participants: 41, audience: "Programming enthusiasts · MU Fest 2024",
    description: "A group event at MU Fest 2024: solve a programming problem, flip a bottle, pass the turn to your teammate.",
    overview: ["Round 1: 14-03-2024, 12 PM – 2 PM", "Round 2: 15-03-2024, 9:30 AM – 11:30 AM", "Solve a problem → flip a bottle → pass the turn", "Languages: C, C++, Java, Python"],
    outcomes: ["High participation", "Skill demonstration in multiple languages", "Teamwork and collaboration", "Fun and engagement", "Time management under pressure"] },
  { r: "r11", title: "Java and OOPs from Scratch", date: "2024-04-10", cat: "Workshop", mode: "Offline", venue: "MA106", participants: 65, audience: "Degree Semester 2 students",
    description: "A strong foundation in Java programming and OOP, built up step by step with coding exercises.",
    overview: ["Java fundamentals and syntax", "Core OOP concepts", "Interactive learning with coding exercises"],
    outcomes: ["Foundational knowledge of Java", "Hands-on grasp of encapsulation, inheritance and polymorphism", "Stepping stone to Java development", "Collaborative learning"] },
  { r: "r16", title: "Problem Solving Using C++", date: "2024-07-27", cat: "Hands-on Lab", mode: "Offline", venue: "MA115 & MA112", participants: 60, audience: "Semester 3 students",
    description: "Strengthened C++ basics and problem solving on LeetCode and HackerRank.",
    overview: ["Introduction to CP Club", "Foundational C++ concepts", "Hands-on problem solving on LeetCode and HackerRank", "Relating it to real-life scenarios", "Session conclusion"],
    outcomes: ["Better grasp of C++ fundamentals", "Confidence on competitive programming platforms", "Collaborative learning", "Foundation for further specialisation"] },
  { r: "r15", title: "Git & GitHub", date: "2024-09-28", cat: "Hands-on Lab", mode: "Offline", venue: "MA115", participants: 35, audience: "Open to students from all streams",
    description: "Practical insights and hands-on experience with version control and collaborative development, open to all streams.",
    overview: ["Introduction to Git and GitHub", "Git installation and setup", "Git basics — commands, branches, merges, conflict resolution", "GitHub — repositories, pull requests, issues", "Repository structure, commit history, best practices", "Doubt solving"],
    outcomes: ["Git and GitHub mastery", "Streamlined collaboration", "Successful Git setup on various platforms"] },
  { r: "r14", title: "Creating Custom Library and Header File in C", date: "2025-01-16", cat: "Workshop", mode: "Offline", venue: "MA102", participants: 49, audience: "Degree Semester 2 students",
    description: "Introduced students to creating their own custom libraries and header files in C, with volunteers helping every participant set up the compiler.",
    overview: ["Introduction to libraries and header files", "Need and benefits in C", "Library vs header file", "Making a custom header file", "Creating a custom library", "Practice tasks and doubt solving"],
    outcomes: ["Grip over functions in C", "Knowledge of header files and libraries", "Created custom header files"] },
  { r: "r17", title: "Unity Workshop", date: "2025-02-01", cat: "Hands-on Lab", mode: "Offline", venue: "MA115", participants: 26,
    description: "An introduction to Unity and game development where every participant built their own version of Flappy Bird.",
    overview: ["Installation guide for Unity Hub, Unity Engine and Visual Studio", "Creating a project and the Unity Engine layout", "Importing assets and writing C# for character movement", "Building their own Flappy Bird"],
    outcomes: ["Hands-on game development with Unity and C#", "Unity Hub and Engine proficiency", "Asset import and usage", "C# scripting basics", "Completed a mini-game"] },
];

// Events listed in the club presentation that have no report in the supplied material.
type Seed = [title: string, year: number, cat: EventCategory, desc: string];
const pptOnly: Seed[] = [
  ["Fundamentals of programming", 2023, "Workshop", "Core programming concepts for students starting their coding journey."],
  ["Code Tracing and Debugging", 2023, "Workshop", "Reading code line by line and finding bugs systematically."],
  ["Different types of coding and optimization-algorithm paradigms", 2023, "Technical Talk", "An overview of algorithm paradigms and how to optimize solutions."],
  ["How to build Chrome Extensions", 2023, "Hands-on Lab", "Building and loading a browser extension for Chrome."],
  ["Solving data structure problems", 2023, "Workshop", "Practising problems on core data structures."],
  ["How to create backend restful APIs.", 2023, "Technical Talk", "Designing and building RESTful backend APIs."],
  ["Portfolio Designing", 2024, "Workshop", "Designing a personal developer portfolio."],
  ["DSA Practice Session - Hackerrank", 2024, "Hands-on Lab", "Guided data structures and algorithms practice on HackerRank."],
  ["Expert talk on Full Stack", 2025, "Technical Talk", "An expert talk on full stack programming."],
  ["10X Code Clash", 2025, "Competition", "A coding competition under the 10X Club – Marwadi University Chapter."],
  ["Unity Workshop 2.0", 2025, "Hands-on Lab", "A follow-up Unity workshop building on the first session."],
  ["Meme making competition", 2025, "Fun & Creative", "A light-hearted creative competition for the coding community."],
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const fromReports: ClubEvent[] = reports.map((x) => ({
  id: x.r,
  slug: `${slugify(x.title)}-${x.date.slice(0, 4)}`,
  title: x.title,
  year: Number(x.date.slice(0, 4)),
  date: x.date,
  category: x.cat,
  mode: x.mode,
  venue: x.venue,
  participants: x.participants,
  audience: x.audience,
  description: x.description,
  overview: x.overview,
  outcomes: x.outcomes,
  takeaways: x.outcomes,
  photos: photosFor(x.r),
  speaker: "Competitive Programming Club, ICT Department",
  upcoming: false,
  registrationOpen: false,
  reportBacked: true,
}));

const fromPpt: ClubEvent[] = pptOnly.map(([title, year, category, description], i) => ({
  id: `p${i + 1}`,
  slug: `${slugify(title)}-${year}`,
  title,
  year,
  category,
  description,
  takeaways: [],
  speaker: "Competitive Programming Club, ICT Department",
  upcoming: false,
  registrationOpen: false,
}));

export const SEED_EVENTS: ClubEvent[] = [...fromReports].reverse().concat(fromPpt);

/** Academic year label (Jul–Jun), e.g. 2023-24. */
export const academicYear = (iso?: string) => {
  if (!iso) return undefined;
  const d = new Date(iso);
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
};
