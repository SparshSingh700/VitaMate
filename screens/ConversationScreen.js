import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext.js';
import { COLORS, FONTS } from '../constants/Theme.js';
import { getDynamicResponse, resetConversation } from '../utils/conversationLogic.js';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';

const MessageBubble = ({ text, sender }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const isUser = sender === 'user';
    return (
        <View style={[styles.bubbleContainer, isUser ? styles.userBubbleContainer : styles.aiBubbleContainer]}>
            <View style={[styles.bubble, isUser ? styles.userBubble : { backgroundColor: colors.card }]}>
                <Text style={isUser ? styles.userBubbleText : [styles.aiBubbleText, { color: colors.text }]}>{text}</Text>
            </View>
        </View>
    );
};

const QuickReply = ({ options, onSelect }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    return (
        <View style={[styles.optionsContainer, { borderTopColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsScroll}>
                {options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.optionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => onSelect(option)}
                    >
                        <Text style={[styles.optionText, { color: COLORS.primary }]}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const ConversationScreen = () => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const scrollViewRef = useRef();
    const [conversation, setConversation] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [quickReplies, setQuickReplies] = useState([]);
    const { isRecognizing, recognizedText, startRecognition, stopRecognition, setRecognizedText } = useVoiceRecognition();
    const headerHeight = useHeaderHeight();

    useEffect(() => {
        resetConversation();
        setConversation([{ sender: 'ai', text: "Feel free to write down anything that's on your mind. I'm here to listen." }]);
    }, []);
    
    useEffect(() => {
        if (recognizedText) {
            setInputText(recognizedText);
        }
    }, [recognizedText]);

    const handleSend = (messageText) => {
        const textToSend = messageText || inputText;
        if (textToSend.trim().length === 0) return;

        const userMessage = { sender: 'user', text: textToSend };
        setConversation(prev => [...prev, userMessage]);
        setInputText('');
        setRecognizedText('');
        setIsLoading(true);
        setQuickReplies([]);

        setTimeout(() => {
            const aiResponse = getDynamicResponse(userMessage.text);
            
            if (typeof aiResponse === 'object' && aiResponse.type === 'choice') {
                const aiMessage = { sender: 'ai', text: aiResponse.text };
                setConversation(prev => [...prev, aiMessage]);
                setQuickReplies(aiResponse.options);
            } else if (typeof aiResponse === 'object' && aiResponse.type === 'message') {
                 const aiMessage = { sender: 'ai', text: aiResponse.text };
                setConversation(prev => [...prev, aiMessage]);
            }
            else {
                const aiMessage = { sender: 'ai', text: aiResponse };
                setConversation(prev => [...prev, aiMessage]);
            }
            setIsLoading(false);
        }, 800);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={headerHeight}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.conversationContainer}
                    onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                >
                    {conversation.map((msg, index) => (
                        <MessageBubble key={index} text={msg.text} sender={msg.sender} />
                    ))}
                    {isLoading && (
                        <View style={styles.aiBubbleContainer}>
                           <ActivityIndicator style={{marginLeft: 20, marginVertical: 8}} color={colors.textSecondary} />
                        </View>
                    )}
                </ScrollView>

                {quickReplies.length > 0 && !isLoading && <QuickReply options={quickReplies} onSelect={(reply) => handleSend(reply)} />}

                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <TextInput
                        style={[styles.textInput, { color: colors.text }]}
                        placeholder={isRecognizing ? "Listening..." : "Type your thoughts..."}
                        placeholderTextColor={colors.textSecondary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity 
                        style={styles.micButton} 
                        onPress={isRecognizing ? stopRecognition : startRecognition}
                    >
                        <Ionicons name={isRecognizing ? "mic-off-circle" : "mic-circle"} size={36} color={isRecognizing ? COLORS.secondary : COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()} disabled={isLoading || inputText.trim().length === 0}>
                        <Ionicons name="arrow-up-circle" size={36} color={inputText.trim() ? COLORS.primary : colors.border} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    keyboardAvoidingView: { flex: 1 },
    conversationContainer: {
        flexGrow: 1,
        padding: 10,
    },
    bubbleContainer: { marginVertical: 8, maxWidth: '85%' },
    aiBubbleContainer: { alignSelf: 'flex-start' },
    userBubbleContainer: { alignSelf: 'flex-end' },
    bubble: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 22 },
    userBubble: { backgroundColor: COLORS.primary },
    aiBubbleText: { ...FONTS.body1, lineHeight: 24 },
    userBubbleText: { ...FONTS.body1, lineHeight: 24, color: 'white' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderTopWidth: 1,
    },
    textInput: {
        flex: 1,
        ...FONTS.body1,
        maxHeight: 120,
        marginRight: 8,
        paddingTop: Platform.OS === 'ios' ? 10 : 8,
        paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    },
    micButton: { padding: 4 },
    sendButton: { padding: 4 },
    optionsContainer: {
        paddingVertical: 10,
        borderTopWidth: 1,
    },
    optionsScroll: {
        paddingHorizontal: 10,
    },
    optionButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginHorizontal: 5,
        borderWidth: 1,
    },
    optionText: {
        ...FONTS.body1,
        fontWeight: '600',
    },
});

export default ConversationScreen;