import type React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User } from 'lucide-react';

const getTimeOffset = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours - 7) * 60 + minutes;
};

interface TimeSlotProps {
  event: any;
  my_course: any;
  currentSemesterInfo: any;
  currentGroupNumber: number;
  savedPreferences: any;
  handleClick: (
    subjectName: string,
    termId: string,
    currentGroupNumber: number,
    desiredGroupNumber: number,
    isAlreadySelected: boolean
  ) => void;
  width: number;
  left: number;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  event,
  my_course,
  currentSemesterInfo,
  currentGroupNumber,
  savedPreferences,
  handleClick,
  width,
  left,
}) => {
  const { t } = useTranslation();
  const startOffset = getTimeOffset(event.time) * (100 / 60);
  const duration = 105 * (100 / 60);

  const groupNumbers =
    my_course?.user_groups.map((group: any) => group.group_number) || [];
  const isUserGroup = groupNumbers.includes(Number.parseInt(event.group));

  const isAlreadySelected = savedPreferences?.some(
    (pref: any) =>
      pref.desiredGroupNumber === Number.parseInt(event.group) &&
      pref.termId === currentSemesterInfo?.id &&
      pref.subjectName === my_course?.course_name.pl
  );

  const cardVariant = isUserGroup
    ? 'bg-green-300 dark:bg-green-600 border-green-500'
    : isAlreadySelected
    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 hover:scale-105 dark:hover:bg-red-900 hover:border-red-500'
    : 'bg-gray-100 dark:bg-gray-800 border-gray-500 hover:bg-red-100 dark:hover:bg-red-900 hover:border-red-500';

  return (
    <Card
      onClick={() => {
        if (!isUserGroup || isAlreadySelected) {
          handleClick(
            my_course?.course_name.pl || '',
            currentSemesterInfo?.id || '',
            currentGroupNumber,
            Number.parseInt(event.group),
            isAlreadySelected
          );
        }
      }}
      className={cn(
        'absolute p-2 text-sm rounded-lg shadow-md overflow-hidden transition-all duration-300',
        cardVariant,
        isUserGroup ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      style={{
        top: `${startOffset}px`,
        height: `${duration}px`,
        width: `${width}%`,
        left: `${left}%`,
      }}
    >
      <CardHeader className="p-2">
        <CardTitle className="text-sm font-bold">{t(event.type)}</CardTitle>
        <Badge variant="secondary" className="w-fit">
          {event.group}
        </Badge>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="flex flex-col gap-1 text-xs">
          {/* <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{event.location}</span>
          </div> */}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{event.mentor}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
