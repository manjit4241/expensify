import { StyleSheet, Text, View, ScrollView, Pressable, Alert, Switch } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
    const [user, setUser] = useState(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const router = useRouter();

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('authToken');
                            await AsyncStorage.removeItem('user');
                            router.push('/loginPage');
                        } catch (error) {
                            console.error('Error logging out:', error);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. All your data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Account Deleted', 'Your account has been deleted.');
                    }
                }
            ]
        );
    };

    const settingsSections = [
        {
            title: 'Account',
            items: [
                {
                    icon: 'person',
                    title: 'Profile',
                    subtitle: 'Edit your profile information',
                    action: 'navigate'
                },
                {
                    icon: 'email',
                    title: 'Email',
                    subtitle: user?.email || 'user@example.com',
                    action: 'navigate'
                },
                {
                    icon: 'lock',
                    title: 'Change Password',
                    subtitle: 'Update your password',
                    action: 'navigate'
                }
            ]
        },
        {
            title: 'Preferences',
            items: [
                {
                    icon: 'notifications',
                    title: 'Notifications',
                    subtitle: 'Manage notification settings',
                    action: 'toggle',
                    value: notificationsEnabled,
                    onValueChange: setNotificationsEnabled
                },
                {
                    icon: 'dark-mode',
                    title: 'Dark Mode',
                    subtitle: 'Switch to dark theme',
                    action: 'toggle',
                    value: darkModeEnabled,
                    onValueChange: setDarkModeEnabled
                },
                {
                    icon: 'fingerprint',
                    title: 'Biometric Login',
                    subtitle: 'Use fingerprint or face ID',
                    action: 'toggle',
                    value: biometricEnabled,
                    onValueChange: setBiometricEnabled
                }
            ]
        },
        {
            title: 'Data & Privacy',
            items: [
                {
                    icon: 'cloud-download',
                    title: 'Export Data',
                    subtitle: 'Download your expense data',
                    action: 'navigate'
                },
                {
                    icon: 'delete',
                    title: 'Clear Cache',
                    subtitle: 'Free up storage space',
                    action: 'navigate'
                },
                {
                    icon: 'privacy-tip',
                    title: 'Privacy Policy',
                    subtitle: 'Read our privacy policy',
                    action: 'navigate'
                }
            ]
        },
        {
            title: 'Support',
            items: [
                {
                    icon: 'help',
                    title: 'Help & Support',
                    subtitle: 'Get help with the app',
                    action: 'navigate'
                },
                {
                    icon: 'feedback',
                    title: 'Send Feedback',
                    subtitle: 'Share your thoughts with us',
                    action: 'navigate'
                },
                {
                    icon: 'star',
                    title: 'Rate App',
                    subtitle: 'Rate us on the app store',
                    action: 'navigate'
                }
            ]
        }
    ];

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading settings...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
                </View>

                {/* User Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileInfo}>
                        <View style={styles.profileImage}>
                            <MaterialIcons name="person" size={32} color="#fff" />
                        </View>
                        <View style={styles.profileDetails}>
                            <Text style={styles.profileName}>
                                {user?.name || 'User Name'}
                            </Text>
                            <Text style={styles.profileEmail}>
                                {user?.email || 'user@example.com'}
                            </Text>
                        </View>
                    </View>
                    <Pressable style={styles.editButton}>
                        <MaterialIcons name="edit" size={20} color="#A8E6CF" />
                    </Pressable>
                </View>

                {/* Settings Sections */}
                {settingsSections.map((section, sectionIndex) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.sectionContent}>
                            {section.items.map((item, itemIndex) => (
                                <Pressable
                                    key={item.title}
                                    style={styles.settingItem}
                                    onPress={() => {
                                        if (item.action === 'navigate') {
                                            // Handle navigation
                                            Alert.alert('Coming Soon', 'This feature will be available soon!');
                                        }
                                    }}
                                >
                                    <View style={styles.settingLeft}>
                                        <View style={styles.settingIcon}>
                                            <MaterialIcons 
                                                name={item.icon} 
                                                size={24} 
                                                color="#666" 
                                            />
                                        </View>
                                        <View style={styles.settingContent}>
                                            <Text style={styles.settingTitle}>
                                                {item.title}
                                            </Text>
                                            <Text style={styles.settingSubtitle}>
                                                {item.subtitle}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.settingRight}>
                                        {item.action === 'toggle' ? (
                                            <Switch
                                                value={item.value}
                                                onValueChange={item.onValueChange}
                                                trackColor={{ false: '#f0f0f0', true: '#A8E6CF' }}
                                                thumbColor={item.value ? '#fff' : '#ccc'}
                                            />
                                        ) : (
                                            <MaterialIcons 
                                                name="keyboard-arrow-right" 
                                                size={24} 
                                                color="#ccc" 
                                            />
                                        )}
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Danger Zone */}
                <View style={styles.dangerSection}>
                    <Text style={styles.sectionTitle}>Danger Zone</Text>
                    <View style={styles.sectionContent}>
                        <Pressable style={styles.dangerItem} onPress={handleLogout}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.settingIcon, { backgroundColor: '#FFB6C1' }]}>
                                    <MaterialIcons name="logout" size={24} color="#fff" />
                                </View>
                                <View style={styles.settingContent}>
                                    <Text style={styles.settingTitle}>Logout</Text>
                                    <Text style={styles.settingSubtitle}>Sign out of your account</Text>
                                </View>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#ccc" />
                        </Pressable>

                        <Pressable style={styles.dangerItem} onPress={handleDeleteAccount}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.settingIcon, { backgroundColor: '#FF6B6B' }]}>
                                    <MaterialIcons name="delete-forever" size={24} color="#fff" />
                                </View>
                                <View style={styles.settingContent}>
                                    <Text style={[styles.settingTitle, { color: '#FF6B6B' }]}>
                                        Delete Account
                                    </Text>
                                    <Text style={styles.settingSubtitle}>
                                        Permanently delete your account and data
                                    </Text>
                                </View>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#ccc" />
                        </Pressable>
                    </View>
                </View>

                {/* App Version */}
                <View style={styles.versionSection}>
                    <Text style={styles.versionText}>Expense Tracker v1.0.0</Text>
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
    profileCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#A8E6CF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    profileDetails: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 14,
        color: '#666',
    },
    editButton: {
        padding: 8,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 20,
        marginBottom: 10,
    },
    sectionContent: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    settingRight: {
        alignItems: 'center',
    },
    dangerSection: {
        marginBottom: 20,
    },
    dangerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    versionSection: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 100,
    },
    versionText: {
        fontSize: 14,
        color: '#999',
    },
});

export default SettingsScreen; 