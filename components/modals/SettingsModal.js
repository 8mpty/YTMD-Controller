import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsModal({
  visible,
  onClose,
  onConfigureIP,
  onManageDatabase,
  onViewAppInfo,
}) {
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
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            <TouchableOpacity style={styles.option} onPress={onConfigureIP}>
              <Ionicons
                name="construct-outline"
                size={24}
                color="#fff"
                style={styles.optionIcon}
              />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Configure IP Settings</Text>
                <Text style={styles.optionDescription}>
                  Change connection details
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={onManageDatabase}>
              <Ionicons
                name="server-outline"
                size={24}
                color="#fff"
                style={styles.optionIcon}
              />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>Manage Database</Text>
                <Text style={styles.optionDescription}>
                  View and manage liked tracks
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={onViewAppInfo}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#fff"
                style={styles.optionIcon}
              />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionText}>App Information</Text>
                <Text style={styles.optionDescription}>
                  View app information
                </Text>
              </View>
            </TouchableOpacity>
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
  options: {
    gap: 15,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#222",
    borderRadius: 8,
  },
  optionIcon: {
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  optionDescription: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
});
