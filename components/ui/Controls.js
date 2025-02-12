import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import VolumeDialog from "../modals/VolumeModal";
import createApiService from "../../services/apiService";

const Controls = forwardRef(
  ({ isPaused, baseUrl, onLyricsToggle, showLyrics }, ref) => {
    const [repeatMode, setRepeatMode] = useState("NONE");
    const [isShuffled, setIsShuffled] = useState(false);
    const [volume, setVolume] = useState(50);
    const [showVolumeDialog, setShowVolumeDialog] = useState(false);
    const api = createApiService(baseUrl);

    const fetchStates = async () => {
      try {
        const repeatResponse = await api.getRepeatMode();
        setRepeatMode(repeatResponse.mode);

        const shuffleResponse = await api.getShuffle();
        setIsShuffled(shuffleResponse.state);

        const volumeResponse = await api.getVolume();
        setVolume(volumeResponse.state);

      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    const fetchVolumeState = async () => {
      try {
        const response = await api.getVolume();
        setVolume(response.state);
      } catch (error) {
        console.error("Error fetching volume state:", error);
      }
    };

    const handleVolumeButtonClick = async () => {
      await fetchVolumeState();
      setShowVolumeDialog(true);
    };

    useImperativeHandle(ref, () => ({
      fetchInitialStates: fetchStates,
    }));

    useEffect(() => {
      fetchStates();
    }, []);

    const handleRepeatToggle = async () => {
      try {
        await api.switchRepeat(1);
        await fetchStates();
      } catch (error) {
        console.error("Error toggling repeat:", error);
      }
    };

    const handleShuffle = async () => {
      try {
        await api.toggleShuffle();
        await fetchStates();
      } catch (error) {
        console.error("Error toggling shuffle:", error);
      }
    };

    const handleControl = async (endpoint) => {
      try {
        await fetch(`${baseUrl}/api/v1/${endpoint}`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error controlling playback:", error);
      }
    };

    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleVolumeButtonClick}
          style={styles.button}
        >
          <Ionicons
            name={
              volume === 0
                ? "volume-mute"
                : volume < 50
                ? "volume-low"
                : "volume-high"
            }
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRepeatToggle} style={styles.button}>
          <View style={styles.repeatContainer}>
            <Ionicons
              name="repeat"
              size={24}
              color={repeatMode === "NONE" ? "#666666" : "#ffffff"}
            />
            {repeatMode === "ONE" && <Text style={styles.repeatOne}>1</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleControl("previous")}
          style={styles.button}
        >
          <Ionicons name="play-skip-back" size={40} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleControl("toggle-play")}
          style={styles.button}
        >
          <Ionicons
            name={isPaused ? "play-circle" : "pause-circle"}
            size={60}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleControl("next")}
          style={styles.button}
        >
          <Ionicons name="play-skip-forward" size={40} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShuffle} style={styles.button}>
          <Ionicons
            name="shuffle"
            size={24}
            color={isShuffled ? "#ffffff" : "#666666"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onLyricsToggle} style={styles.button}>
          <Ionicons
            name="list-outline"
            size={24}
            color={showLyrics ? "#ffffff" : "#666666"}
          />
        </TouchableOpacity>

        <VolumeDialog
          visible={showVolumeDialog}
          initialVolume={volume}
          baseUrl={baseUrl}
          onClose={() => setShowVolumeDialog(false)}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
    marginTop: 10,
    position: "relative",
  },
  button: {
    padding: 5,
  },
  repeatContainer: {
    position: "relative",
    width: 24,
    height: 24,
  },
  repeatOne: {
    position: "absolute",
    right: -8,
    top: -8,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#000",
    width: 16,
    height: 16,
    textAlign: "center",
    lineHeight: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default Controls;
