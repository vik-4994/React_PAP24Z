import axios from 'axios';

describe('POST /usos/timetable', () => {
  it('should return timetable data for valid subjectCode and termCode', async () => {
    const res = await axios.post('http://localhost:3000/usos/timetable', {
      subjectCode: '103A-INxxx-ISP-ANMA',
      termCode: '2024Z',
    });

    expect(res.data.status).toBe(200);
    expect(res.data.data.timetable).toBeInstanceOf(Array);
    expect(res.data.data.timetable.length).toBeGreaterThan(0);
  });

  describe('POST /usos/timetable', () => {
    it('should return 400 for missing subjectCode or termCode', async () => {
      const res = await axios.post('http://localhost:3000/usos/timetable', {});

      expect(res.data.status).toBe(400);
    });
  });

  it('should return 500 for invalid subjectCode or termCode', async () => {
    const res = await axios.post('http://localhost:3000/usos/timetable', {
      subjectCode: 'asdasdasd',
      termCode: 'asdasdasd',
    });

    expect(res.data.status).toBe(500);
  });
});
