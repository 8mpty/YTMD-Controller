import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllLikes } from "../../services/DatabaseService";

export default function DatabaseModal({ visible, onClose, onClearDatabase }) {
  const [likes, setLikes] = useState([]);
  const { height: screenHeight } = Dimensions.get("window");

  useEffect(() => {
    if (visible) {
      loadLikes();
    }
  }, [visible]);

  const loadLikes = async () => {
    try {
      const allLikes = await getAllLikes();
      setLikes(allLikes || []);
    } catch (error) {
      console.error("Error loading likes:", error);
      setLikes([]);
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
        <View style={[styles.modalContent, { height: screenHeight * 0.7 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Database Management</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, { flex: 0.1 }]}>ID</Text>
              <Text style={[styles.headerText, { flex: 0.4 }]}>Title</Text>
              <Text style={[styles.headerText, { flex: 0.4 }]}>Image Source</Text>
              <Text style={[styles.headerText, { flex: 0.4 }]}>Video ID</Text>
              <Text style={[styles.headerText, { flex: 0.25 }]}>Status</Text>
              <Text style={[styles.headerText, { flex: 0.25 }]}>Updated</Text>
            </View>

            <View style={styles.scrollContainer}>
              <ScrollView>
                {likes.map((like) => (
                  <View key={like.id} style={styles.tableRow}>
                    <Text style={[styles.cellText, { flex: 0.1 }]}>
                      {like.id}
                    </Text>
                    <Text style={[styles.cellText, { flex: 0.4 }]}>
                      {like.title}
                    </Text>
                    <Text style={[styles.cellText, { flex: 0.4 }]} numberOfLines={2}>
                      {like.imgSrc}
                    </Text>
                    <Text style={[styles.cellText, { flex: 0.4 }]}>
                      {like.videoId}
                    </Text>
                    <Text style={[styles.cellText, { flex: 0.25 }]}>
                      {like.like_status ? "Liked" : "Not Liked"}
                    </Text>
                    <Text style={[styles.cellText, { flex: 0.25 }]}>
                      {like.updated_date}
                    </Text>
                  </View>
                ))}
                {likes.length === 0 && (
                  <Text style={styles.emptyText}>No records found</Text>
                )}
              </ScrollView>
            </View>
          </View>

          <View style={styles.footer}>
            {likes.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  if (Platform.OS === "web") {
                    // Web does not support React Native Alert, use window.confirm
                    if (
                      window.confirm(
                        "Are you sure you want to clear all liked tracks? This cannot be undone."
                      )
                    ) {
                      onClearDatabase();
                      loadLikes();
                    }
                  } else {
                    Alert.alert(
                      "Clear Database",
                      "Are you sure you want to clear all liked tracks? This cannot be undone.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Clear",
                          style: "destructive",
                          onPress: async () => {
                            await onClearDatabase();
                            await loadLikes();
                          },
                        },
                      ]
                    );
                  }
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.clearButtonText}>Clear Database</Text>
              </TouchableOpacity>
            )}
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
    width: "70%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#333",
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#222",
  },
  tableRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  cellText: {
    color: "#fff",
    fontSize: 14,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  footer: {
    marginTop: 10,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff4545",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
