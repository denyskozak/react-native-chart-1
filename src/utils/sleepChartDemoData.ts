import { SleepPoint, SleepStage } from '../components/SleepStagesChart';

const MINUTE = 60 * 1000;

type SleepSegment = {
  minuteOffset: number;
  stage: SleepStage;
};

const BASE_SEQUENCE: SleepSegment[] = [
  { minuteOffset: 0, stage: 'light' },
  { minuteOffset: 62, stage: 'awake' },
  { minuteOffset: 70, stage: 'deep' },
  { minuteOffset: 73, stage: 'light' },
  { minuteOffset: 163, stage: 'rem' },
  { minuteOffset: 180, stage: 'deep' },
  { minuteOffset: 184, stage: 'light' },
  { minuteOffset: 272, stage: 'awake' },
  { minuteOffset: 282, stage: 'deep' },
  { minuteOffset: 286, stage: 'light' },
  { minuteOffset: 356, stage: 'rem' },
  { minuteOffset: 370, stage: 'deep' },
  { minuteOffset: 374, stage: 'light' },
  { minuteOffset: 428, stage: 'rem' },
  { minuteOffset: 442, stage: 'deep' },
  { minuteOffset: 446, stage: 'light' },
  { minuteOffset: 487, stage: 'awake' },
  { minuteOffset: 506, stage: 'rem' },
  { minuteOffset: 532, stage: 'awake' },
  { minuteOffset: 552, stage: 'awake' },
];

export const createSleepDemoData = (startTimestamp: number): SleepPoint[] => {
  return BASE_SEQUENCE.map((segment) => ({
    timestamp: startTimestamp + segment.minuteOffset * MINUTE,
    stage: segment.stage,
  }));
};

export const createDefaultSleepDemoData = (): { data: SleepPoint[]; startTime: number; endTime: number } => {
  const startTime = new Date(2026, 3, 21, 1, 30, 0, 0).getTime();
  const data = createSleepDemoData(startTime);
  const endTime = data[data.length - 1]?.timestamp ?? startTime;

  return {
    data,
    startTime,
    endTime,
  };
};
