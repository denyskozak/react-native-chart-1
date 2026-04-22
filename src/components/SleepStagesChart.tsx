import React, { useMemo } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export type SleepStage = 'awake' | 'rem' | 'light' | 'deep';

export type SleepPoint = {
  timestamp: number;
  stage: SleepStage;
};

export type SleepStagesChartProps = {
  data: SleepPoint[];
  startTime?: number;
  endTime?: number;
  height?: number;
  showLabels?: boolean;
  style?: StyleProp<ViewStyle>;
};

type ChartPoint = {
  x: number;
  y: number;
};

type ChartPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const DEFAULT_HEIGHT = 270;
const LABELS_COUNT = 6;
const CARD_RADIUS = 24;
const CHART_INNER_RADIUS = 18;
const MAIN_LINE_STROKE_WIDTH = 9;
const GLOW_LINE_STROKE_WIDTH = 16;
const STAGE_ORDER: SleepStage[] = ['awake', 'rem', 'light', 'deep'];

const COLORS = {
  card: '#121329',
  chartBackdrop: '#1A1C34',
  labelMuted: '#8F92A8',
  labelActive: '#EFF0FF',
  stepLine: '#AEB3FF',
  stepLineGlow: '#6FD7F4',
  bandFillA: '#2A2B45',
  bandFillB: '#222A47',
  bandFillC: '#25203F',
  bandFillD: '#1E1C35',
};

const CHART_PADDING: ChartPadding = {
  top: 16,
  right: 14,
  bottom: 14,
  left: 14,
};

const STAGE_BAND_COLORS: Record<SleepStage, string> = {
  awake: COLORS.bandFillA,
  rem: COLORS.bandFillB,
  light: COLORS.bandFillC,
  deep: COLORS.bandFillD,
};

const STAGE_POSITION: Record<SleepStage, number> = {
  awake: 0,
  rem: 1,
  light: 2,
  deep: 3,
};

const MIN_TIME_RANGE_MS = 1000 * 60;

const sanitizeAndSortData = (data: SleepPoint[]): SleepPoint[] => {
  return [...data]
    .filter((point) => Number.isFinite(point.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp);
};

const clampTimeRange = (startTime: number, endTime: number): { start: number; end: number } => {
  if (endTime - startTime >= MIN_TIME_RANGE_MS) {
    return { start: startTime, end: endTime };
  }

  return { start: startTime, end: startTime + MIN_TIME_RANGE_MS };
};

const normalizeTimeToX = (
  timestamp: number,
  minTimestamp: number,
  maxTimestamp: number,
  innerWidth: number,
): number => {
  const ratio = (timestamp - minTimestamp) / Math.max(maxTimestamp - minTimestamp, MIN_TIME_RANGE_MS);
  return ratio * innerWidth;
};

const getStageY = (stage: SleepStage, innerHeight: number): number => {
  const bands = STAGE_ORDER.length;
  const bandHeight = innerHeight / bands;
  const stageIndex = STAGE_POSITION[stage];
  return stageIndex * bandHeight + bandHeight / 2;
};

const buildStepPath = (points: ChartPoint[]): string => {
  if (points.length === 0) {
    return '';
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];

    path += ` L ${current.x} ${previous.y}`;
    path += ` L ${current.x} ${current.y}`;
  }

  return path;
};

