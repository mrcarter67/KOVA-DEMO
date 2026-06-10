const rateMap = new Map<string, { count: number; reset: number }>();

export function rateLimit(ip: string, limit = 20, windowMs = 3_600_000): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
