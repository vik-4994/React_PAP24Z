import { trpc } from '@frontend/utils/trpc';
import { test, expect } from '@playwright/test';
import { makeAnonymousUsosApiCall } from '@backend/services/usos/oauth';
import { scrapeTimetable } from '@backend/services/usos/scrapeTimetable';

test('scrape_timetable', async () => {
  const mockApiResponse = [
    {
      mentor: 'Tomasz Traczyk',
      time: '14:15',
      type: 'Wykład',
      group: '1',
      day: 'środa',
      location:
        'Sala 202, Budynek Wydziału Elektroniki i Technik Informacyjnych [1030-ETI]',
    },
  ];

  const subjectCode = '103C-INxxx-ISP-BD2';
  const termCode = '2024Z';
  const result = await scrapeTimetable(subjectCode, termCode);
  expect(result).toEqual(mockApiResponse);
});
