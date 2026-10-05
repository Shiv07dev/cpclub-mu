/**
 * Seed script for CP Club, Marwadi University.
 * Database: MySQL via XAMPP (cp_club)
 * Uses ONLY official club-provided data — no invented records.
 *
 * Run: npm run db:seed
 */

import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toJson(arr: string[]): string {
  return JSON.stringify(arr ?? []);
}

function mapCat(cat: string) {
  const m: Record<string, string> = {
    Competition: "Competition",
    Workshop: "Workshop",
    "Technical Talk": "TechnicalTalk",
    "Hands-on Lab": "HandsOnLab",
    "Fun & Creative": "FunAndCreative",
  };
  return (m[cat] ?? "Workshop") as
    | "Competition"
    | "Workshop"
    | "TechnicalTalk"
    | "HandsOnLab"
    | "FunAndCreative";
}

// ─── 1. Super Admin ───────────────────────────────────────────────────────────

async function seedAdmin() {
  const email = process.env["SEED_ADMIN_EMAIL"] ?? "admin@cpclub.mu.ac.in";
  const password = process.env["SEED_ADMIN_PASSWORD"] ?? "ChangeMe@2024!";
  const name = process.env["SEED_ADMIN_NAME"] ?? "CP Club Admin";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.create({
    data: { email, name, passwordHash, role: AdminRole.SUPER_ADMIN },
  });
  console.log(`✅ Created SUPER_ADMIN: ${email}`);
  console.log(`   ⚠️  Change this password immediately after first login!`);
}

// ─── 2. Site Settings ─────────────────────────────────────────────────────────

async function seedSiteSettings() {
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      clubName: "Competitive Programming Club",
      department: "Department of Information and Communication Technology",
      university: "Marwadi University",
      tagline:
        "Empowering students with strong problem-solving, algorithmic, and coding skills to excel in technical interviews, global competitions, and real-world computational challenges.",
      slogan: "Same Passion, Bigger Possibilities",
      instagramHandle: "@CPCLUB_MU",
      instagramUrl: "https://www.instagram.com/cpclub_mu/",
      announcement: "Follow @CPCLUB_MU on Instagram for the next event announcement.",
      heroTagline: "",
    },
    update: {},
  });
  console.log("✅ Site settings seeded");
}

// ─── 3. Committee ─────────────────────────────────────────────────────────────

async function seedCommittee() {
  const count = await prisma.committeeMember.count();
  if (count > 0) {
    console.log("Committee already seeded, skipping.");
    return;
  }

  const members = [
    {
      name: "Prof. Nishith Kotak",
      role: "Faculty Mentor",
      badge: "Faculty",
      isMentor: true,
      displayOrder: 0,
      photoUrl: "/assets/committee/prof-nishith-kotak.webp",
    },
    {
      name: "Shivkumar Paun",
      role: "Convener",
      badge: "Student Lead",
      displayOrder: 1,
      photoUrl: "/assets/committee/shivkumar-paun.webp",
    },
    {
      name: "Heer Mehta",
      role: "Dy. Convener",
      badge: "Leadership",
      displayOrder: 2,
      photoUrl: "/assets/committee/heer-mehta.webp",
    },
    {
      name: "Keshvi Santoki",
      role: "General Secretary",
      badge: "Operations",
      displayOrder: 3,
      photoUrl: "/assets/committee/keshvi-santoki.webp",
    },
    {
      name: "Tejas Vadgama",
      role: "Event Coordinator",
      badge: "Events",
      displayOrder: 4,
      photoUrl: "/assets/committee/tejas-vadgama.webp",
    },
    {
      name: "Rishi Bhuva",
      role: "Tech Lead",
      badge: "Technology",
      displayOrder: 5,
      photoUrl: "/assets/committee/rishi-bhuva.webp",
    },
    {
      name: "Shweta Sanathara",
      role: "Content Manager",
      badge: "Content",
      displayOrder: 6,
      photoUrl: "/assets/committee/shweta-sanathara.webp",
    },
    {
      name: "Darshit Kacha",
      role: "Convener",
      badge: "Pseudo-Core",
      isPseudoCore: true,
      displayOrder: 7,
      photoUrl: "/assets/committee/darshit-kacha.webp",
    },
    {
      name: "Hit Depani",
      role: "Dy. Convener",
      badge: "Pseudo-Core",
      isPseudoCore: true,
      displayOrder: 8,
      photoUrl: "/assets/committee/hit-depani.webp",
    },
    {
      name: "Yesha Joshi",
      role: "Member",
      badge: "Pseudo-Core",
      isPseudoCore: true,
      displayOrder: 9,
      photoUrl: "/assets/committee/yesha-joshi.webp",
    },
    {
      name: "Soham Vora",
      role: "Member",
      badge: "Pseudo-Core",
      isPseudoCore: true,
      displayOrder: 10,
      photoUrl: "/assets/committee/soham-vora.webp",
    },
  ];

  await prisma.committeeMember.createMany({ data: members });
  console.log(`✅ Committee seeded: ${members.length} members`);
}

