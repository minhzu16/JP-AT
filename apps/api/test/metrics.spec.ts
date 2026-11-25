import { MetricsService } from '../src/modules/metrics/metrics.service';
import { MetricsController } from '../src/modules/metrics/metrics.controller';
import { Response } from 'express';

describe('MetricsService (PJ5)', () => {
  it('initializes custom metrics and registers default node metrics with jobportal_ prefix', async () => {
    const service = new MetricsService();
    service.httpRequestsTotal.inc({ method: 'GET', route: '/jobs', status_code: '200' });
    service.httpRequestDuration.observe({ method: 'GET', route: '/jobs', status_code: '200' }, 0.05);

    const output = await service.getMetrics();
    expect(output).toContain('jobportal_http_requests_total');
    expect(output).toContain('jobportal_http_request_duration_seconds');
    expect(output).toContain('jobportal_process_cpu_user_seconds_total');
    expect(service.getContentType()).toContain('text/plain');
  });

  it('protects with METRICS_TOKEN when configured (W5-1)', async () => {
    const service = new MetricsService();
    const controller = new MetricsController(service);

    process.env.METRICS_TOKEN = 'test-token-pj5';
    try {
      let statusCode = 200;
      let body = '';
      const res = {
        setHeader: () => {},
        send: (b: string) => { body = b; },
        status: (c: number) => { statusCode = c; return { send: (b: string) => { body = b; } }; },
      } as unknown as Response;

      // Without auth header -> 401
      await controller.getMetrics({ headers: {} } as any, res);
      expect(statusCode).toBe(401);

      // With valid auth header -> 200
      statusCode = 200;
      await controller.getMetrics({ headers: { authorization: 'Bearer test-token-pj5' } } as any, res);
      expect(statusCode).toBe(200);
      expect(body).toContain('jobportal_');
    } finally {
      delete process.env.METRICS_TOKEN;
    }
  });
});
