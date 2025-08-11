import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

const Signup = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: User Details, 2: OTP Verification
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer for resend OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://expensify-api-8g94.onrender.com/api/v1/sendOTP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log("Send OTP Response:", response.status, data);

      if (response.ok) {
        Alert.alert("Success", "OTP sent to your email address!");
        setStep(2);
        setResendTimer(60); // 60 seconds countdown
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://expensify-api-8g94.onrender.com/api/v1/verifyOTPAndSignup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();
      console.log("Verify OTP Response:", response.status, data);

      if (response.ok) {
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.push("/loginPage") }
        ]);
      } else {
        Alert.alert("Error", data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);

    try {
      const response = await fetch("https://expensify-api-8g94.onrender.com/api/v1/resendOTP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();
      console.log("Resend OTP Response:", response.status, data);

      if (response.ok) {
        Alert.alert("Success", "New OTP sent to your email!");
        setResendTimer(60);
        setOtp("");
      } else {
        Alert.alert("Error", data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const goBackToStep1 = () => {
    setStep(1);
    setOtp("");
  };

  if (step === 1) {
    // Step 1: User Details
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create a New Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Pressable 
          style={[styles.signupButton, loading && styles.disabledButton]} 
          onPress={handleSendOTP}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/loginPage")}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </Pressable>
      </View>
    );
  }

  // Step 2: OTP Verification
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit code to {email}
      </Text>

      <TextInput
        style={[styles.input, styles.otpInput]}
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
      />

      <Pressable 
        style={[styles.signupButton, loading && styles.disabledButton]} 
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Text>
      </Pressable>

      <View style={styles.resendContainer}>
        {resendTimer > 0 ? (
          <Text style={styles.timerText}>
            Resend OTP in {resendTimer}s
          </Text>
        ) : (
          <Pressable onPress={handleResendOTP} disabled={loading}>
            <Text style={[styles.resendText, loading && styles.disabledText]}>
              Resend OTP
            </Text>
          </Pressable>
        )}
      </View>

      <Pressable onPress={goBackToStep1}>
        <Text style={styles.backText}>← Back to Registration</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5E7D1",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  input: {
    width: "90%",
    backgroundColor: "white",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 8,
  },
  signupButton: {
    backgroundColor: "#D4A373",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    marginTop: 15,
  },
  disabledButton: {
    backgroundColor: "#A0A0A0",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginText: {
    marginTop: 15,
    fontSize: 16,
    color: "#8B5E3C",
    textDecorationLine: "underline",
  },
  resendContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  resendText: {
    fontSize: 16,
    color: "#8B5E3C",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  timerText: {
    fontSize: 16,
    color: "#666",
  },
  disabledText: {
    color: "#A0A0A0",
  },
  backText: {
    marginTop: 20,
    fontSize: 16,
    color: "#8B5E3C",
    textDecorationLine: "underline",
  },
});

export default Signup;