import React from 'react';
import styles from './timeslots.module.css';
import { useLocation } from 'react-router-dom';
import { trpc } from '@frontend/utils/trpc';
import { isNullOrUndefined } from 'util';
import { Loading } from '@frontend/components/Loading';
import { AnimatedPage } from '@frontend/components/AnimatedPage';
import { useTranslation } from 'react-i18next';

const Schedule: React.FC = () => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const subjectName = useLocation().state.course_id;
  const { data: currentSemesterInfo } = trpc.usos.current_semester.useQuery();

  const { data: all_my_courses } =
    trpc.usos.courses_user_course_editions.useQuery();
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

  const {
    data: subjectTimeSlots,
    isLoading,
    isError,
  } = trpc.usos.scrape_timetable.useQuery({
    subjectCode: subjectName,
    termCode: currentSemesterInfo?.id,
  });
  console.log('aa', subjectTimeSlots);
  const createPreferenceMutation =
    trpc.preferenceExchange.createPreference.useMutation();
  const deletePreferenceMutation =
    trpc.preferenceExchange.deletePreference.useMutation();

  if (isLoading) return <Loading />;
  if (isError) return <p>Error...</p>;

  const times = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const daysOfWeek = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek'];

  const getTimeOffset = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours - 7) * 60 + minutes; // Adjust for start time at 7:00 AM
  };

  const groupedByDay = daysOfWeek.map((day) => ({
    day,
    events: subjectTimeSlots?.filter((slot) => slot.day === day) || [],
  }));

  const currentGroup = my_course?.user_groups.find(
    (group) =>
      group.class_type.en === 'tutorials' ||
      group.class_type.en === 'laboratory'
  );
  const currentGroupNumber = currentGroup?.group_number || -1;

  console.log('Current user group:', currentGroup);

  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  const groupTimeSlotsByStartTime = (events: typeof subjectTimeSlots) => {
    events.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    const groups: ((typeof subjectTimeSlots)[0] & { span: number })[][] = [];

    for (const task of events) {
      let placed = false;

      const taskToPush = {
        ...task,
        span: 1,
      };

      for (const group of groups) {
        // + 2:00 is temporal as we need to know END TIME

        if (
          timeToMinutes(group[group.length - 1].time) +
            timeToMinutes('02:00') <=
          timeToMinutes(task.time)
        ) {
          group.push(taskToPush);
          placed = true;
          break;
        }
      }

      if (!placed) {
        groups.push([taskToPush]);
      }
    }

    for (let i = 0; i < groups.length; i++) {
      for (let j = 0; j < groups[i].length; j++) {
        const task = groups[i][j];
        const prevGroupEnd =
          i > 0
            ? timeToMinutes(groups[i - 1][groups[i - 1].length - 1].time) +
              timeToMinutes('02:00')
            : null;
        const nextGroupStart =
          i < groups.length - 1 ? timeToMinutes(groups[i + 1][0].time) : null;

        if (
          (prevGroupEnd === null || timeToMinutes(task.time) >= prevGroupEnd) &&
          (nextGroupStart === null ||
            timeToMinutes(task.time) + timeToMinutes('02:00') <= nextGroupStart)
        ) {
          task.span = groups.length;
        }
      }
    }

    return groups;
  };

  const handleClick = async (
    subjectName: string,
    termId: string,
    currentGroupNumber: number,
    desiredGroupNumber: number,
    isAlreadySelected: boolean
  ) => {
    try {
      if (isAlreadySelected) {
        console.log('Deleting preference...');
        await deletePreferenceMutation.mutateAsync({
          subjectName,
          termId,
          currentGroupNumber,
          desiredGroupNumber,
        });
        refetchSavedPreferences();
        console.log('Preference deleted successfully');
      } else {
        console.log('Creating preference...');
        await createPreferenceMutation.mutateAsync({
          subjectName,
          termId,
          currentGroupNumber,
          desiredGroupNumber,
        });
        refetchSavedPreferences();
        console.log('Preference created successfully');
      }
    } catch (error) {
      console.error('Error handling preference:', error);
    }
  };

  return (
    <AnimatedPage>
      <div>
        <h1 className="mx-8 text-5xl mt-4 text-gray-800 dark:text-gray-200">
          {i18n.language === 'en'
            ? my_course?.course_name.en
            : my_course?.course_name.pl}
        </h1>
        <div className="flex p-4">
          <div className="flex flex-col w-16 mt-11">
            {times.map((time) => (
              <div
                key={time}
                className="h-[100px] text-sm text-gray-600 dark:text-gray-400 border-b border-gray-300 dark:border-gray-700 flex items-start justify-end pr-2"
              >
                {time}
              </div>
            ))}
          </div>
          <div className="flex flex-1 gap-4">
            {groupedByDay.map((daySchedule) => {
              const groupedEvents = groupTimeSlotsByStartTime(
                daySchedule.events
              );

              return (
                <div
                  key={daySchedule.day}
                  className="flex-1 border rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  <div className="text-center font-bold bg-gray-200 dark:bg-gray-900 py-2">
                    {t(daySchedule.day)}
                  </div>
                  <div className="relative h-[1120px] border-t border-gray-300 dark:border-gray-700">
                    {groupedEvents.map((events, index) => {
                      const duration = 105 * (100 / 60);
                      const eventWidth = 100 / groupedEvents.length;

                      return events.map((event) => {
                        const time = event.time;
                        const startOffset = getTimeOffset(time) * (100 / 60);
                        const groupNumbers =
                          my_course?.user_groups.map(
                            (group) => group.group_number
                          ) || [];
                        const isUserGroup = groupNumbers.includes(
                          parseInt(event.group)
                        );

                        const isAlreadySelected = !!savedPreferences?.some(
                          (pref) =>
                            pref.desiredGroupNumber === parseInt(event.group) &&
                            pref.termId === currentSemesterInfo?.id &&
                            pref.subjectName === my_course?.course_name.pl
                        );
                        console.log('testik', my_course);
                        return (
                          <div
                            key={`${time}-${index}`}
                            onClick={(e) => {
                              if (!isUserGroup || isAlreadySelected) {
                                handleClick(
                                  my_course?.course_name.pl || '',
                                  currentSemesterInfo?.id || '',
                                  currentGroupNumber,
                                  parseInt(event.group),
                                  isAlreadySelected
                                );
                              }
                            }}
                            className={`absolute ${
                              isUserGroup
                                ? 'bg-green-500 dark:bg-green-800 cursor-not-allowed'
                                : isAlreadySelected
                                ? 'bg-gray-500 dark:bg-gray-700 hover:bg-red-500 dark:hover:bg-red-700 transition-transform duration-300 cursor-pointer'
                                : 'bg-blue-500 dark:bg-blue-700 hover:scale-105 transition-transform duration-300'
                            } text-white rounded-lg shadow-md p-2 text-sm ${
                              styles.buy
                            } overflow-hidden`}
                            style={{
                              top: `${startOffset}px`,
                              height: `${duration}px`,
                              left: `${
                                event.span == 1 ? index * eventWidth : 0
                              }%`,
                              width: `${eventWidth * event.span}%`,
                              fontSize: `${Math.max(
                                8,
                                Math.min(12, eventWidth / 10)
                              )}px`,
                            }}
                          >
                            <div
                              className="font-bold text-lg"
                              style={{
                                fontSize: `${Math.max(
                                  14,
                                  Math.min(15, eventWidth / 10)
                                )}px`,
                              }}
                            >
                              {t(event.type)}
                            </div>
                            <div className="text-xs italic">{event.group}</div>
                            <div className="text-xs mt-1">
                              <span className="font-medium">Location: </span>
                              {event.location}
                            </div>
                            <div className="text-xs mt-1">
                              <span className="font-medium">Time: </span>
                              {event.time}
                            </div>
                            <div className="text-xs mt-1">
                              <span className="font-medium">Mentor: </span>
                              {event.mentor}
                            </div>
                          </div>
                        );
                      });
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Schedule;
