import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  PanResponder,
  Animated,
} from "react-native";

export default function ProgressBar({
  elapsed,
  duration,
  widthPercentage = 100,
  marginRight,
  onSeek,
  baseUrl,
}) {
  const [seekPosition, setSeekPosition] = useState(null);
  const barRef = useRef(null);
  const [barWidth, setBarWidth] = useState(0);
  const thumbPosition = useRef(new Animated.Value(0)).current;
  const [localProgress, setLocalProgress] = useState(0);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (seekPosition === null) {
      const newProgress = (elapsed / duration) * 100;
      setLocalProgress(newProgress);

      Animated.spring(thumbPosition, {
        toValue: (newProgress / 100) * (barWidth || 0),
        useNativeDriver: false,
        bounciness: 0,
      }).start();
    }
  }, [elapsed, duration, barWidth]);

  const calculateProgress = (touchX, width) => {
    const progress = (touchX / width) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (barRef.current) {
        barRef.current.measure((x, y, width) => {
          setBarWidth(width);
          const progress = calculateProgress(evt.nativeEvent.locationX, width);
          setSeekPosition(progress);
          setLocalProgress(progress);

          Animated.spring(thumbPosition, {
            toValue: (progress / 100) * width,
            useNativeDriver: false,
            bounciness: 0,
          }).start();
        });
      }
    },
    onPanResponderMove: (evt) => {
      if (barWidth > 0) {
        const progress = calculateProgress(evt.nativeEvent.locationX, barWidth);
        setSeekPosition(progress);
        setLocalProgress(progress);

        Animated.spring(thumbPosition, {
          toValue: (progress / 100) * barWidth,
          useNativeDriver: false,
          bounciness: 0,
        }).start();
      }
    },
    onPanResponderRelease: async (evt) => {
      if (seekPosition !== null && onSeek && barWidth > 0) {
        const seekSeconds = Math.round((seekPosition / 100) * duration);
        await onSeek(seekSeconds);
        setSeekPosition(null);
      }
    },
  });

  const displayTime =
    seekPosition !== null
      ? formatTime((seekPosition / 100) * duration)
      : formatTime(elapsed);

  const seekProps = baseUrl ? panResponder.panHandlers : {};

  return (
    <View
      style={[
        styles.container,
        {
          marginRight: `${marginRight}`,
          width: `${widthPercentage}%`,
          alignSelf: "center",
        },
      ]}
      {...seekProps}
    >
      <Text style={styles.time}>{displayTime}</Text>
      <View
        ref={barRef}
        style={styles.bar}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setBarWidth(width);
        }}
      >
        <View style={styles.progressBackground} />
        <View
          style={[
            styles.progress,
            {
              width: `${localProgress}%`,
            },
          ]}
        />
        {baseUrl && (
          <Animated.View
            style={[
              styles.thumb,
              {
                transform: [
                  {
                    translateX: thumbPosition.interpolate({
                      inputRange: [0, barWidth],
                      outputRange: [0, barWidth],
                    }),
                  },
                ],
              },
            ]}
          />
        )}
      </View>
      <Text style={styles.time}>{formatTime(duration)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  bar: {
    flex: 1,
    height: 4,
    backgroundColor: "transparent",
    borderRadius: 2,
    marginHorizontal: 10,
    justifyContent: "center",
  },
  progressBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  progress: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#ff2c86",
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    left: -8,
  },
  time: {
    color: "#D3D3D3",
    fontSize: 14,
  },
});
