// Test-only signing secrets when none are provided (CI and real deployments set their own).
// The API itself refuses to start without real secrets: see src/common/secrets.ts.
process.env.JWT_ACCESS_SECRET ||= 'test-only-access-secret-0123456789abcdef';
process.env.JWT_REFRESH_SECRET ||= 'test-only-refresh-secret-0123456789abcdef';
