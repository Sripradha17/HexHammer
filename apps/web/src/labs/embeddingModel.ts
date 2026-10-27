// A TOY embedding model, made by hand for teaching. HONEST LABEL: this is NOT a trained neural
// model. Each word maps to a few hand-chosen "concept" dimensions; a sentence's vector is the sum of
// its words' vectors. That is enough to show the key idea (sentences with different words can still
// be close in meaning), and the cosine similarity maths is exactly what real systems use.
export const CONCEPTS = ["money-back", "shipping", "time", "account", "security", "product", "cancel", "contact"] as const;

const LEXICON: Record<string, Partial<Record<(typeof CONCEPTS)[number], number>>> = {
  refund: { "money-back": 1 },
  refunds: { "money-back": 1 },
  refunded: { "money-back": 1 },
  reimbursement: { "money-back": 1 },
  reimburse: { "money-back": 1 },
  reimbursed: { "money-back": 1 },
  return: { "money-back": 0.6, shipping: 0.3 },
  returned: { "money-back": 0.6, shipping: 0.3 },
  money: { "money-back": 0.7 },
  back: { "money-back": 0.3 },
  ship: { shipping: 1 },
  shipping: { shipping: 1 },
  delivery: { shipping: 1 },
  deliver: { shipping: 1 },
  parcel: { shipping: 0.9 },
  courier: { shipping: 0.8 },
  days: { time: 1 },
  day: { time: 1 },
  long: { time: 0.8 },
  when: { time: 0.6 },
  weeks: { time: 1 },
  arrive: { shipping: 0.6, time: 0.4 },
  account: { account: 1 },
  login: { account: 0.8, security: 0.3 },
  password: { account: 0.6, security: 0.7 },
  sign: { account: 0.5 },
  hacked: { security: 1 },
  breach: { security: 1 },
  stolen: { security: 0.8 },
  stole: { security: 0.8 },
  item: { product: 0.8 },
  product: { product: 1 },
  order: { product: 0.5, shipping: 0.2 },
  broken: { product: 0.6, "money-back": 0.3 },
  damaged: { product: 0.6, "money-back": 0.3 },
  smashed: { product: 0.6, "money-back": 0.3 },
  cancel: { cancel: 1 },
  cancellation: { cancel: 1 },
  stop: { cancel: 0.6 },
  subscription: { cancel: 0.4, account: 0.4 },
  contact: { contact: 1 },
  support: { contact: 0.8 },
  phone: { contact: 0.7 },
  email: { contact: 0.6, account: 0.2 },
};

export function words(text: string) {
  return text.toLowerCase().match(/[a-z]+/g) ?? [];
}

export function embed(text: string): number[] {
  const v = CONCEPTS.map(() => 0);
  for (const w of words(text)) {
    const concepts = LEXICON[w];
    if (!concepts) continue;
    CONCEPTS.forEach((c, i) => (v[i] += concepts[c] ?? 0));
  }
  return v;
}

// Cosine similarity: the angle between two vectors. 1 = same direction, 0 = unrelated.
export function cosine(a: number[], b: number[]) {
  const dot = a.reduce((n, x, i) => n + x * b[i], 0);
  const len = (v: number[]) => Math.sqrt(v.reduce((n, x) => n + x * x, 0));
  const d = len(a) * len(b);
  return d === 0 ? 0 : dot / d;
}

export function sharedWords(a: string, b: string) {
  const stop = new Set(["a", "an", "the", "is", "are", "do", "i", "my", "to", "of", "for", "how", "what", "can", "it", "in", "on", "and", "you", "your", "get"]);
  const set = new Set(words(a).filter((w) => !stop.has(w)));
  return [...new Set(words(b).filter((w) => !stop.has(w) && set.has(w)))];
}
