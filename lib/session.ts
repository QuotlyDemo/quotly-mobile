const SUBMISSIONS_KEY = "quotly_submissions";

export type StoredSubmission = {
  id: number;
  brand: string;
  style: string;
  submittedAt: string;
  mainImageUrl: string;
};

export function getMySubmissions(): StoredSubmission[] {
  try {
    return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveSubmission(sub: StoredSubmission): void {
  const existing = getMySubmissions();
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([sub, ...existing]));
}
