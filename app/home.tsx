import { Image, Pressable, StyleSheet, Text, View, TextInput, ScrollView, Animated, Alert, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const MainPage = () => {
    const [amount, setAmount] = useState("");
    const [comment, setComment] = useState("");
    const [category, setCategory] = useState("Other");
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [name, setName] = useState("User");
    const [authToken, setAuthToken] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
    const [weeklyData, setWeeklyData] = useState([120, 85, 200, 150, 300, 180, 250]);
    
    const router = useRouter();

    // Categories for expenses
    const categories = ['Groceries', 'Entertainment', 'Transportation', 'Food', 'Health', 'Other'];
    const categoryIcons = {
        'Groceries': 'local-grocery-store',
        'Entertainment': 'movie',
        'Transportation': 'directions-car',
        'Food': 'restaurant',
        'Health': 'local-hospital',
        'Other': 'category'
    };

    // Animation refs
    const profileAnim = useRef(new Animated.Value(-100)).current;
    const cardAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Load user data
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const storedUser = await AsyncStorage.getItem('user');
                
                if (!token || !storedUser) {
                    Alert.alert('Session Expired', 'Please login again');
                    router.push('/login');
                    return;
                }
                
                const parsedUser = JSON.parse(storedUser);
                setAuthToken(token);
                setName(parsedUser?.name || 'User');
                
                // Load expenses from backend
                await fetchExpenses(token);
                
            } catch (error) {
                console.error('Error loading user data:', error);
                router.push('/login');
            }
        };
        
        loadUserData();
    }, []);

    // Fetch expenses from backend
    const fetchExpenses = async (token) => {
        try {
            const response = await fetch('YOUR_BACKEND_URL/api/expenses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setExpenses(data.expenses || []);
                calculateTotalExpenses(data.expenses || []);
                updateChartData(data.expenses || []);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    // Add expense to backend
    const addExpenseToBackend = async (expenseData) => {
        try {
            const response = await fetch('YOUR_BACKEND_URL/api/expenses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData)
            });
            
            if (response.ok) {
                const newExpense = await response.json();
                return newExpense;
            }
        } catch (error) {
            console.error('Error adding expense:', error);
        }
        return null;
    };

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

    const calculateTotalExpenses = (expenseList) => {
        const total = expenseList.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalExpenses(total);
    };

    const updateChartData = (expenseList) => {
        // Update chart data based on expenses
        const last7Days = Array(7).fill(0);
        const today = new Date();
        
        expenseList.forEach(expense => {
            const expenseDate = new Date(expense.date);
            const daysDiff = Math.floor((today - expenseDate) / (1000 * 60 * 60 * 24));
            if (daysDiff < 7 && daysDiff >= 0) {
                last7Days[6 - daysDiff] += expense.amount;
            }
        });
        
        setWeeklyData(last7Days);
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

    const addExpense = async () => {
        const expense = parseFloat(amount);
        if (!isNaN(expense) && expense > 0 && comment.trim() !== "") {
            const expenseData = {
                amount: expense,
                description: comment,
                category: category,
                date: new Date().toISOString()
            };
            
            // Add to backend
            const newExpense = await addExpenseToBackend(expenseData);
            
            if (newExpense) {
                // Update local state
                const updatedExpenses = [...expenses, newExpense];
                setExpenses(updatedExpenses);
                calculateTotalExpenses(updatedExpenses);
                updateChartData(updatedExpenses);
                
                setAmount("");
                setComment("");
                setCategory("Other");
            }
        }
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

    const chartData = {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            data: weeklyData,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            strokeWidth: 3
        }]
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
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

                {/* Period Selector */}
                <Animated.View style={[styles.periodSelector, { transform: [{ translateY: cardAnim }] }]}>
                    {['Weekly', 'Monthly', 'Yearly'].map((period) => (
                        <Pressable
                            key={period}
                            style={[styles.periodButton, selectedPeriod === period && styles.selectedPeriod]}
                            onPress={() => setSelectedPeriod(period)}
                        >
                            <Text style={[styles.periodText, selectedPeriod === period && styles.selectedPeriodText]}>
                                {period}
                            </Text>
                        </Pressable>
                    ))}
                </Animated.View>

                {/* Expense Overview Card */}
                <Animated.View style={[styles.expenseCard, { opacity: fadeAnim }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIconContainer}>
                            <MaterialIcons name="account-balance-wallet" size={24} color="#A8E6CF" />
                        </View>
                        <Text style={styles.cardTitle}>Expense Overview</Text>
                        <View style={styles.moreIcon}>
                            <Text style={styles.dayNumber}>7</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.expenseAmount}>₹{totalExpenses.toFixed(2)}</Text>
                    <Text style={styles.budgetText}>₹2400.00</Text>
                    
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

                {/* Add Expense Form */}
                <View style={styles.addExpenseForm}>
                    <Text style={styles.formTitle}>Add New Expense</Text>
                    
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                            placeholder="Amount"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                        <View style={styles.categoryPicker}>
                            <Text style={styles.categorySelected}>{category}</Text>
                        </View>
                    </View>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        value={comment}
                        onChangeText={setComment}
                    />
                    
                    <Pressable style={styles.addButton} onPress={addExpense}>
                        <Text style={styles.addButtonText}>Add Expense</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <Pressable style={styles.navItem}>
                    <MaterialIcons name="home" size={24} color="#A8E6CF" />
                </Pressable>
                <Pressable style={styles.navItem}>
                    <MaterialIcons name="donut-small" size={24} color="#ccc" />
                </Pressable>
                <Pressable style={styles.navItem}>
                    <MaterialIcons name="add" size={24} color="#ccc" />
                </Pressable>
                <Pressable style={styles.navItem}>
                    <MaterialIcons name="notifications" size={24} color="#ccc" />
                </Pressable>
                <Pressable style={styles.navItem}>
                    <MaterialIcons name="settings" size={24} color="#ccc" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
    periodSelector: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 4,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    selectedPeriod: {
        backgroundColor: '#333',
    },
    periodText: {
        fontSize: 16,
        color: '#666',
    },
    selectedPeriodText: {
        color: '#fff',
        fontWeight: 'bold',
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
    addExpenseForm: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        marginBottom: 100,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    categoryPicker: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        justifyContent: 'center',
        minWidth: 100,
    },
    categorySelected: {
        fontSize: 16,
        color: '#333',
    },
    addButton: {
        backgroundColor: '#A8E6CF',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
});

export default MainPage;