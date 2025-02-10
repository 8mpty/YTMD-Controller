import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getAllPlaylists,
  deletePlaylist,
  removeTrackFromPlaylist,
} from "../services/PlayListDatabaseService";
import PlaylistModal from "./PlaylistModal";
import { useApi } from "../context/ApiContext";
import createApiService from "../services/apiService";

export default function Library() {
  const { getBaseUrl } = useApi();
  const api = createApiService(getBaseUrl());
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const allPlaylists = await getAllPlaylists();
      setPlaylists(allPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    Alert.alert(
      "Delete Playlist",
      "Are you sure you want to delete this playlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlaylist(playlistId);
              loadPlaylists();
              if (selectedPlaylist?.id === playlistId) {
                setSelectedPlaylist(null);
              }
            } catch (error) {
              console.error("Error deleting playlist:", error);
              Alert.alert("Error", "Failed to delete playlist");
            }
          },
        },
      ]
    );
  };

  const handleRemoveTrack = async (playlistId, videoId) => {
    try {
      await removeTrackFromPlaylist(playlistId, videoId);
      loadPlaylists();
      const updatedPlaylist = playlists.find((p) => p.id === playlistId);
      setSelectedPlaylist(updatedPlaylist);
    } catch (error) {
      console.error("Error removing track:", error);
      Alert.alert("Error", "Failed to remove track from playlist");
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowPlaylistModal(true)}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color="#fff"
              style={styles.createButtonIcon}
            />
            <Text style={styles.createButtonText}>Create Playlist</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.playlistScroll}
          contentContainerStyle={styles.playlistScrollContent}
        >
          {playlists.map((playlist) => (
            <TouchableOpacity
              key={playlist.id}
              style={[
                styles.playlistItem,
                selectedPlaylist?.id === playlist.id && styles.selectedPlaylist,
              ]}
              onPress={() => setSelectedPlaylist(playlist)}
            >
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{playlist.name}</Text>
                <Text style={styles.trackCount}>
                  {playlist.tracks.length} tracks
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePlaylist(playlist.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#ff4545" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {selectedPlaylist ? (
          <View style={styles.playlistContent}>
            {/* Play Current Playlist Button */}
            <TouchableOpacity
              style={styles.playButton}
              onPress={async () => {
                try {
                  // Clear the current queue
                  await api.clearQueue();

                  for (let i = 0; i < selectedPlaylist.tracks.length; i++) {
                    const track = selectedPlaylist.tracks[i];
                    await api.addSongToQueue(track.videoId);

                    // Add delay to ensure order is correct
                    if (i < selectedPlaylist.tracks.length - 1) {
                      await new Promise((resolve) => setTimeout(resolve, 100));
                    }
                  }

                  await api.changeActiveSongInQueue(0);
                } catch (error) {
                  console.error("Error playing playlist:", error);
                  Alert.alert("Error", "Failed to play playlist");
                }
              }}
            >
              <Ionicons
                name="play-outline"
                size={24}
                color="#fff"
                style={styles.createButtonIcon}
              />
              <Text style={styles.createButtonText}>Play Playlist</Text>
            </TouchableOpacity>

            <ScrollView
              style={styles.tracksScroll}
              contentContainerStyle={styles.tracksScrollContent}
            >
              {selectedPlaylist.tracks.map((track) => (
                <View key={track.videoId} style={styles.trackItem}>
                  <Image
                    source={{ uri: track.imgSrc }}
                    style={styles.trackImage}
                  />
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    <Text style={styles.addedDate}>
                      Added: {new Date(track.added_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() =>
                      handleRemoveTrack(selectedPlaylist.id, track.videoId)
                    }
                  >
                    <Ionicons
                      name="remove-circle-outline"
                      size={24}
                      color="#ff4545"
                    />
                  </TouchableOpacity>
                </View>
              ))}
              {selectedPlaylist.tracks.length === 0 && (
                <Text style={styles.emptyText}>No tracks in this playlist</Text>
              )}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.noSelectionContent}>
            <Text style={styles.noSelectionText}>
              Select a playlist to view its contents
            </Text>
          </View>
        )}
      </View>

      <PlaylistModal
        visible={showPlaylistModal}
        onClose={() => {
          setShowPlaylistModal(false);
          loadPlaylists();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#000",
    paddingBottom: 80,
  },
  sidebar: {
    width: "25%",
    minWidth: 300,
    borderRightWidth: 1,
    borderRightColor: "#333",
  },
  sidebarHeader: {
    padding: 16,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff2c86",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff2c86",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 15,
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  playlistScroll: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: "35%",
  },
  playlistScrollContent: {
    ...(Platform.OS === "web"
      ? {
          maxHeight: "40vh",
          overflowY: "auto",
        }
      : {}),
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPlaylist: {
    borderColor: "#ff2c86",
    borderWidth: 2,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  trackCount: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  playlistContent: {
    flex: 1,
  },
  playlistTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  tracksScroll: {
    flex: 1,
    marginBottom: "15%",
  },
  tracksScrollContent: {
    ...(Platform.OS === "web"
      ? {
          maxHeight: "40vh",
          overflowY: "auto",
        }
      : {}),
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 8,
    height: 80,
  },
  trackImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 16,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  addedDate: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    padding: 4,
  },
  noSelectionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noSelectionText: {
    color: "#666",
    fontSize: 18,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
