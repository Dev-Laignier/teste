import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo"; // Import NetInfo from React Native
import { useNavigation, NavigationProp } from "@react-navigation/native"; // Import the navigation hook from React Navigation
import LottieView from "lottie-react-native"; // Import the Lottie animation component
import { Image, Text } from "react-native"; // Import the React Native image component
import { Center, ScrollView } from "native-base"; // Import the React Native Base components
import { TouchableOpacity } from "react-native-gesture-handler"; // Import TouchableOpacity to create a clickable button
import { Texto, Goback, Title, Animation, TextRecovery } from "./styles"; // Import custom styles
import Button from "../../../components/Button"; // Import a custom button component
import Input from "../../../components/Input"; // Import a custom input component
import firebaseConfig from "../../../settings/Firebase/firebaseconfig"; // Import a custom Firebase configuration
import { initializeApp } from "firebase/app"; // Initialize the app with the Firebase configuration
import { getAuth, signInWithEmailAndPassword, UserCredential } from "firebase/auth"; // Get the auth token from the Firebase configuration object and pass it to the login method when the user is logged in with the Firebase credentials passed 
import AsyncStorage from '@react-native-community/async-storage'; // Import AsyncStorage for local storagefrom the Firebase configuration object and pass it to the login method when the user is logged in with the Firebase credentials
import { useForm, Controller } from "react-hook-form"; // Import react-hook-form and related packages
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Define a type for the available stack routes
type StackRoutes = {
  Login: undefined; // "Login" screen with no additional parameters
  SignUp: undefined; // "SignUp" screen with no additional parameters
  Welcome: undefined; // "Welcome" screen with no additional parameters
  Home: undefined; // "Home" screen with no additional parameters
  // You can include other screens and their parameters here as needed
};

// Define a type for the form data
type FormDataProps = {
  email: string; // User's email
  password: string; // User's password
};

// Validation schema for the form fields
const loginSchema = yup.object({
  email: yup.string().required("Please provide your email").email("Invalid email"),
  password: yup.string().required("Please provide your password").min(6, "Password must be at least 6 characters"),
});

const app = initializeApp(firebaseConfig); // Initialize the app with the Firebase configuration
const auth = getAuth(app); // Get the authentication configuration

const Login = () => {
  const navigation: NavigationProp<StackRoutes> = useNavigation(); // Initialize the navigation hook

  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm<FormDataProps>({
    resolver: yupResolver(loginSchema),
  });

  useEffect(() => {
    // Check if there are stored user data and fill the fields
    checkAndFillStoredUser();
  }, []);

  const checkAndFillStoredUser = async () => {
    try {
      // Check if the user has already been logged in and fill the fields with the stored user data
      const storedUserData = await AsyncStorage.getItem("storedUserData");
      if (storedUserData) {
        // If there are stored data, parse and fill the fields
        const userData = JSON.parse(storedUserData);
        setValue("email", userData.email);
        //setValue("password", userData.password);
      }
    } catch (error) {
      console.error("Error fetching stored user data:", error);
    }
  };

  const handleLogin = async (data: FormDataProps) => {
    try {
      // Store user data in AsyncStorage
      await AsyncStorage.setItem(
        "storedUserData",
        JSON.stringify({
          email: data.email,
          password: data.password,
        })
      );
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // After successful login, get the authentication token
      const idToken = await user.getIdToken(/* forceRefresh */ false);

      // Store the token in AsyncStorage
      await AsyncStorage.setItem("authToken", idToken);

      navigation.navigate("Home");
    } catch (error) {
      console.error(error);
    }
  };

  const handleForgotPassword = () => {
    // Implement the logic to recover the password here
  };

  const handleGoBack = () => {
    navigation.navigate("Welcome"); // Go back to the previous screen when the button is pressed
  };

  return (
    <ScrollView flex={1} showsVerticalScrollIndicator={false}>
      <Center>
        <Goback onPress={handleGoBack} activeOpacity={0.7}>
          <Image source={require("../../../assets/icon/seta.png")} />
        </Goback>
        <Animation>
          <LottieView
            autoPlay
            loop
            resizeMode="contain"
            speed={0.2}
            source={require("../../../assets/animation/Earth_Green_Blue.json")}
          />
        </Animation>
        <Title style={{ alignSelf: "center" }}>
          Faça login com seu e-mail e senha
        </Title>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur } }) => (
            <Input
              label="Email"
              onChangeText={onChange}
              value={getValues("email")}
              errorMessage={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur } }) => (
            <Input
              label="Password"
              secureTextEntry
              onChangeText={onChange}
              value={getValues("password")}
              errorMessage={errors.password?.message}
            />
          )}
        />
        <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.6}>
          <TextRecovery>
            Esqueceu sua senha? podemos te ajudar!!
          </TextRecovery>
        </TouchableOpacity>
        <Button onPress={handleSubmit(handleLogin)} mb={12}>
          <Texto>Login</Texto>
        </Button>
      </Center>
    </ScrollView>
  );
};

export default Login;