// ─── 4. Historical Events ─────────────────────────────────────────────────────

async function seedEvents() {
  const count = await prisma.event.count();
  if (count > 0) {
    console.log("Events already seeded, skipping.");
    return;
  }

  type Report = {
    title: string;
    date: string;
    cat: string;
    mode?: string;
    venue?: string;
    participants?: number;
    audience?: string;
    description: string;
    overview: string[];
    outcomes: string[];
  };

  const reports: Report[] = [
    {
      title: "E-Long Hour Coding Session",
      date: "2022-11-01",
      cat: "Competition",
      mode: "Online",
      participants: 74,
      audience: "Students across different semesters",
      description:
        "An online session where students attempted and solved competitive coding questions to sharpen problem-solving, logical thinking and coding efficiency.",
      overview: [
        "Introduction to competitive programming and its significance",
        "Online competitive coding questions of varying difficulty",
        "Guidance on problem-solving approaches and efficient algorithms",
        "Live problem-solving demonstrations",
        "Individual attempts with feedback on solutions",
        "Doubts addressed by mentors",
      ],
      outcomes: [
        "Enhanced problem-solving skills",
        "Improved algorithmic thinking",
        "Real-time coding practice for speed and accuracy",
        "Familiarity with competitive coding platforms",
      ],
    },
    {
      title: "Introduction to C Programming",
      date: "2022-11-06",
      cat: "Workshop",
      mode: "Online",
      participants: 62,
      description:
        "An online session introducing the fundamentals of C programming — concepts and syntax essential for beginners.",
      overview: [
        "Introduction to programming and the significance of C",
        "Basic syntax, variables and data types",
        "Loops and conditional statements",
        "Functions and modular programming",
        "Live coding demonstrations",
        "Interactive Q&A",
      ],
      outcomes: [
        "Introductory understanding of C programming",
        "Hands-on learning through live demonstrations",
        "Basic programming logic and structured coding",
        "Groundwork for advanced concepts",
      ],
    },
    {
      title: "Competitive Coding Guidance",
      date: "2022-12-29",
      cat: "Technical Talk",
      mode: "Offline",
      venue: "MA106",
      participants: 25,
      description:
        "A session equipping students with the problem-solving skills and strategies required for competitive coding.",
      overview: [
        "Competitive programming and its significance",
        "Commonly used data structures and algorithms",
        "Problem-solving techniques and optimisation strategies",
        "Hands-on practice with competitive programming problems",
        "Participating in online contests and improving speed",
        "Interactive Q&A",
      ],
      outcomes: [
        "Clear understanding of key competitive coding concepts",
        "Exposure to efficient problem-solving techniques",
        "Hands-on coding practice",
        "Preparation for coding contests",
      ],
    },
    {
      title: "Expert Talk on Google Summer of Code",
      date: "2023-01-13",
      cat: "Technical Talk",
      mode: "Offline",
      venue: "MA115",
      participants: 13,
      description:
        "Insights into the GSoC programme, its application process, and how students can contribute to open-source projects — delivered by a speaker with GSoC experience.",
      overview: [
        "Introduction to GSoC and its objectives",
        "Eligibility criteria and application process",
        "Selecting organisations and writing a strong proposal",
        "Benefits and career opportunities",
        "Experiences from previous GSoC contributors",
        "Interactive Q&A",
      ],
      outcomes: [
        "Comprehensive understanding of GSoC",
        "Stronger application strategies",
        "Motivation to explore open source",
        "First-hand advice from an experienced speaker",
      ],
    },
    {
      title: "Coding Task on MVC Architecture",
      date: "2023-01-13",
      cat: "Hands-on Lab",
      mode: "Offline",
      venue: "MA115",
      participants: 13,
      description:
        "Hands-on experience implementing the Model-View-Controller design pattern through practical coding exercises.",
      overview: [
        "Introduction to MVC and its importance",
        "Roles of Model, View and Controller",
        "Hands-on coding exercises implementing MVC",
        "Debugging and optimising MVC-based applications",
        "Best practices and real-world applications",
        "Interactive Q&A",
      ],
      outcomes: [
        "Solid understanding of MVC principles",
        "Practical implementation skills",
        "Debugging and optimisation with MVC",
        "Confidence applying MVC to projects",
      ],
    },
    {
      title: "CodeCrack Challenge 1.0",
      date: "2023-03-24",
      cat: "Competition",
      mode: "Offline",
      venue: "MA107",
      participants: 19,
      description: "The first edition of the CodeCrack Challenge coding competition by the CP Club.",
      overview: [],
      outcomes: [],
    },
    {
      title: "Introduction to Linux and Ubuntu",
      date: "2023-08-05",
      cat: "Hands-on Lab",
      mode: "Offline",
      venue: "MB314",
      participants: 67,
      audience: "Diploma students",
      description:
        "Introduced students to Linux and OS basics, with a step-by-step Ubuntu installation in VirtualBox and command-line fundamentals.",
      overview: [
        "Linux, Ubuntu, kernel — Windows vs Linux, kernel vs OS",
        "Installing Ubuntu in VirtualBox step by step",
        "Basics of Ubuntu",
        "CLI basics including bash commands",
        "Doubt solving",
      ],
      outcomes: [
        "Hands-on Linux and VirtualBox setup",
        "Command line proficiency",
        "Community and open-source awareness",
      ],
    },
    {
      title: "STEM Training over Programming using Scratch (Shakti School)",
      date: "2023-08-28",
      cat: "Fun & Creative",
      mode: "Offline",
      venue: "MA115",
      participants: 120,
      audience: "Standard 9 & 10 students, Shakti School",
      description:
        "A roughly 4-hour hands-on introduction to game development with the Scratch offline editor for school students.",
      overview: [
        "Introduction to CP Club",
        "Introduction to Scratch",
        "Hands-on implementation of game movement logic",
        "Session conclusion",
      ],
      outcomes: [
        "Active engagement in discussions and hands-on work",
        "Exploration of new domains",
        "Insight into the world of game development",
      ],
    },
    {
      title: "STEM Training over Programming using Scratch (Nirmala Convent)",
      date: "2023-08-28",
      cat: "Fun & Creative",
      mode: "Offline",
      venue: "MA115",
      participants: 90,
      audience: "Standard 9 & 10 students, Nirmala School",
      description:
        "A roughly 4-hour hands-on Scratch session plus a quiz, with gifts for the top quiz performers.",
      overview: [
        "Introduction to CP Club",
        "Introduction to Scratch",
        "Hands-on implementation of game movement logic",
        "Quiz",
        "Session conclusion",
      ],
      outcomes: [
        "Enhanced creativity and thinking",
        "Insight into game development",
        "Top quiz performers rewarded",
      ],
    },
    {
      title: "Git & GitHub",
      date: "2024-01-06",
      cat: "Hands-on Lab",
      mode: "Offline",
      venue: "MA115",
      participants: 29,
      audience: "Club prime members",
      description:
        "Introduced club members to version control with Git and collaboration on GitHub, including local installation and setup.",
      overview: [
        "Introduction to Git and GitHub",
        "Git basics — commands, branches, merges, conflict resolution",
        "GitHub — repositories, pull requests, issues",
        "Repository structure, commit history, best practices",
        "Git installation and setup",
        "Doubt solving",
      ],
      outcomes: [
        "Git and GitHub mastery",
        "Streamlined collaboration with branches and merges",
        "Successful Git setup on various platforms",
      ],
    },
    {
      title: "CodeQuest: Troubleshooting Tigers",
      date: "2024-03-14",
      cat: "Competition",
      mode: "Offline",
      venue: "MA115",
      participants: 31,
      audience: "Students from different departments and semesters · MU Fest 2024",
      description:
        "A solo two-round troubleshooting contest at MU Fest 2024 — debug code on paper, then tackle interview-style case studies.",
      overview: [
        "Round 1 (10 AM): troubleshoot given code on paper and mark the fix",
        "Selected participants move to Round 2",
        "Round 2 (1 PM – 4 PM): case studies similar to company coding interviews",
        "Languages: C, C++, Java, Python",
      ],
      outcomes: [
        "High participation from varied backgrounds",
        "Skill demonstration across languages",
        "Experience in problem solving under pressure",
      ],
    },
    {
      title: "Coding Relay Race",
      date: "2024-03-14",
      cat: "Competition",
      mode: "Offline",
      venue: "MA102",
      participants: 41,
      audience: "Programming enthusiasts · MU Fest 2024",
      description:
        "A group event at MU Fest 2024: solve a programming problem, flip a bottle, pass the turn to your teammate.",
      overview: [
        "Round 1: 14-03-2024, 12 PM – 2 PM",
        "Round 2: 15-03-2024, 9:30 AM – 11:30 AM",
        "Solve a problem → flip a bottle → pass the turn",
        "Languages: C, C++, Java, Python",
      ],
      outcomes: [
        "High participation",
        "Skill demonstration in multiple languages",
        "Teamwork and collaboration",
        "Fun and engagement",
        "Time management under pressure",
      ],
    },
    {
      title: "Java and OOPs from Scratch",
      date: "2024-04-10",
      cat: "Workshop",
      mode: "Offline",
      venue: "MA106",
      participants: 65,
      audience: "Degree Semester 2 students",
      description:
        "A strong foundation in Java programming and OOP, built up step by step with coding exercises.",
      overview: [
        "Java fundamentals and syntax",
        "Core OOP concepts",
        "Interactive learning with coding exercises",
      ],
      outcomes: [
        "Foundational knowledge of Java",
        "Hands-on grasp of encapsulation, inheritance and polymorphism",
        "Stepping stone to Java development",
        "Collaborative learning",
      ],
    },
    {
      title: "Problem Solving Using C++",
      date: "2024-07-27",
      cat: "Hands-on Lab",
      mode: "Offline",
      venue: "MA115 & MA112",
      participants: 60,
      audience: "Semester 3 students",
      description: "Strengthened C++ basics and problem solving on LeetCode and HackerRank.",
      overview: [
        "Introduction to CP Club",
        "Foundational C++ concepts",
        "Hands-on problem solving on LeetCode and HackerRank",
        "Relating it to real-life scenarios",
        "Session conclusion",
      ],
      outcomes: [
        "Better grasp of C++ fundamentals",
        "Confidence on competitive programming platforms",
        "Collaborative learning",
        "Foundation for further specialisation",
      ],
    },
    {
      title: "Git & GitHub",
      date: "2024-09-28",
      cat: "Hands-on Lab",
      mode: "Offline",
      venue: "MA115",
      participants: 35,
      audience: "Open to students from all streams",
      description:
        "Practical insights and hands-on experience with version control and collaborative development, open to all streams.",
      overview: [
        "Introduction to Git and GitHub",
        "Git installation and setup",
        "Git basics — commands, branches, merges, conflict resolution",
        "GitHub — repositories, pull requests, issues",
        "Repository structure, commit history, best practices",
        "Doubt solving",
      ],
      outcomes: [
        "Git and GitHub mastery",
        "Streamlined collaboration",
        "Successful Git setup on various platforms",
      ],
    },
    {
      title: "Creating Custom Library and Header File in C",
      date: "2025-01-16",
      cat: "Workshop",
      mode: "Offline",
      venue: "MA102",
      participants: 49,
      audience: "Degree Semester 2 students",
      description:
        "Introduced students to creating their own custom libraries and header files in C, with volunteers helping every participant set up the compiler.",
      overview: [
        "Introduction to libraries and header files",
        "Need and benefits in C",
        "Library vs header file",
        "Making a custom header file",
        "Creating a custom library",
        "Practice tasks and doubt solving",
      ],
      outcomes: [
        "Grip over functions in C",
        "Knowledge of header files and libraries",
        "Created custom header files",
      ],
    },
    {
      title: "Unity Workshop",
      date: "2025-02-01",
      cat: "Hands-on Lab",
      mode: "Offline",
      venue: "MA115",
      participants: 26,
      description:
        "An introduction to Unity and game development where every participant built their own version of Flappy Bird.",
      overview: [
        "Installation guide for Unity Hub, Unity Engine and Visual Studio",
        "Creating a project and the Unity Engine layout",
        "Importing assets and writing C# for character movement",
        "Building their own Flappy Bird",
      ],
      outcomes: [
        "Hands-on game development with Unity and C#",
        "Unity Hub and Engine proficiency",
        "Asset import and usage",
        "C# scripting basics",
        "Completed a mini-game",
      ],
    },
  ];

  const pptOnly: Array<{ title: string; year: number; cat: string; desc: string }> = [
    {
      title: "Fundamentals of programming",
      year: 2023,
      cat: "Workshop",
      desc: "Core programming concepts for students starting their coding journey.",
    },
    {
      title: "Code Tracing and Debugging",
      year: 2023,
      cat: "Workshop",
      desc: "Reading code line by line and finding bugs systematically.",
    },
    {
      title: "Different types of coding and optimization-algorithm paradigms",
      year: 2023,
      cat: "Technical Talk",
      desc: "An overview of algorithm paradigms and how to optimize solutions.",
    },
    {
      title: "How to build Chrome Extensions",
      year: 2023,
      cat: "Hands-on Lab",
      desc: "Building and loading a browser extension for Chrome.",
    },
    {
      title: "Solving data structure problems",
      year: 2023,
      cat: "Workshop",
      desc: "Practising problems on core data structures.",
    },
    {
      title: "How to create backend restful APIs",
      year: 2023,
      cat: "Technical Talk",
      desc: "Designing and building RESTful backend APIs.",
    },
    {
      title: "Portfolio Designing",
      year: 2024,
      cat: "Workshop",
      desc: "Designing a personal developer portfolio.",
    },
    {
      title: "DSA Practice Session - Hackerrank",
      year: 2024,
      cat: "Hands-on Lab",
      desc: "Guided data structures and algorithms practice on HackerRank.",
    },
    {
      title: "Expert talk on Full Stack",
      year: 2025,
      cat: "Technical Talk",
      desc: "An expert talk on full stack programming.",
    },
    {
      title: "10X Code Clash",
      year: 2025,
      cat: "Competition",
      desc: "A coding competition under the 10X Club – Marwadi University Chapter.",
    },
    {
      title: "Unity Workshop 2.0",
      year: 2025,
      cat: "Hands-on Lab",
      desc: "A follow-up Unity workshop building on the first session.",
    },
    {
      title: "Meme making competition",
      year: 2025,
      cat: "Fun & Creative",
      desc: "A light-hearted creative competition for the coding community.",
    },
  ];

  // Seed report-backed events (no hardcoded id — let cuid() generate it)
  const slugsSeen = new Set<string>();
  for (const r of reports) {
    const year = parseInt(r.date.slice(0, 4), 10);
    let slug = `${slugify(r.title)}-${year}`;
    // Handle duplicate slugs (two Git & GitHub events)
    if (slugsSeen.has(slug)) slug = `${slug}-2`;
    slugsSeen.add(slug);

    await prisma.event.create({
      data: {
        slug,
        title: r.title,
        description: r.description,
        category: mapCat(r.cat),
        mode: r.mode as never,
        status: "COMPLETED",
        eventDate: new Date(r.date),
        year,
        venue: r.venue ?? null,
        speaker: "Competitive Programming Club, ICT Department",
        organizer: "Competitive Programming Club, ICT Department",
        participants: r.participants ?? null,
        audience: r.audience ?? null,
        overviewJson: toJson(r.overview),
        outcomesJson: toJson(r.outcomes),
        takeawaysJson: toJson(r.outcomes), // outcomes double as takeaways
        rulesJson: "[]",
        agendaJson: "[]",
        prerequisitesJson: "[]",
        isPublished: true,
        upcoming: false,
        registrationOpen: false,
        reportBacked: true,
      },
    });
  }

  // Seed PPT-only events
  for (const p of pptOnly) {
    let slug = `${slugify(p.title)}-${p.year}`;
    if (slugsSeen.has(slug)) slug = `${slug}-2`;
    slugsSeen.add(slug);

    await prisma.event.create({
      data: {
        slug,
        title: p.title,
        description: p.desc,
        category: mapCat(p.cat),
        status: "COMPLETED",
        year: p.year,
        speaker: "Competitive Programming Club, ICT Department",
        rulesJson: "[]",
        takeawaysJson: "[]",
        overviewJson: "[]",
        outcomesJson: "[]",
        agendaJson: "[]",
        prerequisitesJson: "[]",
        isPublished: true,
        upcoming: false,
        registrationOpen: false,
      },
    });
  }

  console.log(
    `✅ Events seeded: ${reports.length} report-backed + ${pptOnly.length} PPT-only`
  );
}

