import React, { useEffect } from 'react';
import { useState } from 'react';
import { trpc } from '@frontend/utils/trpc';
import { AnimatedPage } from '@frontend/components/AnimatedPage';
import SkeletonLoader from '@frontend/components/SkeletonLoader';
import { useTranslation } from 'react-i18next';
import { UsosApiUrls } from '@backend/services/usos/apiUrls';

const determineEventType = (eventType: string): string => {
  switch (eventType.toLowerCase()) {
    case 'lectures':
      return 'lecture';
    case 'laboratory':
      return 'lab';
    default:
      return 'other';
  }
};

const EventCard: React.FC<{
  group: {
    class_type_id: string;
    class_type: { en: string; pl: string };
    course_unit_id: string;
    group_number: number;
  };
  courseName: { en: string; pl: string };
  t: Function;
  dayFilter: string;
}> = ({ group, courseName, t, dayFilter }) => {
  const { data, isLoading, isError } = trpc.usos.classGroup.useQuery({
    unit_id: group.course_unit_id,
    group_number: group.group_number.toString(),
  });
  const { i18n } = useTranslation();

  if (isLoading) return <SkeletonLoader />;
  if (isError || !(data.length > 0)) {
    console.error('No lessons soon');
    return null;
  }

  const events = data.map((event: UsosApiUrls['services/tt/classgroup']['reply']) => {
    const eventDate = new Date(event.start_time);
    const eventDay = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
    const eventStartTime = eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const eventEndTime = new Date(event.end_time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return {
      title: i18n.language === 'en' ? courseName.en : courseName.pl,
      group: `${t('group')} ${group.group_number}`,
      startTime: eventStartTime,
      endTime: eventEndTime,
      color: determineEventType(event.name.en),
      type: i18n.language === 'en' ? event.name.en : event.name.pl,
      day: t(eventDay.toLowerCase()),
    };
  });

  const filteredEvents = events
    .filter((event: { day: string }) => event.day === dayFilter)
    .sort((a: { startTime: any }, b: { startTime: any }) => new Date(`1970/01/01 ${a.startTime}`).getTime() - new Date(`1970/01/01 ${b.startTime}`).getTime());

  return (
    <>
      {filteredEvents.map(
        (
          event: {
            color: string;
            title: React.ReactNode;
            type: React.ReactNode;
            group: React.ReactNode;
            startTime: React.ReactNode;
            endTime: React.ReactNode;
          },
          index: React.Key | null | undefined
        ) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 mb-2 border-l-4 ${
              event.color === 'lecture'
                ? 'border-blue-500'
                : event.color === 'lab'
                ? 'border-green-500'
                : 'border-orange-500'
            }`}
          >
            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">{event.title}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">{event.type}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{event.group}</p>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
              {event.startTime} - {event.endTime}
            </p>
          </div>
        )
      )}
    </>
  );
};

const ScheduleRenderer: React.FC<{
  courseData: {
    course_editions: {
      [termId: string]: {
        course_name: { en: string; pl: string };
        user_groups: Array<{
          class_type_id: string;
          class_type: { en: string; pl: string };
          course_unit_id: string;
          group_number: number;
        }>;
      }[];
    };
  };
}> = ({ courseData }) => {
  const { t } = useTranslation();
  const daysOfWeek = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday')];

  const currentTerm = Object.values(courseData.course_editions).slice(-1)[0];

  if (!currentTerm)
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
        {daysOfWeek.map((day) => (
          <SkeletonLoader key={day} />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
      {daysOfWeek.map((day) => (
        <div key={day} className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
          <h2 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200">{day}</h2>
          <div className="space-y-2">
            {currentTerm.map((groups) =>
              groups.user_groups.map((group, index) => (
                <EventCard key={index} group={group} courseName={groups.course_name} t={t} dayFilter={day} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const MinimalisticSchedule: React.FC = () => {
  const { t } = useTranslation();
  const {
    data: courseData,
    isLoading: isLoadingCourses,
    isError: isErrorCourses,
  } = trpc.usos.courses_user_course_editions.useQuery();

  if (isErrorCourses)
    return <p className="text-center p-4 text-red-500 dark:text-red-300">{t('error_loading_course_data')}</p>;

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">{t('weekly_schedule')}</h1>
        {isLoadingCourses ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonLoader key={index} />
            ))}
          </div>
        ) : (
          <ScheduleRenderer courseData={courseData} />
        )}
      </div>
    </AnimatedPage>
  );
};

export default MinimalisticSchedule;
