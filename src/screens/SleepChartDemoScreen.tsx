import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SleepStagesChart } from '../components/SleepStagesChart';
import { createDefaultSleepDemoData } from '../utils/sleepChartDemoData';

const { data, startTime, endTime } = createDefaultSleepDemoData();

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
