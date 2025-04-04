import { NavigationContainer, useTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import { I18nManager, useColorScheme } from "react-native";
import SettingBtn from "./src/components/SettingBtn";
import SettingsModal from "./src/components/SettingsModal";
import FileUploadScreen from "./src/screens/FileUploadScreen";
import HomeScreen from "./src/screens/HomeScreen";
import { useSettingsModalStore } from "./src/stores/settingsModalStore";
import DarkTheme from "./src/themes/DarkTheme";
import LightTheme from "./src/themes/LightTheme";
import "./i18n";
import { ShareIntentProvider } from "expo-share-intent";
import OnBoardDialog from "./src/components/OnBoardModal";
import React, {useEffect, useState} from 'react';
import {View, Text, Alert, BackHandler} from 'react-native';
// import CodePush from '@chlee1001/react-native-code-push';
import {version as currentVersion} from './package.json';
import CodePush from '@chlee1001/react-native-code-push';
import Snackbar from './src/components/common/snackbar';
const Stack = createNativeStackNavigator();

function App() {
	const { colors } = useTheme();
	const { theme } = useSettingsModalStore();
	const defaultColorScheme = useColorScheme();
	const [snackbarVisible, setSnackbarVisible] = useState(true);
	I18nManager.allowRTL(false);
	I18nManager.forceRTL(false);

	const systemColorSheme =
		defaultColorScheme === "dark" ? DarkTheme : LightTheme;

	const customTheme =
		theme === "dark" ? DarkTheme : theme === "light" ? LightTheme : DarkTheme;

	const appTheme = theme === "system" ? systemColorSheme : customTheme;

	useEffect(() => {
		CodePush.sync(
			{
				installMode: CodePush.InstallMode.ON_NEXT_RESTART,
			},
			(syncStatus) => {
				// Güncelleme yüklendiyse snackbar'ı göster
				if (syncStatus === CodePush.SyncStatus.UPDATE_INSTALLED) {
					setSnackbarVisible(true);
				}
			}
		);
	}, []);
	return (
		<ShareIntentProvider>
			<NavigationContainer theme={appTheme}>
				<ThemedStatusBar />
				<SettingsModal />
				<OnBoardDialog />
				<Stack.Navigator
					screenOptions={{
						title: "",
						headerRight: () => <SettingBtn />,
						headerShadowVisible: false,
						animation: "ios",
						animationDuration: 1000,
					}}
					initialRouteName="Upload file"
				>
					<Stack.Screen name="Home" component={HomeScreen} />
					<Stack.Screen
						options={{
							contentStyle: {
								borderTopColor: colors.border,
								borderTopWidth: 0.2,
							},
						}}
						name="Upload file"
						component={FileUploadScreen}
					/>
					<Snackbar
						visible={snackbarVisible}
						message="The app has been updated. Please restart to apply changes."
						onDismiss={() => setSnackbarVisible(false)}
						actionLabel="Restart"
						onActionPress={() => CodePush.restartApp()}
						autoHide={false}
						swipeToDismiss
					/>
				</Stack.Navigator>
			</NavigationContainer>
		</ShareIntentProvider>
	);
}

export default CodePush({checkFrequency: CodePush.CheckFrequency.MANUAL})(App);

function ThemedStatusBar() {
	const { dark } = useTheme();
	const { isVisible } = useSettingsModalStore();

	return (
		<StatusBar
			barStyle={!dark ? "dark-content" : "light-content"}
			backgroundColor={isVisible ? "#00000080" : undefined}
			animated
		/>
	);
}
