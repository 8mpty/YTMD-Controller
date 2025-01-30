import React from "react";
import { View, StyleSheet, Text } from "react-native";

export default function ProgressBar({
  elapsed,
  duration,
  widthPercentage = 100,
  marginRight,
}) {
  const progress = (elapsed / duration) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
    >
      <Text style={styles.time}>{formatTime(elapsed)}</Text>
      <View style={styles.bar}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
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
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 1,
    marginHorizontal: 10,
  },
  progress: {
    height: "100%",
    backgroundColor: "#ff2c86",
    borderRadius: 1,
  },
  time: {
    color: "#D3D3D3",
    fontSize: 14,
  },
});