// ─── 5. Achievements ──────────────────────────────────────────────────────────

async function seedAchievements() {
  const count = await prisma.achievement.count();
  if (count > 0) {
    console.log("Achievements already seeded, skipping.");
    return;
  }

  const achievements = [
    {
      title: "Hackentine Hackathon by Coding Ninjas 10x Club",
      year: "2025",
      tag: "1st Prize · National",
      description:
        "Ritesh Sanchala, Aryan Langhanoja and Abhay Nathwani won the 1st prize in the national level hackathon \"Hackentine\" organized by Coding Ninjas.",
      studentName: "Ritesh Sanchala, Aryan Langhanoja, Abhay Nathwani",
      organization: "Coding Ninjas",
      result: "1st Prize",
      imageUrl: "/assets/achievements/hackentine-hackathon-2025.webp",
      category: "Hackathon",
    },
    {
      title: "TCS CodeVita",
      tag: "Top 1000 · International",
      description:
        "Kaushal Parmar and Mustafa Bharmal made it into the top 1000 coders in TCS CodeVita, an international coding contest organized by TCS.",
      studentName: "Kaushal Parmar, Mustafa Bharmal",
      organization: "TCS",
      result: "Top 1000",
      imageUrl: "/assets/achievements/tcs-codevita.webp",
      category: "Competitive Programming",
    },
    {
      title: "IEEE Sampark 2025",
      year: "2025",
      tag: "1st Prize · Datathon",
      description:
        "Ruhaan Pathan, Devarsh Bhatt and Rudra Miyani won the 1st prize in the \"Datathon\" organized by SCET during the IEEE flagship – Sampark 2025.",
      studentName: "Ruhaan Pathan, Devarsh Bhatt, Rudra Miyani",
      organization: "IEEE / SCET",
      result: "1st Prize",
      imageUrl: "/assets/achievements/ieee-sampark-2025-datathon.webp",
      category: "Hackathon",
    },
    {
      title: "Azadi ka Amrit Mahotsav Hackathon",
      year: "2022",
      tag: "3rd Prize · State",
      description: "Darshan Padia and team secured 3rd prize in a state level hackathon.",
      studentName: "Darshan Padia",
      result: "3rd Prize",
      imageUrl: "/assets/achievements/azadi-ka-amrit-mahotsav-3rd-prize.webp",
      category: "Hackathon",
    },
    {
      title: "Azadi ka Amrit Mahotsav Hackathon",
      year: "2022",
      tag: "2nd Prize · State",
      description: "Abhay Nathwani and team won the 2nd prize in a state level hackathon.",
      studentName: "Abhay Nathwani",
      result: "2nd Prize",
      imageUrl: "/assets/achievements/azadi-ka-amrit-mahotsav-2nd-prize.webp",
      category: "Hackathon",
    },
    {
      title: "IEEE Matlab Hackathon by IEEE Gujarat Section",
      year: "2025",
      tag: "2nd Runner-up",
      description:
        "Devarsh Bhatt, Heer Mehta and Akshat Shah were declared 2nd runner-ups at the \"IEEE Matlab\" Hackathon organized by IEEE Gujarat Section at PDEU.",
      studentName: "Devarsh Bhatt, Heer Mehta, Akshat Shah",
      organization: "IEEE Gujarat Section",
      result: "2nd Runner-up",
      imageUrl: "/assets/achievements/ieee-matlab-hackathon-2025.webp",
      category: "Hackathon",
    },
    {
      title: "Hackduino by Arduino",
      year: "2025",
      tag: "1st Prize",
      description:
        "Kaushal Parmar and Abhay Nathwani won the 1st prize in Hackduino 2025, an official hackathon organized by Arduino.",
      studentName: "Kaushal Parmar, Abhay Nathwani",
      organization: "Arduino",
      result: "1st Prize",
      imageUrl: "/assets/achievements/hackduino-2025.webp",
      category: "Hackathon",
    },
    {
      title: "NewGen IEDC Scheme",
      tag: "Rs. 2 Lakh Grant",
      description:
        "Darshan Padia was awarded Rs. 2 Lakh under the NewGen IEDC Scheme for the project \"ARICA – AI Powered assistant for your customised dataset\".",
      studentName: "Darshan Padia",
      result: "Rs. 2 Lakh Grant",
      imageUrl: "/assets/achievements/newgen-iedc-grant.webp",
      category: "Research & Grants",
    },
    {
      title: "MITACS Internship",
      tag: "Research · Canada",
      description:
        "Darshan Padia secured a fully funded research internship under the guidance of Prof. Rita Orji at Dalhousie University, Canada under the MITACS Internship programme.",
      studentName: "Darshan Padia",
      organization: "Dalhousie University, Canada",
      result: "Fully Funded Research Internship",
      imageUrl: "/assets/achievements/mitacs-internship.webp",
      category: "Research & Grants",
    },
    {
      title: "Logic Leap Race",
      tag: "1st Place",
      description:
        "Vivek Chavda and his team secured 1st place in the Logic Leap Race with an e-commerce website that provides real-time data using a Flask API.",
      studentName: "Vivek Chavda",
      result: "1st Place",
      imageUrl: "/assets/achievements/logic-leap-race.webp",
      category: "Competition",
    },
    {
      title: "IEEE Mindroid",
      tag: "Publication",
      description:
        "Heer Mehta got her article \"TCL RayNeo X2: A Technological Marvel in augmented reality\" published in IEEE Mindroid.",
      studentName: "Heer Mehta",
      organization: "IEEE",
      result: "Publication",
      imageUrl: "/assets/achievements/ieee-mindroid-publication.webp",
      category: "Research & Grants",
    },
    {
      title: "LeetCode 365 Days",
      year: "2024",
      tag: "Badge",
      description:
        "Aryan Langhanoja achieved the 365 days of coding badge on LeetCode for the year 2024.",
      studentName: "Aryan Langhanoja",
      organization: "LeetCode",
      result: "365 Days Badge",
      imageUrl: "/assets/achievements/leetcode-365-days-2024.webp",
      category: "Competitive Programming",
    },
  ];

  await prisma.achievement.createMany({ data: achievements });
  console.log(`✅ Achievements seeded: ${achievements.length} records`);
}

