import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAllPlaylists,
  createPlaylist,
  addTrackToPlaylist,
  getPlaylistsContainingTrack,
} from "../services/PlayListDatabaseService";

export default function PlaylistModal({ visible, onClose, track }) {
  const [playlists, setPlaylists] = useState([]);
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [containingPlaylists, setContainingPlaylists] = useState([]);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const modalContentStyle = Platform.OS === 'web' 
    ? [styles.modalContent, { width: screenWidth * 0.65 }]
    : [styles.modalContent, { width: screenWidth * 0.65, height: screenHeight * 0.65 }];


  useEffect(() => {
    if (visible) {
      loadPlaylists();
      checkExistingPlaylists();
    }
  }, [visible, track]);

  const loadPlaylists = async () => {
    try {
      const allPlaylists = await getAllPlaylists();
      setPlaylists(allPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
    }
  };

  const checkExistingPlaylists = async () => {
    if (track?.videoId) {
      try {
        const containing = await getPlaylistsContainingTrack(track.videoId);
        setContainingPlaylists(containing);
      } catch (error) {
        console.error("Error checking existing playlists:", error);
      }
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert("Error", "Please enter a playlist name");
      return;
    }

    try {
      const newPlaylist = await createPlaylist(
        newPlaylistName.trim(),
        newPlaylistDescription.trim()
      );
      if (track) {
        await addTrackToPlaylist(newPlaylist.id, track); // Fixed nid to newPlaylist.id
      }
      setShowNewPlaylistForm(false);
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      loadPlaylists();
      checkExistingPlaylists();
    } catch (error) {
      Alert.alert("Error", "Failed to create playlist");
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addTrackToPlaylist(playlistId, track);
      loadPlaylists();
      checkExistingPlaylists();
      Alert.alert("Success", "Track added to playlist");
    } catch (error) {
      if (error.message === "Track already exists in playlist") {
        Alert.alert("Error", "This track is already in the playlist");
      } else {
        Alert.alert("Error", "Failed to add track to playlist");
      }
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
        <View style={modalContentStyle}>
          <View style={styles.header}>
            <Text style={styles.title}>Playlist</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          <View style={styles.contentContainer}>
            {showNewPlaylistForm ? (
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Playlist Name"
                  placeholderTextColor="#666"
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setShowNewPlaylistForm(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.createButton]}
                    onPress={handleCreatePlaylist}
                  >
                    <Text style={styles.buttonText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.twoColumnLayout}>
                {/* Left Column */}
                <View style={styles.leftColumn}>
                  {track && (
                    <View style={styles.trackInfo}>
                      <Text style={styles.trackTitle} numberOfLines={2}>
                        Track: {track.title}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.newPlaylistButton}
                    onPress={() => setShowNewPlaylistForm(true)}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color="#fff"
                    />
                    <Text style={styles.newPlaylistText}>
                      New Playlist
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Right Column */}
                <View style={styles.rightColumn}>
                  <ScrollView style={styles.playlistsContainer}>
                    {playlists.map((playlist) => (
                      <TouchableOpacity
                        key={playlist.id}
                        style={[
                          styles.playlistItem,
                          containingPlaylists.some(
                            (p) => p.id === playlist.id
                          ) && styles.playlistItemDisabled,
                        ]}
                        onPress={() => handleAddToPlaylist(playlist.id)}
                        disabled={containingPlaylists.some(
                          (p) => p.id === playlist.id
                        )}
                      >
                        <View style={styles.playlistInfo}>
                          <Text style={styles.playlistName} numberOfLines={1}>
                            {playlist.name}
                          </Text>
                          <Text style={styles.trackCount}>
                            {playlist.tracks.length} tracks
                          </Text>
                        </View>
                        {containingPlaylists.some(
                          (p) => p.id === playlist.id
                        ) ? (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color="#4CAF50"
                          />
                        ) : (
                          <Ionicons name="add" size={20} color="#666666" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    padding: 16,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "65vw",
    maxWidth: "800px",
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
    minHeight: 0,
  },
  twoColumnLayout: {
    flexDirection: "row",
    gap: 20,
    flex: 1,
    height: "100%",
    minHeight: 0,
  },
  leftColumn: {
    flex: 1,
    maxWidth: "35%",
    // paddingRight: 16,
    display: "flex",
    flexDirection: "column",
  },
  rightColumn: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: "#333",
    // paddingLeft: 16,
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingRight: 8,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  trackInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  trackTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  playlistsContainer: {
    flex: 1,
    maxHeight: "250px", // Shows roughly 2-3 playlists
    overflowY: "auto",
    paddingRight: 8, // Space for scrollbar
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 72,
  },
  playlistItemDisabled: {
    opacity: 0.5,
  },
  playlistInfo: {
    flex: 1,
    marginRight: 12,
  },
  playlistName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  trackCount: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  newPlaylistButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff2c86",
    padding: 15,
    borderRadius: 8,
    gap: 8,
    marginTop: 0,
  },
  newPlaylistText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  formContainer: {
    marginTop: 16,
    padding: 16,
  },
  input: {
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    marginBottom: 16,
    width: "100%",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#333",
  },
  createButton: {
    backgroundColor: "#ff2c86",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  // Custom scrollbar styling
  "@global": {
    ".playlistsContainer::-webkit-scrollbar": {
      width: "6px",
    },
    ".playlistsContainer::-webkit-scrollbar-track": {
      background: "#1a1a1a",
      borderRadius: "3px",
    },
    ".playlistsContainer::-webkit-scrollbar-thumb": {
      background: "#333",
      borderRadius: "3px",
    },
    ".playlistsContainer::-webkit-scrollbar-thumb:hover": {
      background: "#444",
    },
  },
});