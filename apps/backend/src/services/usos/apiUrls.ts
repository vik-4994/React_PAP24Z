export type UsosApiUrls = {
  'services/courses/user': {
    reply: {
      course_editions: {
        [termId: string]: {
          course_id: string;
          course_name: {
            en: string;
            pl: string;
          };
          term_id: string;
          user_groups: Array<{
            class_type_id: string;
            class_type: { en: string; pl: string };
            course_fac_id: string | null;
            course_homepage_url: string | null;
            course_unit_id: string;
            group_number: number;
            group_url: string | null;
            lecturers: Array<{
              id: string;
              first_name: string;
              last_name: string;
            }>;
            participants: Array<{
              id: string;
              first_name: string;
              last_name: string;
            }>;
          }>;
        }[];
      };
    };
    params: { fields: string };
  };

  'services/users/user': {
    reply: {
      photo_urls: {
        '50x50': string;
      };
    };
    params: { fields: string; id: string };
  };

  'services/tt/classgroup': {
    reply: {
      title: any;
      start_time: string;
      end_time: string;
      name: {
        pl: string;
        en: string;
      };
    };
    params: {
      unit_id: string;
      group_number: string;
      fields: string;
    };
  };

  'services/tt/user': {
    reply: any;
    params: any;
  };
};
