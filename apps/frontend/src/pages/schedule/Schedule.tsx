import type React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trpc } from '@frontend/utils/trpc';
import { Loading } from '@frontend/components/Loading';
import { AnimatedPage } from '@frontend/components/AnimatedPage';
import { ScheduleGrid } from '@frontend/components/ScheduleGrid';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Schedule: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state } = useLocation();
  const subjectName = state.course_id;

  const { data: currentSemesterInfo } = trpc.usos.current_semester.useQuery();
  const { data: all_my_courses } =
    trpc.usos.courses_user_course_editions.useQuery();
  const {
    data: subjectTimeSlots,
    isLoading,
    isError,
  } = trpc.usos.scrape_timetable.useQuery({
    subjectCode: subjectName,
    termCode: currentSemesterInfo?.id,
  });

  const my_courses =
    all_my_courses?.course_editions[currentSemesterInfo?.id] || [];
  const my_course = my_courses.find(
    (course) => course.course_id === subjectName
  );

  const { data: savedPreferences, refetch: refetchSavedPreferences } =
    trpc.preferenceExchange.getPreferences.useQuery(
      {
        termId: currentSemesterInfo?.id || '',
        subjectName: my_course?.course_name.pl || '',
      },
      {
        enabled: !!currentSemesterInfo?.id && !!my_course?.course_name.pl,
      }
    );

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading schedule data</p>;

  return (
    <AnimatedPage>
      <Card className="m-4">
        <CardHeader>
          {subjectName}
          <CardTitle className="text-3xl">
            {i18n.language === 'en'
              ? my_course?.course_name.en
              : my_course?.course_name.pl}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleGrid
            subjectTimeSlots={subjectTimeSlots}
            currentSemesterInfo={currentSemesterInfo}
            my_course={my_course}
            savedPreferences={savedPreferences}
            refetchSavedPreferences={refetchSavedPreferences}
          />
        </CardContent>
      </Card>
    </AnimatedPage>
  );
};

export default Schedule;
