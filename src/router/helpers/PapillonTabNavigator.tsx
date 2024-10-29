import { BottomTabView } from "@react-navigation/bottom-tabs";
import {
  createNavigatorFactory,
  ParamListBase,
  TabNavigationState,
  TabRouter,
  useNavigationBuilder,
} from "@react-navigation/native";
import { Text } from "react-native";

import React, { useEffect, useRef, useState } from "react";
import { View, Dimensions } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCurrentAccount } from "@/stores/account";
import { useTheme } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { PressableScale } from "react-native-pressable-scale";

import colorsList from "@/utils/data/colors.json";

import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type DescriptorOptions = {
  tabBarLabel?: string;
  title?: string;
  tabBarIcon?: any;
  tabBarLottie?: any;
  tabEnabled?: boolean
  tabBarAccessibilityLabel?: string;
  tabBarTestID?: string
};

const BasePapillonBar: React.FC<Omit<ReturnType<typeof useNavigationBuilder>, "NavigationContent">> = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const account = useCurrentAccount(store => store.account);
  const [shouldShowLabel, setShouldShowLabel] = React.useState(true);

  const [transparentTabBar, setTransparentTabBar] = React.useState(false);
  const [hideTabBar, setHideTabBar] = React.useState(false);

  const [showTabBackground, setShowTabBackground] = React.useState(false);

  useEffect(() => {
    setShouldShowLabel(!(account?.personalization.hideTabTitles ?? false));
    setShowTabBackground(account?.personalization.showTabBackground ?? false);
    setTransparentTabBar(account?.personalization.transparentTabBar ?? false);
    setHideTabBar(account?.personalization.hideTabBar ?? false);
  }, [account, account?.personalization]);

  const bottomAnim = useSharedValue(1);

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: withTiming(bottomAnim.value, { duration: 200 }),
  }));

  React.useEffect(() => {
    bottomAnim.value = hideTabBar ? 0 : 1;
  }, [hideTabBar]);

  return (
    <Reanimated.View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.text + "22",
          borderTopWidth: 0.5
        },
        transparentTabBar && {
          position: "absolute",
          bottom: 0,
          width: "100%",
          backgroundColor: "transparent",
          borderTopWidth: 0,
        },
        animatedStyles,
      ]}
    >
      <Reanimated.View
        style={[
          {
            flexDirection: "row",
            paddingBottom: insets.bottom + (insets.bottom > 20 ? 4 : 8),
            paddingHorizontal: 8,
            paddingTop: 8,
            alignContent: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.card,
          },
          transparentTabBar && {
            backgroundColor: "transparent",
            borderTopWidth: 0,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key] as {
            options: DescriptorOptions
          };

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const icon = options.tabBarIcon && options.tabBarIcon;

          const isFocused = state.index === index;

          const lottie = useRef<LottieView>(null);

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            lottie.current?.play();

            navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          if (!options.tabEnabled) {
            return null;
          }

          const autoColor = colorsList.filter(c => c.hex.primary === theme.colors.primary)[0];
          const tabColor = isFocused ?
            (theme.dark ? autoColor.hex.lighter : autoColor.hex.dark) : (theme.dark ? "#656c72" : "#8C9398");

          return (
            <PressableScale
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 4.5,
              }}
              activeScale={0.85}
              weight="light"
            >
              <View
                style={[
                  {
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  showTabBackground && {
                    backgroundColor: isFocused ? tabColor + "22" : "transparent",
                    borderRadius: 12,
                    width: 42,
                    height: 42,
                  },
                  showTabBackground && shouldShowLabel && {
                    height: 36,
                    width: 52,
                    borderRadius: 120,
                    marginBottom: -2,
                  },
                ]}
              >
                {!options.tabBarLottie && icon && React.cloneElement(icon, {
                  size: 24,
                  color: tabColor,
                })}

                {options.tabBarLottie && (
                  <LottieView
                    loop={false}
                    source={options.tabBarLottie}
                    colorFilters={[{
                      keypath: "*",
                      color: tabColor,
                    }]}
                    style={[
                      {
                        width: 26,
                        height: 26,
                      },
                      !shouldShowLabel && {
                        marginVertical: 6,
                        width: 28,
                        height: 28,
                      },
                    ]}
                    ref={lottie}
                  />
                )}
              </View>

              {shouldShowLabel && (
                <Text style={{
                  color: tabColor,
                  fontFamily: "semibold", fontSize: 13,
                }}>
                  {label}
                </Text>
              )}
            </PressableScale>
          );
        })}
      </Reanimated.View>
    </Reanimated.View>
  );
};

