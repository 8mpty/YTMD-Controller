import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SetupScreen from "./screens/SetupScreen";
import PlayerScreen from "./screens/PlayerScreen";
import { ApiProvider } from "./context/ApiContext";

const Stack = createStackNavigator();

export default function App() {
  React.useEffect(() => {
    StatusBar.setHidden(true);
  }, []);

  return (
    <SafeAreaProvider>
      <ApiProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Setup" component={SetupScreen} />
            <Stack.Screen name="Player" component={PlayerScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ApiProvider>
    </SafeAreaProvider>
  );
}
