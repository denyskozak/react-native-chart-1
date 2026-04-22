import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SleepPoint, SleepStage, SleepStagesChart } from '../components/SleepStagesChart';

type TimelineItem = {
  stage: SleepStage;
  duration_min: number;
  percentage: number;
};

const timeline: TimelineItem[] = [
  { stage: 'light', duration_min: 61, percentage: 10.9 },
  { stage: 'deep', duration_min: 5, percentage: 0.9 },
  { stage: 'rem', duration_min: 23, percentage: 4.1 },
  { stage: 'light', duration_min: 51, percentage: 9.1 },
  { stage: 'light', duration_min: 51, percentage: 9.1 },
  { stage: 'deep', duration_min: 6, percentage: 1.1 },
  { stage: 'rem', duration_min: 23, percentage: 4.1 },
  { stage: 'light', duration_min: 40, percentage: 7.1 },
  { stage: 'light', duration_min: 41, percentage: 7.3 },
  { stage: 'deep', duration_min: 6, percentage: 1.1 },
  { stage: 'rem', duration_min: 23, percentage: 4.1 },
  { stage: 'light', duration_min: 30, percentage: 5.3 },
  { stage: 'light', duration_min: 31, percentage: 5.5 },
  { stage: 'deep', duration_min: 6, percentage: 1.1 },
  { stage: 'rem', duration_min: 23, percentage: 4.1 },
  { stage: 'light', duration_min: 20, percentage: 3.6 },
  { stage: 'light', duration_min: 21, percentage: 3.7 },
  { stage: 'deep', duration_min: 6, percentage: 1.1 },
  { stage: 'rem', duration_min: 23, percentage: 4.1 },
  { stage: 'light', duration_min: 10, percentage: 1.8 },
  { stage: 'light', duration_min: 11, percentage: 2.0 },
  { stage: 'deep', duration_min: 6, percentage: 1.1 },
  { stage: 'rem', duration_min: 24, percentage: 4.3 },
  { stage: 'awake', duration_min: 11, percentage: 2.0 },
];

const MINUTE_IN_MS = 60 * 1000;

const createChartDataFromTimeline = (
  items: TimelineItem[],
  startTimestamp: number,
): { data: SleepPoint[]; startTime: number; endTime: number } => {
  const data: SleepPoint[] = [];
  let elapsedMinutes = 0;

  items.forEach((item) => {
    data.push({
      timestamp: startTimestamp + elapsedMinutes * MINUTE_IN_MS,
      stage: item.stage,
    });

    elapsedMinutes += item.duration_min;
  });

  return {
    data,
    startTime: startTimestamp,
    endTime: startTimestamp + elapsedMinutes * MINUTE_IN_MS,
  };
};

const { data, startTime, endTime } = createChartDataFromTimeline(
  timeline,
  new Date(2026, 3, 21, 1, 30, 0, 0).getTime(),
);

export const SleepChartDemoScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Sleep Stages Breakdown</Text>

        <SleepStagesChart data={data} startTime={startTime} endTime={endTime} height={280} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0D22',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    color: '#F2F4FF',
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 18,
    letterSpacing: 0.3,
  },
});
