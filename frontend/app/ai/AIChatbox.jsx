import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Font } from "../../constants/Font";
import * as messageService from "../../services/messageService";
import CustomToast from "@/components/common/CustomToast";
import Toast from "react-native-toast-message";

// const { height: SCREEN_HEIGHT } = Dimensions.get("window"); unused for now

const CHAT_TOP = 80;
const CHAT_SIDE = 20;
const CHAT_BOTTOM = 40;
const INPUT_ROW_HEIGHT = 56;

export default function AIChatbox({ onClose, messages, setMessages }) {
  const scheme = "dark";
  const theme = Colors[scheme ?? "dark"];

  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);

  const flatListRef = useRef(null);
  const typingController = useRef({ cancelled: false });

  const translateY = useRef(new Animated.Value(0)).current;
  // const panResponder = useRef(
  //   PanResponder.create({
  //     onMoveShouldSetPanResponder: (_, g) => g.dy > 0,
  //     onPanResponderMove: (_, g) => {
  //       if (g.dy > 0) translateY.setValue(g.dy);
  //     },
  //     onPanResponderRelease: (_, g) => {
  //       if (g.dy > 150) {
  //         Animated.timing(translateY, {
  //           toValue: SCREEN_HEIGHT,
  //           duration: 200,
  //           useNativeDriver: true,
  //         }).start(() => onClose?.());
  //       } else {
  //         Animated.spring(translateY, {
  //           toValue: 0,
  //           useNativeDriver: true,
  //         }).start();
  //       }
  //     },
  //   })
  // ).current;

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  }, [chatMessages]);

  const sendMessage = async (text) => {
    const clean = text?.trim();
    if (!clean) return;

    setInput("");
    setLoading(true);
    typingController.current = { cancelled: false };

    try {
      const { userMessage, aiMessage, conversationId } =
        await messageService.sendMessage(clean, activeConvo?._id);

      if (typingController.current.cancelled) return;

      setActiveConvo({ ...activeConvo, _id: conversationId });

      const safeUserMsg = {
        ...userMessage,
        id: userMessage.id || Date.now().toString(),
      };
      const safeAiMsg = {
        ...aiMessage,
        id: aiMessage.id || (Date.now() + 1).toString(),
      };

      setChatMessages((prev) => [...prev, safeUserMsg, safeAiMsg]);
      setMessages((prev) => [...prev, safeUserMsg, safeAiMsg]);
    } catch (err) {
      let description = "Please try again later.";
      if (err.response?.status === 500) {
        description = "Server overloaded, try again soon!";
      } else if (err.response?.status === 401) {
        description = "Session expired, please log in again.";
      } else if (err.message?.includes("Network")) {
        description = "Check your network connection!";
      }

      CustomToast.error("Darwin Unavailable", description);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const convos = await messageService.getConversations();
      setConversations(convos);
    } catch (err) {
      CustomToast.error(
        "Load Failed",
        "Unable to load conversations, try again."
      );
    }
  };

  useEffect(() => {
    if (historyVisible) loadConversations();
  }, [historyVisible]);

  const selectConversation = async (convo) => {
    try {
      setActiveConvo(convo);
      const msgs = await messageService.getMessagesByConversation(convo._id);
      setChatMessages(msgs);
      setMessages(msgs);
      setHistoryVisible(false);
    } catch {
      CustomToast.error("Load Failed", "Unable to load messages, try again.");
    }
  };

  const newConversation = async () => {
    try {
      const convo = await messageService.createConversation();
      setActiveConvo(convo);
      setChatMessages([]);
      setMessages([]);
      setHistoryVisible(false);
    } catch {
      CustomToast.error(
        "Conversation Not Created",
        "Unable to create conversation."
      );
    }
  };

  const deleteConversation = async (convoId) => {
    try {
      await messageService.deleteConversation(convoId);
      setConversations((prev) => prev.filter((c) => c._id !== convoId));

      if (activeConvo?._id === convoId) {
        typingController.current.cancelled = true;
        setActiveConvo(null);
        setChatMessages([]);
        setMessages([]);
        setLoading(false);
      }
    } catch (err) {
      CustomToast.error("Deletion Failed", "Unable to delete conversation.");
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        {
          alignSelf: item.fromAI ? "flex-start" : "flex-end",
          backgroundColor: item.fromAI ? theme.tint : "#007AFF",
        },
      ]}
    >
      <Text
        style={{
          color: "#FFF",
          fontFamily: Font.regular,
          fontSize: 15,
          lineHeight: 20,
        }}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: theme.background, transform: [{ translateY }] },
          ]}
          // {...panResponder.panHandlers} commented out to disable drag to close since it makes the buttons difficult to use
        >
          <View style={styles.header}>
            <Text
              style={{
                fontFamily: Font.bold,
                fontSize: 18,
                lineHeight: 22,
                color: theme.tint,
              }}
            >
              Darwin
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Text
                style={{
                  fontFamily: Font.bold,
                  color: "red",
                  fontSize: 20,
                  lineHeight: 24,
                }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={chatMessages}
            keyExtractor={(item, index) => item.id ?? `msg-${index}`}
            renderItem={renderItem}
            contentContainerStyle={{
              padding: 12,
              paddingBottom: INPUT_ROW_HEIGHT + 24,
            }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          {loading && (
            <Text
              style={{
                fontFamily: Font.regular,
                color: theme.tint,
                marginHorizontal: 12,
                fontSize: 12,
                lineHeight: 20,
              }}
            >
              Darwin is typing...
            </Text>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={CHAT_TOP}
          >
            <View style={[styles.inputBar, { backgroundColor: "#020114ff" }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundAlt,
                    color: "#FFF",
                    fontFamily: Font.regular,
                    fontSize: 15,
                    lineHeight: 20,
                  },
                ]}
                placeholder="Type your message..."
                placeholderTextColor={theme.textSecondary}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => sendMessage(input)}
                returnKeyType="send"
                multiline
              />
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: theme.tint }]}
                onPress={() => setHistoryVisible(true)}
              >
                <Text
                  style={{
                    fontFamily: Font.bold,
                    color: theme.background,
                    fontSize: 18,
                    lineHeight: 22,
                  }}
                >
                  ≡
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: theme.tint }]}
                onPress={() => sendMessage(input)}
              >
                <Text
                  style={{
                    fontFamily: Font.bold,
                    color: theme.background,
                    fontSize: 15,
                    lineHeight: 20,
                  }}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>

      <Modal visible={historyVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundAlt },
            ]}
          >
            <Text
              style={{
                fontFamily: Font.bold,
                color: theme.textPrimary,
                fontSize: 20,
                lineHeight: 24,
                marginBottom: 12,
              }}
            >
              History
            </Text>

            <TouchableOpacity
              onPress={newConversation}
              style={{ paddingVertical: 8 }}
            >
              <Text style={{ fontFamily: Font.bold, color: theme.tint }}>
                + New Conversation
              </Text>
            </TouchableOpacity>

            {conversations.map((c, i) => (
              <View
                key={c._id ?? `convo-${i}`}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => selectConversation(c)}
                  style={{ flex: 1 }}
                >
                  <Text
                    style={{
                      fontFamily: Font.regular,
                      color: theme.textPrimary,
                    }}
                  >
                    {c.title || "Untitled"} -{" "}
                    {new Date(c.updatedAt).toLocaleString()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteConversation(c._id)}>
                  <Text style={{ color: "red", fontSize: 16 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setHistoryVisible(false)}
              style={{ paddingVertical: 12 }}
            >
              <Text style={{ fontFamily: Font.bold, color: "red" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingTop: CHAT_TOP,
    paddingBottom: CHAT_BOTTOM,
    paddingHorizontal: CHAT_SIDE,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "80%",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: "center",
  },
  iconBtn: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 44,
    marginLeft: 8,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 44,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { borderRadius: 16, padding: 16 },
});
