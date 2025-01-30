import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useApi } from "../context/ApiContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TopBar({ onRefresh, onCollapse }) {
  const navigation = useNavigation();
  const { clearApiConfig } = useApi();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 10),
          paddingRight: Math.max(insets.right, 15),
          paddingLeft: Math.max(insets.left, 15),
        },
      ]}
    >
      <TouchableOpacity onPress={onCollapse} style={styles.button}>
        <Ionicons name="home-outline" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.rightButtons}>
        <TouchableOpacity onPress={onRefresh} style={styles.button}>
          <Ionicons name="refresh-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            await clearApiConfig();
            navigation.replace("Setup");
          }}
          style={styles.button}
        >
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000",
    paddingBottom: 10,
  },
  rightButtons: {
    flexDirection: "row",
    gap: 15,
  },
  button: {
    padding: 5,
  },
});
