import { trpc } from '@frontend/utils/trpc';
import { test, expect } from '@playwright/test';
import { makeAnonymousUsosApiCall } from '@backend/services/usos/oauth';
import { scrapeTimetable } from '@backend/services/usos/scrapeTimetable';

test('scrape_timetable', async () => {
  const mockApiResponse = [
    {
      start_time: '2025-01-20 09:30:00',
      end_time: '2025-01-20 11:00:00',
      name: { pl: 'Wychowanie fizyczne', en: 'physical education' },
    },
  ];

  const input = {
    unit_id: '487008',
    group_number: '2',
  };
  const result = await makeAnonymousUsosApiCall(
    'services/tt/classgroup',
    input
  );
  expect(result).toEqual(mockApiResponse);
});
