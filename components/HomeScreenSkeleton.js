// components/HomeScreenSkeleton.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/Theme';

const SkeletonPiece = ({ width, height, style }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    return <View style={[{ width, height, backgroundColor: colors.border, borderRadius: 8 }, style]} />;
};

const HomeScreenSkeleton = () => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const shimmerAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerAnimation, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            })
        ).start();
    }, [shimmerAnimation]);

    const translateX = shimmerAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.card}>
                <SkeletonPiece width="60%" height={24} style={{ marginBottom: 16 }} />
                <SkeletonPiece width="90%" height={180} />
            </View>
            <View style={styles.card}>
                <SkeletonPiece width="50%" height={24} style={{ marginBottom: 16 }} />
                <SkeletonPiece width="90%" height={100} />
            </View>
            <View style={styles.card}>
                <SkeletonPiece width="40%" height={24} style={{ marginBottom: 16 }} />
                <SkeletonPiece width="90%" height={60} />
            </View>
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.05)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        padding: 16,
        marginBottom: 16,
    },
});

export default HomeScreenSkeleton;