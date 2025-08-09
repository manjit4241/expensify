import { Image, Pressable, SafeAreaView, StyleSheet, Text, View, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { useRouter } from 'expo-router' 

const Home = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.main_container}> 
      <Animated.View style={[styles.upper_container, { opacity: fadeAnim }]}>
        <Image source={require('../assets/images/homeLogo.png')} style={styles.image_box} />
      </Animated.View>
      <View style={styles.lower_container}>
        <View>
          <Text style={styles.heading_text}>Manage your daily life expenses</Text>
          <View style={styles.para}>
            <Text style={styles.para_text}>
              Expense tracker is a simple and efficient personal finance management app that allows you to track your daily expenses and income
            </Text>
          </View>
        </View>
        <View>
          <Pressable 
            onPress={() => router.push('/loginPage')} 
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? '#d2f545' : '#ff5c5c' }
            ]}
          >
            <Text style={styles.text}>Continue →</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
  main_container:{
    flex:1,
    backgroundColor:'#effac3',
    borderRadius:20,
    marginHorizontal: 6,
  },
  upper_container:{
    flex:2,
    justifyContent:'center',
    alignItems:'center',
    paddingTop: 100,
  },
  image_box:{
    height: 270,
    width: 270,
  },
  lower_container:{
    flex:1.3,
    backgroundColor:'white',
    borderTopRightRadius:40,
    borderTopLeftRadius:40,
    marginHorizontal:10 ,
    marginBottom:10,
    alignItems:'center',
    paddingTop:20,
    paddingHorizontal:20,
  },
  heading_text:{
    fontSize:32,
    fontWeight:'bold',
    textAlign:'center'
  },
  para:{
    alignItems:'center',
    marginTop:10,
  },
  para_text:{
    fontWeight:'300',
    textAlign:'center',
    fontSize:13,
  },
  button:{
    height: 60,
    width:250,
    backgroundColor:'#ff5c5c',
    marginTop: 20, 
    borderRadius:100,
    alignItems:'center',
    justifyContent:'center'
  },
  text:{
    fontSize:20,
    fontWeight:'bold',
    color: 'white'
  },
})
 