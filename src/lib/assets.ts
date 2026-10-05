// Central registry of every static image. All files live in public/assets/ so the
// downloaded project is fully self-contained (no hosted asset CDN at runtime).
const base = "/assets";

export const assets = {
  logo: `${base}/branding/cp-club-logo.png`,
  committee: {
    shivkumar: `${base}/committee/shivkumar-paun.webp`,
    heer: `${base}/committee/heer-mehta.webp`,
    keshvi: `${base}/committee/keshvi-santoki.webp`,
    tejas: `${base}/committee/tejas-vadgama.webp`,
    rishi: `${base}/committee/rishi-bhuva.webp`,
    shweta: `${base}/committee/shweta-sanathara.webp`,
    mentor: `${base}/committee/prof-nishith-kotak.webp`,
  },
  pseudo: {
    darshit: `${base}/committee/darshit-kacha.webp`,
    hit: `${base}/committee/hit-depani.webp`,
    yesha: `${base}/committee/yesha-joshi.webp`,
    soham: `${base}/committee/soham-vora.webp`,
  },
  achievements: {
    hackentine: `${base}/achievements/hackentine-hackathon-2025.webp`,
    codevita: `${base}/achievements/tcs-codevita.webp`,
    sampark: `${base}/achievements/ieee-sampark-2025-datathon.webp`,
    amrit3: `${base}/achievements/azadi-ka-amrit-mahotsav-3rd-prize.webp`,
    amrit2: `${base}/achievements/azadi-ka-amrit-mahotsav-2nd-prize.webp`,
    matlab: `${base}/achievements/ieee-matlab-hackathon-2025.webp`,
    hackduino: `${base}/achievements/hackduino-2025.webp`,
    iedc: `${base}/achievements/newgen-iedc-grant.webp`,
    mitacs: `${base}/achievements/mitacs-internship.webp`,
    logicLeap: `${base}/achievements/logic-leap-race.webp`,
    mindroid: `${base}/achievements/ieee-mindroid-publication.webp`,
    leetcode365: `${base}/achievements/leetcode-365-days-2024.webp`,
    collab: `${base}/achievements/coding-ninjas-10x-collaboration.webp`,
  },
};

/** Event report photos: public/assets/events/ev-r{report}-{n}.webp */
export const EVENT_PHOTO_FILES = ["ev-r1-0","ev-r1-1","ev-r2-0","ev-r3-0","ev-r5-0","ev-r5-1","ev-r7-0","ev-r7-1","ev-r7-2","ev-r7-3","ev-r8-0","ev-r8-1","ev-r8-2","ev-r8-3","ev-r8-4","ev-r9-0","ev-r9-1","ev-r9-2","ev-r10-0","ev-r10-1","ev-r10-2","ev-r11-0","ev-r11-1","ev-r11-2","ev-r12-0","ev-r12-1","ev-r12-2","ev-r12-3","ev-r12-4","ev-r12-5","ev-r12-6","ev-r12-7","ev-r13-0","ev-r13-1","ev-r13-2","ev-r13-3","ev-r14-0","ev-r14-1","ev-r14-2","ev-r14-3","ev-r15-0","ev-r15-1","ev-r15-2","ev-r15-3","ev-r16-0","ev-r17-0","ev-r17-1","ev-r17-2","ev-r17-3","ev-r17-4","ev-r17-5"] as const;
export const eventPhoto = (name: string) => `${base}/events/${name}.webp`;

/** Consistency wall member photos: public/assets/community/{slug}.webp */
export const COMMUNITY_PHOTO_SLUGS = new Set<string>(["aditya-raj","aryan-mahida","ashutosh-kumar-singh","bhavin-muchhala","dhruviben-patel","disha-vadoliya","fenil-vadher","gouri-unnithan","harsh-doshi","harshil-domadiya","jay-mangukiya","kirtan-makwana","kirti-shingala","krish-mamtora","krishna-dixit","mihir-mithani","milan-jani","mit-jayesh-solanki","naman-jain","nidhi-dattani","niki-majithiya","payal-makwana","rajvi-dave","ritesh-sanchala","shivam-bhatt","shivani-ambati","tanvi-kakadiya","umang-hirani","umutoni-justine","victoria-v-k","vidya-bharti-sinha"]);
export const communityPhoto = (slug: string) =>
  COMMUNITY_PHOTO_SLUGS.has(slug) ? `${base}/community/${slug}.webp` : undefined;
