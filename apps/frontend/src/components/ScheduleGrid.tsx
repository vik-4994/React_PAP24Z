import React from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '@frontend/utils/trpc';
import { TimeSlot } from '@frontend/components/Timeslot';

const daysOfWeek = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek'];
const times = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 7;
  return `${hour.toString().padStart(2, '0')}:00`;
});

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function groupTimeSlotsByStartTime(events: any[]) {
  events.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  const groups: any[][] = [];

  for (const event of events) {
    let placed = false;

    for (const group of groups) {
      if (
        timeToMinutes(group[group.length - 1].time) + 120 <=
        timeToMinutes(event.time)
      ) {
        event.span = 1;
        group.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      event.span = 1;
      groups.push([event]);
    }
  }

  groups.forEach((group) => {
    group.forEach((event, index) => {
      let maxOverlap = 1;

      groups.forEach((otherGroup) => {
        if (group !== otherGroup) {
          otherGroup.forEach((otherEvent) => {
            const eventStart = timeToMinutes(event.time);
            const eventEnd = eventStart + 120;

            const otherEventStart = timeToMinutes(otherEvent.time);
            const otherEventEnd = otherEventStart + 120;

            if (
              (eventStart < otherEventEnd && eventEnd > otherEventStart) ||
              (eventStart >= otherEventStart && eventEnd <= otherEventEnd)
            ) {
              maxOverlap++;
            }
          });
        }
      });

      event.span = groups.length / maxOverlap;
    });
  });

  return groups;
}

export const ScheduleGrid: React.FC<{
  subjectTimeSlots: any;
  currentSemesterInfo: any;
  my_course: any;
  savedPreferences: any;
  refetchSavedPreferences: () => void;
}> = ({
  subjectTimeSlots,
  currentSemesterInfo,
  my_course,
  savedPreferences,
  refetchSavedPreferences,
}) => {
  const { t } = useTranslation();
  const createPreferenceMutation =
    trpc.preferenceExchange.createPreference.useMutation();
  const deletePreferenceMutation =
    trpc.preferenceExchange.deletePreference.useMutation();

  const groupedByDay = daysOfWeek.map((day) => ({
    day,
    events: groupTimeSlotsByStartTime(
      subjectTimeSlots?.filter((slot: any) => slot.day === day) || []
    ),
  }));
  console.log('azaz', my_course.user_groups);
  const currentGroup = my_course?.user_groups.find(
    (group: any) =>
      group.class_type.en === 'tutorials' ||
      group.class_type.en === 'laboratory'
  );
  const currentGroupNumber = currentGroup?.group_number || -1;

  const handleClick = async (
    subjectName: string,
    termId: string,
    currentGroupNumber: number,
    desiredGroupNumber: number,
    isAlreadySelected: boolean
  ) => {
    try {
      if (isAlreadySelected) {
        await deletePreferenceMutation.mutateAsync({
          subjectName,
          termId,
          currentGroupNumber,
          desiredGroupNumber,
        });
      } else {
        await createPreferenceMutation.mutateAsync({
          subjectName,
          termId,
          currentGroupNumber,
          desiredGroupNumber,
        });
      }
      refetchSavedPreferences();
    } catch (error) {
      console.error('Error handling preference:', error);
    }
  };

  console.log(groupedByDay);

  return (
    <div className="flex p-4 overflow-x-auto">
      <div className="flex flex-col w-16 mt-11 flex-shrink-0">
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
        {groupedByDay.map((daySchedule) => (
          <div
            key={daySchedule.day}
            className="flex-1 border rounded-lg bg-gray-100 dark:bg-gray-800 min-w-[200px]"
          >
            <div className="text-center font-bold bg-gray-200 dark:bg-gray-900 py-2">
              {t(daySchedule.day)}
            </div>
            <div className="relative h-[1120px] border-t border-gray-300 dark:border-gray-700">
              {daySchedule.events.map((group: any[], groupIndex: number) => (
                <React.Fragment key={groupIndex}>
                  {group.map((event: any, eventIndex: number) => (
                    <TimeSlot
                      key={`${event.time}-${eventIndex}`}
                      event={event}
                      my_course={my_course}
                      currentSemesterInfo={currentSemesterInfo}
                      currentGroupNumber={currentGroupNumber}
                      savedPreferences={savedPreferences}
                      handleClick={handleClick}
                      width={(100 / daySchedule.events.length) * event.span}
                      left={
                        event.span == 1
                          ? groupIndex * (100 / daySchedule.events.length)
                          : 0
                      }
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
