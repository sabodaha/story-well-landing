/**
 * Tests for health endpoint
 * Note: These tests require the API to be running or mocked
 */

describe('Health Endpoint', () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_FEEDBACK_API_BASE_URL || 'https://opinionboard-lb23erpsaq-uc.a.run.app';

  it('should return 200 status', async () => {
    const response = await fetch(`${apiBaseUrl}/health`);
    expect(response.status).toBe(200);
  });

  it('should return JSON with status field', async () => {
    const response = await fetch(`${apiBaseUrl}/health`);
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
  });

  it('should include timestamp', async () => {
    const response = await fetch(`${apiBaseUrl}/health`);
    const data = await response.json();
    expect(data).toHaveProperty('timestamp');
    expect(typeof data.timestamp).toBe('string');
    // Should be valid ISO date string
    expect(() => new Date(data.timestamp)).not.toThrow();
  });
});




