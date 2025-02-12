import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProgressBar from "./ProgressBar";

export default function BottomBar({
  songInfo,
  onExpand,
  isLiked,
  onLikeToggle,
  onPrevious,
  onNext,
  onPlayPause,
  onSeek,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <ProgressBar
        elapsed={songInfo.elapsedSeconds}
        duration={songInfo.songDuration}
        widthPercentage={95}
        onSeek={onSeek}
      />
      <View style={styles.content}>
        <TouchableOpacity style={styles.songInfo} onPress={onExpand}>
          <Image source={{ uri: songInfo.imageSrc }} style={styles.thumbnail} />
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {songInfo.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1} ellipsizeMode="tail">
              {songInfo.artist}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={onLikeToggle}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#ff4545" : "#666666"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={onPrevious}>
            <Ionicons name="play-skip-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={onPlayPause}>
            <Ionicons
              name={songInfo.isPaused ? "play" : "pause"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={onNext}>
            <Ionicons name="play-skip-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  songInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 20,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  artist: {
    color: "#888",
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  controlButton: {
    padding: 5,
  },
});