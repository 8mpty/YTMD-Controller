import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";

export default function LyricsPanel({ songInfo, isVisible }) {
  const [lyrics, setLyrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastTrackName, setLastTrackName] = useState("");

  useEffect(() => {
    const fetchLyrics = async () => {
      if (!isVisible || !songInfo || songInfo.title === lastTrackName) return;

      setIsLoading(true);
      setError(null);

      try {
        const artist = encodeURIComponent(songInfo.artist);
        const track = encodeURIComponent(songInfo.title);
        const response = await fetch(
          `https://lrclib.net/api/get?artist_name=${artist}&track_name=${track}`,
          {
            headers: {
              "Lrclib-Client":
                "YTMD-Controller (https://github.com/8mpty/YTMD-Controller)",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch lyrics");
        }

        const data = await response.json();
        setLyrics(data.plainLyrics || "No lyrics available");
        setLastTrackName(songInfo.title);
      } catch (err) {
        console.error("Error fetching lyrics:", err);
        setError("UNABLE TO GET LYRICS");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLyrics();
  }, [isVisible, songInfo?.title]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.lyricsText}>{lyrics}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    right: 0,
    width: "30%",
    bottom: 30,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderLeftWidth: 0,
    borderLeftColor: "#333",
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  lyricsText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});