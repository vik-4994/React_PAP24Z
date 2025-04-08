import { trpc } from '@frontend/utils/trpc';
import { test, expect } from '@playwright/test';
import { makeAnonymousUsosApiCall } from '@backend/services/usos/oauth';

// Mock the API call

test('current_semester', async () => {
  const mockApiResponse = {
    end_date: '2025-02-19',
    finish_date: '2025-02-19',
    id: '2024Z',
    is_active: true,
    name: {
      pl: 'rok akademicki 2024/2025 - sem. zimowy',
      en: 'Winter Semester 2024/2025',
    },
    order_key: 1330,
    start_date: '2024-10-01',
  };
  const currentDate = new Date().toISOString().split('T')[0];

  // Mock the makeAnonymousUsosApiCall to return the mock response

  const result = await makeAnonymousUsosApiCall('services/terms/search', {
    min_finish_date: currentDate,
    max_start_date: currentDate,
  });

  // Verify the result is the first element of the mock response
  expect(result[0]).toEqual(mockApiResponse);
});
