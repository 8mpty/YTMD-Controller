import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import { format, isEqual, differenceInMilliseconds } from "date-fns";

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now);
      const delay = 1000 - now.getMilliseconds();
      setTimeout(updateTime, delay);
    };

    updateTime();
    return () => clearTimeout(updateTime);
  }, []);

  return (
    <View style={styles.clockContainer}>
      <Text style={styles.time}>
        {format(time, 'HH:mm:ss')}
      </Text>
      <Text style={styles.date}>
        {format(time, 'EEEE dd/MM/yyyy')}
      </Text>
    </View>
  );
};

const styles = {
  clockContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 100,
  },
  time: {
    color: "#fff",
    fontSize: 96,
    fontWeight: "bold",
    textAlign: "center",
  },
  date: {
    color: "#fff",
    fontSize: 32,
    textAlign: "center",
    marginTop: 10,
  },
};

export default Clock;