const formatTimeLabel = (timestamp: number): string => {
  const date = new Date(timestamp);
  const rawHours = date.getHours();
  const minutes = date.getMinutes();
  const suffix = rawHours >= 12 ? 'pm' : 'am';
  const normalizedHours = rawHours % 12 || 12;

  if (minutes === 0) {
    return `${normalizedHours} ${suffix}`;
  }

  return `${normalizedHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};

const generateTimeTicks = (
  startTimestamp: number,
  endTimestamp: number,
  count: number,
): Array<{ timestamp: number; key: string }> => {
  const safeCount = Math.max(2, count);
  const span = endTimestamp - startTimestamp;
  const ticks: Array<{ timestamp: number; key: string }> = [];

  for (let i = 0; i < safeCount; i += 1) {
    const ratio = i / (safeCount - 1);
    const timestamp = Math.round(startTimestamp + span * ratio);
    ticks.push({
      timestamp,
      key: `${timestamp}-${i}`,
    });
  }

  const lastIndex = ticks.length - 1;
  ticks[lastIndex] = {
    ...ticks[lastIndex],
    timestamp: endTimestamp,
  };

  return ticks;
};

const toChartPoints = (
  data: SleepPoint[],
  minTimestamp: number,
  maxTimestamp: number,
  width: number,
  height: number,
): ChartPoint[] => {
  return data.map((point) => ({
    x: normalizeTimeToX(point.timestamp, minTimestamp, maxTimestamp, width),
    y: getStageY(point.stage, height),
  }));
};

const withHorizontalPadding = (path: string, left: number, top: number): string => {
  if (!path) {
    return '';
  }

  const tokens = path.split(' ');
  const translated: string[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token === 'M' || token === 'L') {
      translated.push(token);
      const x = Number(tokens[index + 1]);
      const y = Number(tokens[index + 2]);
      translated.push(String(x + left));
      translated.push(String(y + top));
      index += 2;
      continue;
    }

    translated.push(token);
  }

  return translated.join(' ');
};

export const SleepStagesChart: React.FC<SleepStagesChartProps> = ({
  data,
  startTime,
  endTime,
  height = DEFAULT_HEIGHT,
  showLabels = true,
  style,
}) => {
  const [measuredWidth, setMeasuredWidth] = React.useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setMeasuredWidth(event.nativeEvent.layout.width);
  };

  const normalizedData = useMemo(() => sanitizeAndSortData(data), [data]);

  const { boundedStart, boundedEnd } = useMemo(() => {
    const fallbackNow = Date.now();

    const derivedStart =
      startTime ?? normalizedData[0]?.timestamp ?? fallbackNow - 1000 * 60 * 60 * 8;
    const derivedEnd =
      endTime ?? normalizedData[normalizedData.length - 1]?.timestamp ?? fallbackNow;

    const range = clampTimeRange(derivedStart, Math.max(derivedEnd, derivedStart + MIN_TIME_RANGE_MS));

    return {
      boundedStart: range.start,
      boundedEnd: range.end,
    };
  }, [endTime, normalizedData, startTime]);

  const chartWidth = Math.max(measuredWidth, 0);
  const innerWidth = Math.max(chartWidth - CHART_PADDING.left - CHART_PADDING.right, 1);
  const innerHeight = Math.max(height - CHART_PADDING.top - CHART_PADDING.bottom, 1);

  const chartPoints = useMemo(
    () =>
      toChartPoints(normalizedData, boundedStart, boundedEnd, innerWidth, innerHeight).filter(
        (point) => Number.isFinite(point.x) && Number.isFinite(point.y),
      ),
    [boundedStart, boundedEnd, innerHeight, innerWidth, normalizedData],
  );

  const stepPath = useMemo(() => {
    const rawPath = buildStepPath(chartPoints);
    return withHorizontalPadding(rawPath, CHART_PADDING.left, CHART_PADDING.top);
  }, [chartPoints]);

  const ticks = useMemo(
    () => generateTimeTicks(boundedStart, boundedEnd, LABELS_COUNT),
    [boundedEnd, boundedStart],
  );

  return (
    <View style={[styles.card, style]}>
      <View style={styles.plotContainer} onLayout={onLayout}>
        <Svg width="100%" height={height}>
          <Defs>
            <LinearGradient id="sleepLineGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#B8BCFF" />
              <Stop offset="55%" stopColor="#9FB6FF" />
              <Stop offset="100%" stopColor="#71D8F3" />
            </LinearGradient>
          </Defs>

          <Rect
            x={0}
            y={0}
            width={chartWidth}
            height={height}
            rx={CHART_INNER_RADIUS}
            fill={COLORS.chartBackdrop}
          />

          {STAGE_ORDER.map((stage, index) => {
            const bandHeight = innerHeight / STAGE_ORDER.length;
            return (
              <Rect
                key={stage}
                x={CHART_PADDING.left}
                y={CHART_PADDING.top + index * bandHeight}
                width={innerWidth}
                height={bandHeight}
                fill={STAGE_BAND_COLORS[stage]}
                opacity={0.82}
              />
            );
          })}

          {stepPath ? (
            <Path
              d={stepPath}
              stroke={COLORS.stepLineGlow}
              strokeOpacity={0.2}
              strokeWidth={GLOW_LINE_STROKE_WIDTH}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
          ) : null}

          {stepPath ? (
            <Path
              d={stepPath}
              stroke="url(#sleepLineGradient)"
              strokeWidth={MAIN_LINE_STROKE_WIDTH}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
          ) : null}
        </Svg>
      </View>

      {showLabels ? (
        <View style={styles.labelsRow}>
          {ticks.map((tick, index) => {
            const isFirst = index === 0;
            const isLast = index === ticks.length - 1;
            return (
              <Text
                key={tick.key}
                style={[
                  styles.timeLabel,
                  (isFirst || isLast) && styles.edgeTimeLabel,
                  isLast && styles.lastTimeLabel,
                ]}
              >
                {formatTimeLabel(tick.timestamp)}
              </Text>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: CARD_RADIUS,
    backgroundColor: COLORS.card,
    padding: 14,
  },
  plotContainer: {
    borderRadius: CHART_INNER_RADIUS,
    overflow: 'hidden',
  },
  labelsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    color: COLORS.labelMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  edgeTimeLabel: {
    color: COLORS.labelActive,
    backgroundColor: '#0A0C1E',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  lastTimeLabel: {
    letterSpacing: 0.2,
  },
});
