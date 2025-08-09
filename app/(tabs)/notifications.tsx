import { StyleSheet, Text, View, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const router = useRouter();

    // Mock notifications data
    const mockNotifications = [
        {
            id: 1,
            type: 'expense',
            title: 'New Expense Added',
            message: 'You spent ₹500 on Groceries today',
            time: '2 minutes ago',
            read: false,
            icon: 'receipt'
        },
        {
            id: 2,
            type: 'budget',
            title: 'Budget Alert',
            message: 'You\'ve spent 80% of your monthly budget',
            time: '1 hour ago',
            read: false,
            icon: 'account-balance-wallet'
        },
        {
            id: 3,
            type: 'reminder',
            title: 'Monthly Review',
            message: 'Time to review your spending for this month',
            time: '2 hours ago',
            read: true,
            icon: 'analytics'
        },
        {
            id: 4,
            type: 'tip',
            title: 'Money Saving Tip',
            message: 'Try cooking at home to save on food expenses',
            time: '1 day ago',
            read: true,
            icon: 'lightbulb'
        },
        {
            id: 5,
            type: 'expense',
            title: 'Expense Reminder',
            message: 'Don\'t forget to add your lunch expense',
            time: '2 days ago',
            read: true,
            icon: 'restaurant'
        }
    ];

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setNotifications(mockNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const deleteNotification = (notificationId) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => {
                        setNotifications(prev => 
                            prev.filter(notification => notification.id !== notificationId)
                        );
                    }
                }
            ]
        );
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'expense':
                return '#A8E6CF';
            case 'budget':
                return '#FFB6C1';
            case 'reminder':
                return '#88D8A3';
            case 'tip':
                return '#FFEAA7';
            default:
                return '#BB8FCE';
        }
    };

    const getUnreadCount = () => {
        return notifications.filter(notification => !notification.read).length;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading notifications...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <Text style={styles.headerSubtitle}>
                        {getUnreadCount()} unread notifications
                    </Text>
                </View>

                {/* Notifications List */}
                {notifications.length > 0 ? (
                    <View style={styles.notificationsList}>
                        {notifications.map((notification) => (
                            <Pressable
                                key={notification.id}
                                style={[
                                    styles.notificationItem,
                                    !notification.read && styles.unreadNotification
                                ]}
                                onPress={() => markAsRead(notification.id)}
                            >
                                <View style={styles.notificationLeft}>
                                    <View style={[
                                        styles.notificationIcon,
                                        { backgroundColor: getNotificationColor(notification.type) }
                                    ]}>
                                        <MaterialIcons 
                                            name={notification.icon} 
                                            size={20} 
                                            color="#333" 
                                        />
                                    </View>
                                    <View style={styles.notificationContent}>
                                        <Text style={styles.notificationTitle}>
                                            {notification.title}
                                        </Text>
                                        <Text style={styles.notificationMessage}>
                                            {notification.message}
                                        </Text>
                                        <Text style={styles.notificationTime}>
                                            {notification.time}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.notificationRight}>
                                    {!notification.read && (
                                        <View style={styles.unreadDot} />
                                    )}
                                    <Pressable
                                        style={styles.deleteButton}
                                        onPress={() => deleteNotification(notification.id)}
                                    >
                                        <MaterialIcons name="delete-outline" size={20} color="#999" />
                                    </Pressable>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="notifications-none" size={64} color="#ccc" />
                        <Text style={styles.emptyStateTitle}>No Notifications</Text>
                        <Text style={styles.emptyStateText}>
                            You're all caught up! New notifications will appear here.
                        </Text>
                    </View>
                )}

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <Pressable style={styles.actionButton}>
                            <MaterialIcons name="mark-email-read" size={24} color="#A8E6CF" />
                            <Text style={styles.actionText}>Mark All Read</Text>
                        </Pressable>
                        <Pressable style={styles.actionButton}>
                            <MaterialIcons name="delete-sweep" size={24} color="#FFB6C1" />
                            <Text style={styles.actionText}>Clear All</Text>
                        </Pressable>
                        <Pressable style={styles.actionButton}>
                            <MaterialIcons name="settings" size={24} color="#88D8A3" />
                            <Text style={styles.actionText}>Settings</Text>
                        </Pressable>
                        <Pressable style={styles.actionButton}>
                            <MaterialIcons name="help-outline" size={24} color="#FFEAA7" />
                            <Text style={styles.actionText}>Help</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    notificationsList: {
        marginHorizontal: 20,
        marginBottom: 30,
    },
    notificationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    unreadNotification: {
        borderLeftWidth: 4,
        borderLeftColor: '#A8E6CF',
    },
    notificationLeft: {
        flexDirection: 'row',
        flex: 1,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        lineHeight: 20,
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
    },
    notificationRight: {
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#A8E6CF',
        marginBottom: 5,
    },
    deleteButton: {
        padding: 5,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 15,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    quickActions: {
        marginHorizontal: 20,
        marginBottom: 100,
    },
    quickActionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        width: '48%',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    actionText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
});

export default NotificationsScreen; 