import React, { useEffect, useState } from 'react';
import { trpc } from '@frontend/utils/trpc';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  GraduationCap,
  BookOpen,
  Users,
  Code,
  FolderKanban,
} from 'lucide-react';
import { Card, CardContent } from '@frontend/features/Card';
import { Loading } from '@frontend/components/Loading';
import { AnimatedPage } from '@frontend/components/AnimatedPage';
import { UsosApiUrls } from '@backend/services/usos/apiUrls';

const format = (date: Date, format: string) => {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Niedziela',
    'Poniedziałek',
    'Wtorek',
    'Środa',
    'Czwartek',
    'Piątek',
    'Sobota',
  ];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (format === 'HH:mm') return `${hours}:${minutes}`;
  if (format === 'EEEE') return days[date.getDay()];
  return '';
};

function getClassTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'wykład':
    case 'lecture':
      return <BookOpen className="h-4 w-4" />;
    case 'projekt':
    case 'project':
      return <Code className="h-4 w-4" />;
    case 'laboratorium':
    case 'laboratory':
      return <Users className="h-4 w-4" />;
    case 'ćwiczenia':
    case 'exercises':
      return <FolderKanban className="h-4 w-4"></FolderKanban>;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

const fetchClassGroupData = async (unit_id: string, group_number: string) => {
  const response = await fetch(
    `/trpc/usos.classGroup?input=${encodeURIComponent(
      JSON.stringify({ unit_id, group_number })
    )}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch class group data');
  }

  const jsonResponse = await response.json();

  if (jsonResponse.result && jsonResponse.result.data) {
    return jsonResponse.result.data;
  } else {
    throw new Error('Unexpected response format');
  }
};

async function fetchClassGroups(user_groups: any) {
  const allEvents = await Promise.all(
    user_groups.map(async (group: any) => {
      try {
        const events = await fetchClassGroupData(
          group.course_unit_id,
          group.group_number.toString()
        );
        return events.map((event: any) => ({
          ...event,
          classType: group.classType,
        }));
      } catch (err) {
        console.error('Error fetching class group data:', err);
        return [];
      }
    })
  );

  // Flatten the results since `events` is an array for each group
  return allEvents.flat();
}

function capitalizeWords(input: string): string {
  return input
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function Subjects() {
  const { t, i18n } = useTranslation();
  const { data: currentSemesterInfo } = trpc.usos.current_semester.useQuery();

  const { data: check, isLoading: isLoadingCourses } =
    trpc.usos.courses_user_course_editions.useQuery();
  const currentCourseEdition = currentSemesterInfo?.id;
  const [subjects, setSubjects] = useState<any>([]);
  const courseData = check?.course_editions[currentCourseEdition]!;
  const { data: userId } = trpc.usos.getUserId.useQuery();

  useEffect(() => {
    const fetchData = async () => {
      if (check) {
        try {
          const courses = await Promise.all(
            courseData.map(async (x) => {
              const currentGroup = x?.user_groups.find(
                (group: any) =>
                  group.class_type.en === 'tutorials' ||
                  group.class_type.en === 'laboratory'
              );

              const resp = await fetch(
                `/trpc/usos.checkCourseStatus?input=${encodeURIComponent(
                  JSON.stringify({
                    subjectName: x.course_name.pl,
                    userId: userId,
                    groupId:
                      currentGroup != undefined
                        ? currentGroup?.group_number
                        : -1,
                  })
                )}`,
                {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json' },
                }
              );
              const currCourse = (await resp.json()).result.data;
              console.log(currCourse);
              let result = {
                course_name: x.course_name,
                course_id: x.course_id,
                term_id: x.term_id,
                user_groups: x.user_groups,
                isChosen: currCourse != undefined,
                fromGroup: 0,
                toGroup: 0,
              };
              if (result.isChosen && currCourse != undefined) {
                if (currCourse?.student1Id == '') {
                  result.fromGroup = currCourse.groupFrom2;
                  result.toGroup = currCourse.groupTo2;
                } else {
                  result.fromGroup = currCourse.groupFrom1;
                  result.toGroup = currCourse.groupTo1;
                }
              }
              return result;
            })
          );
          // Map and fetch data for all subjects
          const data = await Promise.all(
            courses.map(async (subject) => {
              const userGroupsWithEvents = await fetchClassGroups(
                subject.user_groups
              );

              return {
                course_name: subject.course_name,
                course_id: subject.course_id,
                term_id: subject.term_id,
                isChosen: subject.isChosen,
                fromGroup: subject.fromGroup,
                toGroup: subject.toGroup,
                user_groups: userGroupsWithEvents,
              };
            })
          );

          // Update state with fully resolved data
          setSubjects(data);
          setSubjectsHasLoaded(true);
        } catch (error) {
          console.error('Error fetching subject data:', error);
        }
      }
    };

    fetchData();
  }, [check]);
  const [subjectsHasLoaded, setSubjectsHasLoaded] = useState<boolean>(false);

  if (isLoadingCourses || !subjectsHasLoaded) return <Loading />;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
              {t('my_courses')}
            </h1>
            <h2 className="text-xl mt-2 text-gray-700 dark:text-gray-300">
              {currentCourseEdition}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {subjects.map((subject: any) => (
              <Link
                key={subject.course_id}
                to={subject.isChosen ? '#' : '/schedule2'}
                state={{ course_id: subject.course_id }}
                className="block group"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-3">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <h2 className="font-semibold text-xl group-hover:text-primary transition-colors text-gray-800 dark:text-gray-200">
                          {capitalizeWords(
                            i18n.language === 'en'
                              ? subject.course_name.en
                              : subject.course_name.pl
                          )}
                        </h2>
                        <div>
                          {subject.isChosen ? (
                            <h1 className="dark:text-yellow-500 font-semibold text-yellow-500">
                              Trwa zmiana grupy, poczekaj na odświeżenie danych
                              w USOS
                            </h1>
                          ) : (
                            <div className="space-y-3 pt-2">
                              {subject.user_groups.map(
                                (group: any, groupIndex: number) => (
                                  <div
                                    key={groupIndex}
                                    className="flex items-center text-sm text-gray-600 dark:text-gray-400 border-l-2 border-muted dark:border-gray-700 pl-3"
                                  >
                                    {getClassTypeIcon(
                                      group.name[i18n.language]
                                    )}
                                    <span className="font-medium ml-2">
                                      {capitalizeWords(
                                        group.name[i18n.language]
                                      )}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <time className="tabular-nums">
                                      {format(
                                        new Date(group.start_time),
                                        'HH:mm'
                                      )}{' '}
                                      {format(
                                        new Date(group.start_time),
                                        'EEEE'
                                      )}
                                    </time>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </AnimatedPage>
  );
}
