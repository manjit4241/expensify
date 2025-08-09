import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, Alert, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddExpenseScreen = () => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Other');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();

    const categories = [
        'Groceries',
        'Entertainment', 
        'Transportation',
        'Food',
        'Health',
        'Shopping',
        'Bills',
        'Education',
        'Other'
    ];

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
            } catch (error) {
                console.error('Error loading user data:', error);
                router.push('/loginPage');
            }
        };
        
        loadUserData();
    }, []);

    const addExpense = async () => {
        if (!amount || !description.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const expenseAmount = parseFloat(amount);
        if (isNaN(expenseAmount) || expenseAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('https://expensify-api-8g94.onrender.com/api/v1/expenses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: expenseAmount,
                    category,
                    description: description.trim(),
                    date: date.toISOString()
                })
            });

            if (response.ok) {
                Alert.alert(
                    'Success', 
                    'Expense added successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Reset form
                                setAmount('');
                                setDescription('');
                                setCategory('Other');
                                setDate(new Date());
                            }
                        }
                    ]
                );
            } else if (response.status === 401) {
                // Try to refresh token
                console.log('Token expired, trying to refresh...');
                const refreshResponse = await fetch('http://10.166.79.200:3000/api/v1/refresh-token', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    }
                });
                
                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    await AsyncStorage.setItem('authToken', refreshData.token);
                    setAuthToken(refreshData.token);
                    
                    // Retry the original request with new token
                    const retryResponse = await fetch('http://10.166.79.200:3000/api/v1/expenses', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${refreshData.token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amount: expenseAmount,
                            category,
                            description: description.trim(),
                            date: date.toISOString()
                        })
                    });
                    
                    if (retryResponse.ok) {
                        Alert.alert(
                            'Success', 
                            'Expense added successfully!',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        // Reset form
                                        setAmount('');
                                        setDescription('');
                                        setCategory('Other');
                                        setDate(new Date());
                                    }
                                }
                            ]
                        );
                    } else {
                        const retryErrorData = await retryResponse.json();
                        Alert.alert('Error', retryErrorData.message || 'Failed to add expense');
                    }
                } else {
                    console.log('Token refresh failed, redirecting to login');
                    await AsyncStorage.removeItem('authToken');
                    await AsyncStorage.removeItem('user');
                    router.replace('/loginPage');
                }
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to add expense');
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Add New Expense</Text>
                    <Text style={styles.headerSubtitle}>Track your spending</Text>
                </View>

                {/* Amount Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Amount *</Text>
                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                {/* Category Selection */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <Pressable
                        style={styles.categorySelector}
                        onPress={() => setShowCategoryPicker(true)}
                    >
                        <View style={styles.categoryLeft}>
                            <MaterialIcons 
                                name={categoryIcons[category]} 
                                size={24} 
                                color="#666" 
                            />
                            <Text style={styles.categoryText}>{category}</Text>
                        </View>
                        <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
                    </Pressable>
                </View>

                {/* Date Selection */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Date</Text>
                    <Pressable
                        style={styles.dateSelector}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <MaterialIcons name="event" size={24} color="#666" />
                        <Text style={styles.dateText}>{formatDate(date)}</Text>
                        <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
                    </Pressable>
                </View>

                {/* Description Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Description *</Text>
                    <TextInput
                        style={styles.descriptionInput}
                        placeholder="What was this expense for?"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Add Button */}
                <Pressable
                    style={[styles.addButton, loading && styles.addButtonDisabled]}
                    onPress={addExpense}
                    disabled={loading}
                >
                    <Text style={styles.addButtonText}>
                        {loading ? 'Adding...' : 'Add Expense'}
                    </Text>
                </Pressable>

                {/* Quick Add Suggestions */}
                <View style={styles.suggestionsSection}>
                    <Text style={styles.suggestionsTitle}>Quick Add</Text>
                    <View style={styles.suggestionsGrid}>
                        {[
                            { amount: '50', desc: 'Coffee', category: 'Food' },
                            { amount: '200', desc: 'Lunch', category: 'Food' },
                            { amount: '100', desc: 'Transport', category: 'Transportation' },
                            { amount: '500', desc: 'Groceries', category: 'Groceries' }
                        ].map((suggestion, index) => (
                            <Pressable
                                key={index}
                                style={styles.suggestionItem}
                                onPress={() => {
                                    setAmount(suggestion.amount);
                                    setDescription(suggestion.desc);
                                    setCategory(suggestion.category);
                                }}
                            >
                                <Text style={styles.suggestionAmount}>₹{suggestion.amount}</Text>
                                <Text style={styles.suggestionDesc}>{suggestion.desc}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Category Picker Modal */}
            <Modal
                visible={showCategoryPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCategoryPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Category</Text>
                            <Pressable onPress={() => setShowCategoryPicker(false)}>
                                <MaterialIcons name="close" size={24} color="#666" />
                            </Pressable>
                        </View>
                        <ScrollView style={styles.categoryList}>
                            {categories.map((cat) => (
                                <Pressable
                                    key={cat}
                                    style={styles.categoryOption}
                                    onPress={() => {
                                        setCategory(cat);
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    <MaterialIcons 
                                        name={categoryIcons[cat]} 
                                        size={24} 
                                        color="#666" 
                                    />
                                    <Text style={styles.categoryOptionText}>{cat}</Text>
                                    {category === cat && (
                                        <MaterialIcons name="check" size={24} color="#A8E6CF" />
                                    )}
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 30,
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
    inputSection: {
        marginHorizontal: 20,
        marginBottom: 25,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    categorySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
        fontWeight: '500',
    },
    dateSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
        fontWeight: '500',
    },
    descriptionInput: {
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
        textAlignVertical: 'top',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addButton: {
        backgroundColor: '#A8E6CF',
        marginHorizontal: 20,
        borderRadius: 15,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addButtonDisabled: {
        backgroundColor: '#ccc',
    },
    addButtonText: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
    },
    suggestionsSection: {
        marginHorizontal: 20,
        marginBottom: 100,
    },
    suggestionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    suggestionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    suggestionItem: {
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
    suggestionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    suggestionDesc: {
        fontSize: 12,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    categoryList: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoryOptionText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
    },
});

export default AddExpenseScreen; 