// ─── 6. Placements ────────────────────────────────────────────────────────────

async function seedPlacements() {
  const count = await prisma.placementRecord.count();
  if (count > 0) {
    console.log("Placements already seeded, skipping.");
    return;
  }

  const placements = [
    { studentName: "Akshat Kakkad", company: "rtCamp", package: "12 LPA" },
    { studentName: "Hitkumar Bhalodiya", company: "rtCamp", package: "12 LPA" },
    { studentName: "Bhavik Kalpesh", company: "rtCamp", package: "12 LPA" },
    { studentName: "Rutvik Savsani", company: "rtCamp", package: "12 LPA" },
    { studentName: "Renish Surani", company: "rtCamp", package: "12 LPA" },
    { studentName: "Mustafa Bharmal", company: "rtCamp", package: "12 LPA" },
    { studentName: "Dev Mehta", company: "rtCamp", package: "12 LPA" },
    { studentName: "Karan Rajpara", company: "Astound Digital", package: "11 LPA" },
    { studentName: "Belvinraja Nadar", company: "Fintech Global Center", package: "10 LPA" },
    { studentName: "Darshan Padia", company: "Fintech Global Center", package: "10 LPA" },
    { studentName: "Abhay Nathwani", company: "Fintech Global Center", package: "10-15 LPA" },
    { studentName: "Kaushal Faldu", company: "Cresen Solutions", package: "6.5 LPA" },
    { studentName: "Mandeep Dangar", company: "Indexnine", package: "6 LPA" },
    { studentName: "Aryan Langhanoja", company: "Ace Analytics", package: "5.1 LPA" },
  ];

  await prisma.placementRecord.createMany({ data: placements });
  console.log(`✅ Placements seeded: ${placements.length} records`);
}

