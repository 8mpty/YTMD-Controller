import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Modal, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import createApiService from "../services/apiService";

export default function VolumeDialog({
  initialVolume,
  baseUrl,
  visible,
  onClose,
}) {
  const [volume, setVolume] = useState(initialVolume);
  const api = createApiService(baseUrl);

  useEffect(() => {
    setVolume(initialVolume);
  }, [initialVolume]);

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
  };

  const handleSlidingComplete = async (finalVolume) => {
    try {
      await api.setVolume(finalVolume);
    } catch (error) {
      console.error("Error setting volume:", error);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={["landscape", "landscape-left", "landscape-right"]}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title}>Volume</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.value}>{Math.round(volume)}%</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={volume}
            onValueChange={handleVolumeChange}
            onSlidingComplete={handleSlidingComplete}
            minimumTrackTintColor="#ff2c86"
            maximumTrackTintColor="#555"
            thumbTintColor="#fff"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: "rgba(20, 20, 20, 0.95)",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    width: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  value: {
    color: "#ff2c86",
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 15,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  closeButton: {
    padding: 5,
  },
});
