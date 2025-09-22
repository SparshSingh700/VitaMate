import { useState, useEffect } from 'react';
import Voice from '@react-native-voice/voice';

export const useVoiceRecognition = () => {
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');
    const [error, setError] = useState('');

    const onSpeechStart = (e) => {
        console.log('onSpeechStart: ', e);
        setIsRecognizing(true);
    };

    const onSpeechEnd = (e) => {
        console.log('onSpeechEnd: ', e);
        setIsRecognizing(false);
    };

    const onSpeechError = (e) => {
        console.log('onSpeechError: ', e);
        if (e.error?.code !== 7) { // 7 is "No match" which is not a real error
             setError(e.error?.message || 'An unknown error occurred');
        }
        setIsRecognizing(false);
    };

    const onSpeechResults = (e) => {
        console.log('onSpeechResults: ', e);
        if (e.value && e.value.length > 0) {
            setRecognizedText(e.value[0]);
        }
    };

    useEffect(() => {
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechResults = onSpeechResults;
        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const startRecognition = async () => {
        try {
            setRecognizedText('');
            setError('');
            await Voice.start('en-US');
        } catch (e) {
            console.error('startRecognition error: ', e);
            setError(JSON.stringify(e));
        }
    };

    const stopRecognition = async () => {
        try {
            await Voice.stop();
        } catch (e) {
            console.error('stopRecognition error: ', e);
            setError(JSON.stringify(e));
        }
    };

    return {
        isRecognizing,
        recognizedText,
        error,
        startRecognition,
        stopRecognition,
    };
};