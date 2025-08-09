import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, RefreshControl, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const StatsScreen = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('weekly');
    const [stats, setStats] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const router = useRouter();

    const periods = [
        { key: 'daily', label: 'Daily' },
        { key: 'weekly', label: 'Weekly' },
        { key: 'monthly', label: 'Monthly' },
        { key: 'yearly', label: 'Yearly' }
    ];

    const categoryColors = {
        'Groceries': '#FF6B6B',
        'Entertainment': '#4ECDC4',
        'Transportation': '#45B7D1',
        'Food': '#96CEB4',
        'Health': '#FFEAA7',
        'Shopping': '#DDA0DD',
        'Bills': '#98D8C8',
        'Education': '#F7DC6F',
        'Other': '#BB8FCE'
    };

    // Load user data and fetch stats
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const storedUser = await AsyncStorage.getItem('user');
                
                if (!token || !storedUser) {
                    Alert.alert('Session Expired', 'Please login again');
                    router.push('/loginPage');
                    return;
                }
                
                setAuthToken(token);
                await fetchStats(token, selectedPeriod);
                
            } catch (error) {
                console.error('Error loading user data:', error);
                router.push('/loginPage');
            }
        };
        
        loadUserData();
    }, []);

    // Fetch stats when period changes
    useEffect(() => {
        if (authToken) {
            fetchStats(authToken, selectedPeriod);
        }
    }, [selectedPeriod]);

    const fetchStats = async (token, period) => {
        try {
            setLoading(true);
            const response = await fetch(`https://expensify-api-8g94.onrender.com/api/v1/expenses/stats?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            } else if (response.status === 401) {
                // Token is invalid, but don't clear it immediately
                console.log('Token expired in stats, but keeping it for now');
            } else {
                console.error('Error fetching stats:', response.status);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats(authToken, selectedPeriod);
        setRefreshing(false);
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
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

    const generateChartData = () => {
        if (!stats?.chartData) return { labels: [], datasets: [{ data: [] }] };

        const sortedData = stats.chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sortedData.map(item => formatDate(item.date));
        const data = sortedData.map(item => item.amount);

        return {
            labels,
            datasets: [{
                data,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                strokeWidth: 3
            }]
        };
    };

    const generatePieChartData = () => {
        if (!stats?.categoryStats) return [];

        return Object.entries(stats.categoryStats).map(([category, amount]) => ({
            name: category,
            amount,
            color: categoryColors[category] || '#BB8FCE',
            legendFontColor: '#333',
            legendFontSize: 12
        }));
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading stats...</Text>
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
                    <Text style={styles.headerTitle}>Expense Analytics</Text>
                    <Text style={styles.headerSubtitle}>Track your spending patterns</Text>
                </View>

                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    {periods.map((period) => (
                        <Pressable
                            key={period.key}
                            style={[styles.periodButton, selectedPeriod === period.key && styles.selectedPeriod]}
                            onPress={() => setSelectedPeriod(period.key)}
                        >
                            <Text style={[styles.periodText, selectedPeriod === period.key && styles.selectedPeriodText]}>
                                {period.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <MaterialIcons name="account-balance-wallet" size={24} color="#A8E6CF" />
                        <Text style={styles.summaryLabel}>Total Spent</Text>
                        <Text style={styles.summaryAmount}>
                            {stats ? formatCurrency(stats.totalAmount) : '₹0.00'}
                        </Text>
                    </View>
                    
                    <View style={styles.summaryCard}>
                        <MaterialIcons name="receipt" size={24} color="#88D8A3" />
                        <Text style={styles.summaryLabel}>Total Expenses</Text>
                        <Text style={styles.summaryAmount}>
                            {stats ? stats.totalExpenses : 0}
                        </Text>
                    </View>
                </View>

                {/* Chart Section */}
                {stats && stats.chartData && stats.chartData.length > 0 && (
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Spending Trend</Text>
                        <LineChart
                            data={generateChartData()}
                            width={width - 40}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                )}

                {/* Category Breakdown */}
                {stats && stats.categoryStats && Object.keys(stats.categoryStats).length > 0 && (
                    <View style={styles.categoryCard}>
                        <Text style={styles.cardTitle}>Category Breakdown</Text>
                        
                        {/* Pie Chart */}
                        <View style={styles.pieChartContainer}>
                            <PieChart
                                data={generatePieChartData()}
                                width={width - 40}
                                height={200}
                                chartConfig={chartConfig}
                                accessor="amount"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        </View>

                        {/* Category List */}
                        <View style={styles.categoryList}>
                            {Object.entries(stats.categoryStats)
                                .sort(([,a], [,b]) => b - a)
                                .map(([category, amount]) => (
                                    <View key={category} style={styles.categoryItem}>
                                        <View style={styles.categoryLeft}>
                                            <View style={[styles.categoryColor, { backgroundColor: categoryColors[category] || '#BB8FCE' }]} />
                                            <Text style={styles.categoryName}>{category}</Text>
                                        </View>
                                        <View style={styles.categoryRight}>
                                            <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
                                            <Text style={styles.categoryPercentage}>
                                                {((amount / stats.totalAmount) * 100).toFixed(1)}%
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                        </View>
                    </View>
                )}

                {/* Empty State */}
                {(!stats || (stats.totalAmount === 0 && stats.totalExpenses === 0)) && (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="analytics" size={64} color="#ccc" />
                        <Text style={styles.emptyStateTitle}>No Data Available</Text>
                        <Text style={styles.emptyStateText}>
                            Add some expenses to see your spending analytics
                        </Text>
                    </View>
                )}
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
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    selectedPeriodText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    summaryContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        gap: 15,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        marginBottom: 5,
    },
    summaryAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    chartCard: {
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
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    categoryCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 15,
        padding: 20,
        marginBottom: 100,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    pieChartContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    categoryList: {
        marginTop: 10,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    categoryName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    categoryRight: {
        alignItems: 'flex-end',
    },
    categoryAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    categoryPercentage: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
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
});

export default StatsScreen; 