export const LargePapillonBar: React.FC<Omit<ReturnType<typeof useNavigationBuilder>, "NavigationContent">> = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const account = useCurrentAccount(store => store.account!);
  const [shouldShowLabel, setShouldShowLabel] = React.useState(true);

  const [transparentTabBar, setTransparentTabBar] = React.useState(false);
  const [hideTabBar, setHideTabBar] = React.useState(false);

  const [showTabBackground, setShowTabBackground] = React.useState(false);

  useEffect(() => {
    setShouldShowLabel(!account.personalization.hideTabTitles);
    setShowTabBackground(account.personalization.showTabBackground ?? false);
    setTransparentTabBar(account.personalization.transparentTabBar ?? false);
    setHideTabBar(account.personalization.hideTabBar ?? false);
  }, [account.personalization]);

  const bottomAnim = useSharedValue(1);

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: withTiming(bottomAnim.value, { duration: 200 }),
  }));

  React.useEffect(() => {
    bottomAnim.value = hideTabBar ? 0 : 1;
  }, [hideTabBar]);

  return (
    <Reanimated.View
      style={[
        {
          backgroundColor: theme.colors.card,
          width: 320,
          maxWidth: "35%",
        },
      ]}
    >
      <Reanimated.View
        style={[
          {
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingHorizontal: 8,
            flexDirection: "column",
            alignContent: "flex-start",
            justifyContent: "flex-start",
            borderColor: theme.colors.border,
            borderRightWidth: 0.5,
          }
        ]}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontFamily: "bold",
            fontSize: 24,
            letterSpacing: -0.5,
            marginHorizontal: 8,
            marginBottom: 16,
            marginTop: 16,
          }}
        >
          Papillon
        </Text>

        <View
          style={{
            flexDirection: "column",
            alignContent: "flex-start",
            justifyContent: "flex-start",
            gap: 1,
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key] as {
              options: DescriptorOptions
            };

            const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

            const icon = options.tabBarIcon && options.tabBarIcon;

            const isFocused = state.index === index;

            const lottie = useRef<LottieView>(null);

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              lottie.current?.play();

              navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            const autoColor = colorsList.filter(c => c.hex.primary === theme.colors.primary)[0];
            const tabColor = isFocused ?
              (theme.dark ? autoColor.hex.lighter : autoColor.hex.dark) : (theme.dark ? theme.colors.text : autoColor.hex.darker);

            return (
              <PressableScale
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{
                  width: "100%",
                  backgroundColor: isFocused ? theme.colors.primary + "22" : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  borderRadius: 12,
                  borderCurve: "continuous",
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  gap: 12,
                }}
                activeScale={0.95}
                weight="light"
              >
                <View
                  style={[
                    {
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  {options.tabBarLottie && (
                    <LottieView
                      loop={false}
                      source={options.tabBarLottie}
                      colorFilters={[{
                        keypath: "*",
                        color: tabColor,
                      }]}
                      style={[
                        {
                          width: 24,
                          height: 24,
                        }
                      ]}
                      ref={lottie}
                    />
                  )}
                </View>


                <Text style={{
                  color: tabColor,
                  fontFamily: "medium", fontSize: 17,
                  marginTop: 2,
                }}>
                  {label}
                </Text>

              </PressableScale>
            );
          })}
        </View>
      </Reanimated.View>
    </Reanimated.View>
  );
};

const BottomTabNavigator: React.ComponentType<any> = ({
  initialRouteName,
  backBehavior,
  children,
  screenOptions,
  ...rest
}) => {
  const [tablet, setTablet] = useState<boolean>(false);

  useEffect(() => {
    const updateTabletOrientation = () => {
      const dims = Dimensions.get("screen");
      const tabletWidth = dims.width;
      const tabletHeight = dims.height;
      const tabletDiagl = (tabletWidth / tabletHeight) * 10;
      setTablet(tabletDiagl >= 6.9);
    };
    updateTabletOrientation(); // 1ère fois qu'on arrive sur la page

    const subscription = Dimensions.addEventListener("change", updateTabletOrientation); // Dès qu'on change de rotation
    return () => subscription.remove(); // Permet d'éviter les fuites de mémoire
  }, []);

  const { state, descriptors, navigation, NavigationContent } =
    useNavigationBuilder(TabRouter, {
      initialRouteName,
      backBehavior,
      children,
      screenOptions,
    });

  return (
    <NavigationContent>
      <View
        style={[
          {
            flex: 1,
          },
          tablet && {
            flexDirection: "row-reverse",
          },
        ]}
      >
        <BottomTabView
          {...rest}
          state = { state }
          navigation = { navigation }
          descriptors = { descriptors }
        />
        {!tablet ?
          <BasePapillonBar state={state} descriptors={descriptors} navigation={navigation} />
          :
          <LargePapillonBar state={state} descriptors={descriptors} navigation={navigation} />
        }
      </View>
    </NavigationContent>
  );
};

export default createNavigatorFactory(BottomTabNavigator);
