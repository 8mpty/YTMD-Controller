import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppInfoModal({ visible, onClose }) {
  const handleLinkPress = (url) => {
    Linking.openURL(url);
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
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>App Information</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
          <View style={styles.infoSection}>
              <Text style={styles.label}>Project Name</Text>
              <TouchableOpacity
                onPress={() => handleLinkPress("https://github.com/8mpty/YTMD-Controller")}
              >
                <Text style={styles.link}>YTMD-Controller</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.label}>Created By</Text>
              <TouchableOpacity
                onPress={() => handleLinkPress("https://github.com/8mpty")}
              >
                <Text style={styles.link}>@8mpty</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.label}>References & Thanks</Text> 
              <View style={styles.referenceList}>
                <View style={styles.reference}>
                  <Text style={styles.referenceLabel}>API/Backend: </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleLinkPress("https://github.com/th-ch/youtube-music")
                    }
                  >
                    <Text style={styles.link}>@th-ch / youtube-music</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.reference}>
                  <Text style={styles.referenceLabel}>Lyrics: </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleLinkPress("https://github.com/tranxuanthang/lrcget")
                    }
                  >
                    <Text style={styles.link}>@tranxuanthang / lrcget</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
    width: "50%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
    gap: 20,
  },
  infoSection: {
    gap: 8,
  },
  label: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    color: "#fff",
    fontSize: 16,
  },
  link: {
    color: "#ff2c86",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  referenceList: {
    gap: 12,
  },
  reference: {
    flexDirection: "row",
    alignItems: "center",
  },
  referenceLabel: {
    color: "#fff",
    fontSize: 16,
  },
});
