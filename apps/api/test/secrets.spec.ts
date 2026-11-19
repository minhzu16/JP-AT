import { requireSecret } from '../src/common/secrets';

const KEYS = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));

function setEnv(key: (typeof KEYS)[number], value: string | undefined) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

afterEach(() => {
  for (const key of KEYS) setEnv(key, saved[key]);
});

describe('requireSecret (no built-in JWT secrets)', () => {
  it.each([undefined, '', 'change-me-access'])('refuses a missing or short access secret: %p', (value) => {
    setEnv('JWT_ACCESS_SECRET', value);
    expect(() => requireSecret('JWT_ACCESS_SECRET')).toThrow(/at least 32 characters/);
  });

  it('refuses identical access and refresh secrets', () => {
    setEnv('JWT_ACCESS_SECRET', 's'.repeat(40));
    setEnv('JWT_REFRESH_SECRET', 's'.repeat(40));
    expect(() => requireSecret('JWT_ACCESS_SECRET')).toThrow(/must be different/);
  });

  it('returns a valid secret', () => {
    setEnv('JWT_ACCESS_SECRET', 'a'.repeat(40));
    setEnv('JWT_REFRESH_SECRET', 'r'.repeat(40));
    expect(requireSecret('JWT_REFRESH_SECRET')).toBe('r'.repeat(40));
  });
});
