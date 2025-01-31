import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../context/ApiContext";
import * as Clipboard from "expo-clipboard";

const InfoText = ({ label, text, onCopy }) => (
  <Text style={styles.infoText}>
    <Text style={styles.label}>{label}: </Text>
    {text}
    {onCopy && (
      <TouchableOpacity onPress={() => onCopy(text)}>
        <Ionicons
          name="copy-outline"
          size={20}
          color="#ff2c86"
          style={styles.copyIcon}
        />
      </TouchableOpacity>
    )}
  </Text>
);

export default function VideoInformationModal({ visible, onClose }) {
  const { getBaseUrl } = useApi();
  const [videoInfo, setVideoInfo] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchVideoInfo();
    }
  }, [visible]);

  const fetchVideoInfo = async () => {
    const baseUrl = getBaseUrl();
    if (!baseUrl) return;

    try {
      const response = await fetch(`${baseUrl}/api/v1/song`);
      if (!response.ok) throw new Error("Failed to fetch video data");

      const data = await response.json();

      const minutes = Math.floor(data.songDuration / 60);
      const seconds = String(data.songDuration % 60).padStart(2, "0");

      setVideoInfo({
        title: data.title,
        artist: data.artist,
        album: data.album,
        uploadDate: new Date(data.uploadDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        imageSrc: data.imageSrc,
        songDuration: `${minutes}:${seconds} Minutes`,
        url: data.url,
        videoId: data.videoId,
      });
    } catch (error) {
      console.error("Error fetching video info:", error);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert("Copied", "The text has been copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  if (!videoInfo) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={["landscape", "landscape-left", "landscape-right"]}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Video Information</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <InfoText
              label="Title"
              text={videoInfo.title}
              onCopy={copyToClipboard}
            />
            <InfoText
              label="Artist"
              text={videoInfo.artist}
              onCopy={copyToClipboard}
            />
            <InfoText
              label="Album"
              text={videoInfo.album}
              onCopy={copyToClipboard}
            />
            <InfoText label="Upload Date" text={videoInfo.uploadDate} />
            <InfoText label="Duration" text={videoInfo.songDuration} />
            <InfoText
              label="Video ID"
              text={videoInfo.videoId}
              onCopy={copyToClipboard}
            />
            <InfoText
              label="Video URL"
              text={videoInfo.url}
              onCopy={copyToClipboard}
            />
            <InfoText
              label="Image Source"
              text={videoInfo.imageSrc}
              onCopy={copyToClipboard}
            />
          </View>
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
  modalContent: {
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    width: "60%",
    padding: 20,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 5,
  },
  infoContainer: {
    width: "100%",
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
    color: "#BBB",
  },
  linkText: {
    color: "#1E90FF",
    textDecorationLine: "underline",
    fontSize: 16,
    marginTop: 10,
  },
  copyIcon: {
    marginLeft: 5,
  },
});
