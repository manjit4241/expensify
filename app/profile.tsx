import { Image, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const Profile = () => {
    const router = useRouter();
    return (
        <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}  
            showsVerticalScrollIndicator={false}
        >
            <SafeAreaView style={styles.mainContainer}>
                
                {/* Back Button */}
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={20} color={'black'} />
                    <Text style={styles.backTxt}>Back</Text>
                </Pressable>

                {/* Profile Info */}
                <View style={styles.personInfo}>
                    <Image source={{ uri: 'https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }} style={styles.personDp} />
                    <Text style={styles.personName}>Alex John</Text>
                    <Text style={styles.personID}>ID: AH56TTR543</Text>
                </View>

                {/* Options List */}
                <View style={styles.boxContainer}>
                    {[
                        { icon: "person-circle", title: "User profile", subtitle: "Change profile image, name or password" },
                        { icon: "checkmark-circle", title: "Premium plans", subtitle: "Explore premium options and enjoy" },
                        { icon: "card", title: "Accounts", subtitle: "Manage accounts and description" },
                        { icon: "attach-money", title: "Currencies", subtitle: "Add other currencies, adjust exchange rate", iconType: MaterialIcons },
                        { icon: "grid", title: "Categories", subtitle: "Manage categories and add sub-categories" },
                        { icon: "lock-closed", title: "Security", subtitle: "Protect your app with PIN or Fingerprint" }
                    ].map((item, index) => (
                        <View style={styles.box} key={index}>
                            <View style={styles.boxIcon}>
                                {item.iconType ? 
                                    <item.iconType name={item.icon} size={25} color="black" /> : 
                                    <Ionicons name={item.icon} size={25} color="black" />
                                }
                            </View>
                            <View style={styles.boxText}>
                                <Text style={styles.boxHead}>{item.title}</Text>
                                <Text style={styles.boxStatus}>{item.subtitle}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Logout Button */}
                <View style={styles.logoutSec}>
                    <Pressable 
                        onPress={() => router.replace('/')} 
                        style={({ pressed }) => [
                            styles.logoutBtn,
                            { backgroundColor: pressed ? '#d2f545' : '#b8b4b4' }
                        ]}
                    >
                        <Text style={styles.logoutBtnTxt}>Logout</Text>
                    </Pressable>
                </View>

            </SafeAreaView>
        </ScrollView>
    )
}

export default Profile;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: 25,
    },

    // 🔥 Fix Back Button Layout
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 10,
    },
    backTxt: {
        fontWeight: '600',
        fontSize: 15,
    },

    personInfo: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        marginTop: 20,
    },
    personDp: {
        height: 110,
        width: 110,
        borderRadius: 65,
    },
    personName: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    personID: {
        marginTop: 10,
        fontSize: 15,
        fontWeight: '200',
    },

    boxContainer: {
        marginTop: 20,
    },

    box: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 25,
        alignItems: 'center',
    },
    boxHead: {
        fontSize: 15,
        fontWeight: '500'
    },
    boxStatus: {
        fontSize: 12,
        fontWeight: '200'
    },

    // 🔥 Fix Logout Button Position
    logoutSec: {
        marginTop: 30,
        alignItems: 'center',
    },
    logoutBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
        width: 130,
        height: 50
    },
    logoutBtnTxt: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});
