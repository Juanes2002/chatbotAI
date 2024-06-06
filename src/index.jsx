import React, { useState, useEffect, useRef } from "react";
import * as GoogleGenerativeAI from "@google/generative-ai";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import * as Speech from "expo-speech";

const GeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopIcon, setShowStopIcon] = useState(false);

  const API_KEY = process.env.OPENAI_API_KEY;

  const flatListRef = useRef(null);

  useEffect(() => {
    const startChat = async () => {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = "hello! ";
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      addMessage(text, false);
    };

    startChat();
  }, []);

  const addMessage = (text, user) => {
    const newMessage = { text, user };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const sendMessage = async () => {
    setLoading(true);
    addMessage(userInput, true);
    const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = userInput;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    addMessage(text, false);
    setLoading(false);
    setUserInput("");

    if (text && !isSpeaking) {
      Speech.speak(text);
      setIsSpeaking(true);
      setShowStopIcon(true);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setIsSpeaking(false);
    setShowStopIcon(false);
  };

  const renderMessage = ({ item }) => {
    return (
      <View
        style={[
          styles.messageContainer,
          item.user ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.user ? styles.userMessageText : styles.botMessageText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerTitle}>
        <Text style={styles.title}>Elvira Bot:</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <TextInput
          placeholder="Ask Something!"
          onChangeText={setUserInput}
          value={userInput}
          onSubmitEditing={sendMessage}
          style={styles.input}
          placeholderTextColor="#fff"
        />
        {showStopIcon && (
          <TouchableOpacity style={styles.stopIcon} onPress={clearMessages}>
            <Entypo name="controller-stop" size={24} color="white" />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffff" },
  containerTitle: {
    backgroundColor: "lightblue",
    marginBottom: 5
  },
  title: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 70,
    marginBottom: 10,
  },
  messageContainer: {
    maxWidth: "80%",
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    borderRadius: 8,
    marginVertical: 5,
    padding: 10,
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  botMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#E8E8E8",
  },
  messageText: { fontSize: 16, paddingTop: 5 },
  userMessageText: { color: "black" },
  botMessageText: { color: "black" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 10,
    height: 50,
    color: "white",
  },
  micIcon: {
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 25,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  stopIcon: {
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 25,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
  },
});

export default GeminiChat;
