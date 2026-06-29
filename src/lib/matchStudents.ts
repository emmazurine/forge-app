import { Student } from '../types/user';

export type MatchResult = { id: string; reason: string };

const STOP_WORDS = new Set([
  'and', 'the', 'for', 'who', 'with', 'that', 'has', 'have', 'are', 'is',
  'im', 'looking', 'someone', 'want', 'wants', 'need', 'needs', 'find',
  'interested', 'into', 'about', 'like', 'really', 'very', 'good', 'great',
  'knows', 'know', 'does', 'doing', 'done', 'can', 'could', 'would', 'also',
  'some', 'any', 'open', 'person', 'people', 'student', 'one', 'two', 'three',
]);

const SYNONYMS: Record<string, string[]> = {
  'ml': ['machine learning'],
  'ai': ['machine learning', 'artificial intelligence', 'ai'],
  'artificial intelligence': ['ai', 'machine learning'],
  'machine learning': ['ml', 'ai', 'pytorch', 'tensorflow'],
  'robots': ['robotics'],
  'robot': ['robotics'],
  'robotics': ['robots', 'robot', 'embedded', 'autonomous'],
  'startup': ['startups', 'founder', 'venture'],
  'startups': ['startup', 'founder', 'entrepreneurship'],
  'founder': ['startup', 'startups', 'co-found', 'cofound'],
  'co-found': ['founder', 'startup'],
  'cofound': ['founder', 'startup'],
  'healthcare': ['health', 'medicine', 'medical', 'clinical'],
  'medicine': ['healthcare', 'medical', 'clinical'],
  'medical': ['healthcare', 'medicine', 'clinical'],
  'policy': ['ai policy', 'tech ethics', 'governance'],
  'ethics': ['tech ethics', 'policy', 'ai policy'],
  'hardware': ['embedded', 'robotics', 'iot', 'arduino'],
  'cs': ['computer science'],
  'quantum': ['quantum computing'],
  'nlp': ['natural language processing', 'clinical nlp'],
  'design': ['figma', 'ux', 'ui', 'product'],
  'product': ['product management', 'pm', 'figma'],
  'research': ['open research', 'clinical research', 'ai policy'],
  'physics': ['quantum computing', 'quantum'],
  'game': ['game dev', 'unity', 'games'],
  'games': ['game dev', 'unity'],
  'biomedical': ['biomedical devices', 'medicine', 'healthcare'],
  'nonprofit': ['nonprofits', 'social impact', 'global health'],
  'social impact': ['nonprofits', 'global health', 'public interest tech'],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function expandQuery(tokens: string[]): Set<string> {
  const expanded = new Set<string>(tokens);
  // Add bigrams (two-word phrases)
  for (let i = 0; i < tokens.length - 1; i++) {
    expanded.add(`${tokens[i]} ${tokens[i + 1]}`);
  }
  // Add synonyms
  for (const t of Array.from(expanded)) {
    const syns = SYNONYMS[t] ?? [];
    syns.forEach((s) => expanded.add(s));
  }
  return expanded;
}

function textContainsAny(text: string, terms: Set<string>): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const term of terms) {
    if (lower.includes(term)) hits.push(term);
  }
  return hits;
}

function scoreStudent(terms: Set<string>, student: Student): { score: number; reason: string } {
  let score = 0;
  const reasonParts: string[] = [];

  // Interests — highest weight
  for (const interest of student.interests) {
    const hits = textContainsAny(interest, terms);
    if (hits.length > 0) {
      score += 5;
      reasonParts.push(`interests in ${interest}`);
    }
  }

  // Skills — high weight
  for (const skill of student.skills ?? []) {
    const hits = textContainsAny(skill, terms);
    if (hits.length > 0) {
      score += 3;
      reasonParts.push(`skills in ${skill}`);
    }
  }

  // Project name and description — medium weight
  if (student.currentProject) {
    const hits = textContainsAny(student.currentProject, terms);
    if (hits.length > 0) {
      score += 3;
      reasonParts.push(`working on ${student.currentProject}`);
    }
  }
  if (student.projectDescription) {
    const hits = textContainsAny(student.projectDescription, terms);
    score += hits.length * 1;
  }

  // Bio — lower weight
  const bioHits = textContainsAny(student.bio, terms);
  score += bioHits.length * 1;

  // Bonus: open to collaborate
  if (student.openToCollaborate) score += 1;

  // Build a human-readable reason from the top matches
  const topParts = reasonParts.slice(0, 3);
  let reason = '';
  if (topParts.length > 0) {
    reason = `${topParts.join(', ')}${student.openToCollaborate ? ' — open to collaborate' : ''}.`;
    reason = reason.charAt(0).toUpperCase() + reason.slice(1);
  } else {
    reason = `${student.name}'s background aligns with your search.`;
  }

  return { score, reason };
}

export async function matchStudents(query: string, students: Student[]): Promise<MatchResult[]> {
  if (!query.trim()) return [];

  const tokens = tokenize(query);
  const terms = expandQuery(tokens);

  const scored = students
    .map((s) => {
      const { score, reason } = scoreStudent(terms, s);
      return { id: s.id, score, reason };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return scored.map(({ id, reason }) => ({ id, reason }));
}