// ─── 7. GATE Qualifications ───────────────────────────────────────────────────

async function seedGate() {
  const count = await prisma.gateQualification.count();
  if (count > 0) {
    console.log("GATE records already seeded, skipping.");
    return;
  }

  const gateRecords = [
    { studentName: "Mustafa Bharmal", exam: "GATE 2024", paper: "Data Science and AI", year: 2024 },
    { studentName: "Mustafa Bharmal", exam: "GATE 2025", paper: "Computer Science", year: 2025 },
    { studentName: "Hitkumar Bhalodiya", exam: "GATE 2024", paper: "Computer Science and IT", year: 2024 },
    { studentName: "Hasti Hajipara", exam: "GATE 2025", paper: "Computer Science", year: 2025 },
    { studentName: "Rutik Parmar", exam: "GATE 2025", paper: "Computer Science", year: 2025 },
  ];

  await prisma.gateQualification.createMany({ data: gateRecords });
  console.log(`✅ GATE records seeded: ${gateRecords.length} records`);
}

// ─── 8. Registration Counter ──────────────────────────────────────────────────

async function seedRegistrationCounter() {
  await prisma.registrationCounter.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", current: 0 },
    update: {},
  });
  console.log("✅ Registration counter initialized");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting CP Club database seed (MySQL)...\n");

  await seedAdmin();
  await seedSiteSettings();
  await seedCommittee();
  await seedEvents();
  await seedAchievements();
  await seedPlacements();
  await seedGate();
  await seedRegistrationCounter();

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("   1. Log in at http://localhost:3000/admin");
  console.log("   2. Change the admin password immediately");
  console.log("   3. Set VITE_API_BASE_URL=http://localhost:5000/api in the frontend .env");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
