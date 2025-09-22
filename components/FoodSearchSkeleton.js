import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/Theme';

const SkeletonPiece = ({ width, height, style }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    return <View style={[{ width, height, backgroundColor: colors.border, borderRadius: 4 }, style]} />;
};

const SkeletonItem = () => (
    <View style={styles.item}>
        <View>
            <SkeletonPiece width={180} height={20} style={{ marginBottom: 8 }} />
            <SkeletonPiece width={120} height={16} />
        </View>
        <SkeletonPiece width={24} height={24} />
    </View>
);

const FoodSearchSkeleton = () => {
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
        outputRange: [-350, 350],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
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
        paddingHorizontal: 16,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
});

export default FoodSearchSkeleton;