import { Image, Pressable, StyleSheet, Text, View, ScrollView, Animated, Alert, Dimensions, RefreshControl } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [name, setName] = useState("User");
    const [authToken, setAuthToken] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const router = useRouter();

    // Animation refs
    const profileAnim = useRef(new Animated.Value(-100)).current;
    const cardAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Categories for expenses
    const categories = ['Groceries', 'Entertainment', 'Transportation', 'Food', 'Health', 'Shopping', 'Bills', 'Education', 'Other'];
    const categoryIcons = {
        'Groceries': 'local-grocery-store',
        'Entertainment': 'movie',
        'Transportation': 'directions-car',
        'Food': 'restaurant',
        'Health': 'local-hospital',
        'Shopping': 'shopping-bag',
        'Bills': 'receipt',
        'Education': 'school',
        'Other': 'category'
    };

    // Load user data
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const storedUser = await AsyncStorage.getItem('user');
                
                console.log('Home screen - Token exists:', !!token);
                console.log('Home screen - User exists:', !!storedUser);
                
                if (!token || !storedUser) {
                    console.log('No token or user found, redirecting to login');
                    Alert.alert('Session Expired', 'Please login again');
                    router.push('/loginPage');
                    return;
                }
                
                const parsedUser = JSON.parse(storedUser);
                setAuthToken(token);
                setName(parsedUser?.name || 'User');
                
                console.log('Loading expenses with token:', token.substring(0, 20) + '...');
                
                // Load expenses from backend
                await fetchExpenses(token);
                
            } catch (error) {
                console.error('Error loading user data:', error);
                router.push('/loginPage');
            }
        };
        
        loadUserData();
    }, []);

    // Animations
    useEffect(() => {
        Animated.parallel([
            Animated.timing(profileAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(cardAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Fetch expenses from backend
    const fetchExpenses = async (token) => {
        try {
            setLoading(true);
            const response = await fetch('https://expensify-api-8g94.onrender.com/api/v1/expenses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setExpenses(data.expenses || []);
                setTotalExpenses(data.total || 0);
            } else if (response.status === 401) {
                // Try to refresh token
                console.log('Token expired, trying to refresh...');
                const refreshResponse = await fetch('https://expensify-api-8g94.onrender.com/api/v1/refresh-token', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                
                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    await AsyncStorage.setItem('authToken', refreshData.token);
                    setAuthToken(refreshData.token);
                    
                    // Retry the original request with new token
                    const retryResponse = await fetch('https://expensify-api-8g94.onrender.com/api/v1/expenses', {
                        headers: {
                            'Authorization': `Bearer ${refreshData.token}`,
                            'Content-Type': 'application/json',
                        }
                    });
                    
                    if (retryResponse.ok) {
                        const retryData = await retryResponse.json();
                        setExpenses(retryData.expenses || []);
                        setTotalExpenses(retryData.total || 0);
                    }
                } else {
                    console.log('Token refresh failed, redirecting to login');
                    await AsyncStorage.removeItem('authToken');
                    await AsyncStorage.removeItem('user');
                    router.replace('/loginPage');
                }
            } else {
                console.error('Error fetching expenses:', response.status);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchExpenses(authToken);
        setRefreshing(false);
    };

    const getCategoryStats = () => {
        const categoryTotals = {};
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });
        
        const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        
        return Object.entries(categoryTotals)
            .map(([cat, amount]) => ({
                category: cat,
                amount,
                percentage: totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(0) : 0
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const chartConfig = {
        backgroundColor: '#A8E6CF',
        backgroundGradientFrom: '#A8E6CF',
        backgroundGradientTo: '#88D8A3',
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3,
        barPercentage: 0.7,
        useShadowColorFromDataset: false,
        propsForLabels: {
            fontSize: 12,
            fontWeight: 'bold'
        }
    };

    // Generate chart data from recent expenses
    const generateChartData = () => {
        const last7Days = Array(7).fill(0);
        const today = new Date();
        
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            const daysDiff = Math.floor((today - expenseDate) / (1000 * 60 * 60 * 24));
            if (daysDiff < 7 && daysDiff >= 0) {
                last7Days[6 - daysDiff] += expense.amount;
            }
        });
        
        return last7Days;
    };

    const chartData = {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            data: generateChartData(),
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            strokeWidth: 3
        }]
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
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
                <Animated.View style={[styles.header, { transform: [{ translateY: profileAnim }] }]}>
                    <View style={styles.profileSection}>
                        <Image
                            source={{ uri: 'https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
                            style={styles.profileImage}
                        />
                        <View style={styles.greetingSection}>
                            <Text style={styles.greeting}>Hello</Text>
                            <Text style={styles.userName}>{name.split(' ')[0]}!</Text>
                        </View>
                    </View>
                    <Pressable style={styles.notificationIcon}>
                        <Ionicons name="notifications-outline" size={24} color="#333" />
                    </Pressable>
                </Animated.View>

                {/* Expense Overview Card */}
                <Animated.View style={[styles.expenseCard, { opacity: fadeAnim }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIconContainer}>
                            <MaterialIcons name="account-balance-wallet" size={24} color="#A8E6CF" />
                        </View>
                        <Text style={styles.cardTitle}>Total Expenses</Text>
                        <View style={styles.moreIcon}>
                            <Text style={styles.dayNumber}>{expenses.length}</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.expenseAmount}>₹{totalExpenses.toFixed(2)}</Text>
                    <Text style={styles.budgetText}>This month</Text>
                    
                    {/* Mini Chart */}
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={chartData}
                            width={width - 80}
                            height={120}
                            chartConfig={chartConfig}
                            withDots={false}
                            withInnerLines={false}
                            withOuterLines={false}
                            withVerticalLines={false}
                            withHorizontalLines={false}
                            fromZero
                        />
                    </View>
                </Animated.View>

                {/* Top Categories */}
                <Animated.View style={[styles.categoriesCard, { opacity: fadeAnim }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIconContainer}>
                            <MaterialIcons name="donut-small" size={24} color="#88D8A3" />
                        </View>
                        <Text style={styles.cardTitle}>Top Categories</Text>
                        <Pressable style={styles.moreIcon}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#666" />
                        </Pressable>
                    </View>

                    {getCategoryStats().map((item, index) => (
                        <View key={item.category} style={styles.categoryItem}>
                            <View style={styles.categoryLeft}>
                                <View style={styles.categoryIconContainer}>
                                    <MaterialIcons 
                                        name={categoryIcons[item.category]} 
                                        size={20} 
                                        color="#666" 
                                    />
                                </View>
                                <Text style={styles.categoryName}>{item.category}</Text>
                            </View>
                            <View style={styles.categoryRight}>
                                <Text style={styles.categoryPercentage}>{item.percentage}%</Text>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progress, { width: `${item.percentage}%` }]} />
                                </View>
                            </View>
                        </View>
                    ))}
                </Animated.View>

                {/* Recent Expenses */}
                <Animated.View style={[styles.recentExpensesCard, { opacity: fadeAnim }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIconContainer}>
                            <MaterialIcons name="history" size={24} color="#FFB6C1" />
                        </View>
                        <Text style={styles.cardTitle}>Recent Expenses</Text>
                        <Pressable style={styles.moreIcon}>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#666" />
                        </Pressable>
                    </View>

                    {expenses.slice(0, 5).map((expense, index) => (
                        <View key={expense._id || index} style={styles.expenseItem}>
                            <View style={styles.expenseLeft}>
                                <View style={styles.expenseIconContainer}>
                                    <MaterialIcons 
                                        name={categoryIcons[expense.category]} 
                                        size={20} 
                                        color="#666" 
                                    />
                                </View>
                                <View style={styles.expenseDetails}>
                                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                                    <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
                                </View>
                            </View>
                            <View style={styles.expenseRight}>
                                <Text style={styles.expenseAmountItem}>₹{expense.amount.toFixed(2)}</Text>
                                <Text style={styles.expenseCategory}>{expense.category}</Text>
                            </View>
                        </View>
                    ))}

                    {expenses.length === 0 && (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="receipt" size={48} color="#ccc" />
                            <Text style={styles.emptyStateText}>No expenses yet</Text>
                            <Text style={styles.emptyStateSubtext}>Add your first expense to get started</Text>
                        </View>
                    )}
                </Animated.View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    greetingSection: {
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 16,
        color: '#666',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    notificationIcon: {
        padding: 8,
    },
    expenseCard: {
        backgroundColor: '#A8E6CF',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 15,
    },
    moreIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    expenseAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    budgetText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    categoriesCard: {
        backgroundColor: '#88D8A3',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIconContainer: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    categoryName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    categoryRight: {
        alignItems: 'flex-end',
        flex: 1,
    },
    categoryPercentage: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    progressBar: {
        width: 60,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
    },
    progress: {
        height: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    recentExpensesCard: {
        backgroundColor: '#FFB6C1',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        marginBottom: 100,
    },
    expenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingVertical: 10,
    },
    expenseLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    expenseIconContainer: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    expenseDetails: {
        flex: 1,
    },
    expenseDescription: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    expenseDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    expenseRight: {
        alignItems: 'flex-end',
    },
    expenseAmountItem: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    expenseCategory: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 10,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
    },
});

export default HomeScreen; 