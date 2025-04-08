import axios from 'axios';
import * as cheerio from 'cheerio';

class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

const fetchCheerio = async (url: string): Promise<cheerio.CheerioAPI> => {
  try {
    const response = await axios.get(url);
    return cheerio.load(response.data);
  } catch (error) {
    console.error(`Failed to load Cheerio for URL: ${url}`, error);
    throw new FetchError(`Failed to fetch data from ${url}`);
  }
};

const composeUrl = (subjectCode: string, termCode: string) =>
  `https://usosweb.usos.pw.edu.pl/kontroler.php?_action=katalog2/przedmioty/pokazPlanZajecPrzedmiotu&prz_kod=${subjectCode}&cdyd_kod=${termCode}`;

const cleanDay = (day: string) => day.replace(/każd[ya] /, '').split(',')[0];

const cleanLocation = (location: string) =>
  location.replace(/\s+budynek:\s+/, ' ');

const parseTypeGroup = (typeGroup: string) => {
  const [type, groupRaw] = typeGroup.split(',');
  return { type: type.trim(), group: groupRaw?.replace(' grupa ', '').trim() };
};

const SELECTORS = {
  mentor: 'div[slot="info"]',
  time: 'span[slot="time"]',
  typeGroup: 'span[slot="dialog-info"]',
  day: 'span[slot="dialog-event"]',
  location: 'span[slot="dialog-place"]',
};

interface UsosTimetableEntry {
  mentor: string;
  time: string;
  type: string;
  group: string;
  day: string;
  location: string;
}

export async function scrapeTimetable(
  subjectCode: string,
  termCode: string
): Promise<UsosTimetableEntry[]> {
  const url = composeUrl(subjectCode, termCode);
  const $ = await fetchCheerio(url);

  return $('timetable-entry')
    .map((_, element) => {
      const getText = (selector: string) =>
        $(element).find(selector).text().trim();

      const { type, group } = parseTypeGroup(getText(SELECTORS.typeGroup));
      return {
        mentor: getText(SELECTORS.mentor),
        time: getText(SELECTORS.time),
        type,
        group,
        day: cleanDay(getText(SELECTORS.day)),
        location: cleanLocation(getText(SELECTORS.location)),
      };
    })
    .get();
}
