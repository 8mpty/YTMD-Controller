import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Slider from "@react-native-community/slider";

export default function ProgressBar({
  elapsed,
  duration,
  widthPercentage = 100,
  marginRight,
  onSeek,
}) {
  const [localElapsed, setLocalElapsed] = useState(elapsed);

  if (elapsed !== localElapsed ) {
    setLocalElapsed(elapsed);
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleValueChange = (value) => {
    setLocalElapsed(value);
  };

  const handleSlidingComplete = (value) => {
    onSeek(Math.floor(value));
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
      <Text style={styles.time}>{formatTime(localElapsed)}</Text>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={localElapsed}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor="#ff2c86"
          maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
          thumbTintColor="#fff"
        />
      </View>
      <Text style={styles.time}>{formatTime(duration)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  slider: {
    width: "100%",
    height: 25,
  },
  time: {
    color: "#D3D3D3",
    fontSize: 14,
  },
});