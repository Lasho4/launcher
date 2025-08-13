import { invoke } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import { t } from "i18next";
import { memo, useCallback, useMemo } from "react";
import { ColorValue, Pressable, StyleSheet, View } from "react-native";
import Icon from "../components/Icon";
import Text from "../components/Text";
import { IN_GAME, IN_GAME_PROCESS_ID } from "../constants/app";
import { images } from "../constants/images";
import { useSettingsModal } from "../states/settingsModal";
import { useTheme } from "../states/theme";
import { sc } from "../utils/sizeScaler";

interface NativeButtonProps {
  size?: number;
  iconSize?: number;
  image: string;
  title?: string;
  onPress: () => void;
}

const NativeWindowTitleBarButtons = memo<NativeButtonProps>(
  ({ size = sc(30), image, onPress, iconSize = 15, title = "" }) => {
    const { theme } = useTheme();

    const buttonStyle = useMemo(
      () => ({
        height: size,
        width: size,
        borderRadius: sc(3),
      }),
      [size]
    );

    const pressableStyle = useMemo(
      () => ({
        height: "100%",
        width: "100%",
        justifyContent: "center" as const,
        alignItems: "center" as const,
      }),
      []
    );

    return (
      <div className="titlebar-button" style={buttonStyle}>
        {/* @ts-ignore */}
        <Pressable style={pressableStyle} onPress={onPress}>
          <Icon
            title={title}
            image={image}
            size={iconSize}
            color={theme.textPrimary}
          />
        </Pressable>
      </div>
    );
  }
);

interface CustomButtonProps {
  size?: number;
  iconSize?: number;
  image: string;
  title?: string;
  onPress: () => void;
  marginRight?: number;
  className?: string;
  color?: ColorValue;
  backgroundColor?: string;
}

const CustomWindowTitleBarButtons = memo<CustomButtonProps>(
  ({
    size = sc(30),
    image,
    onPress,
    iconSize = sc(20),
    title = "",
    className,
    marginRight = 0,
    color,
    backgroundColor,
  }) => {
    const isSvg = useMemo(() => image.includes(".svg"), [image]);

    const containerStyle = useMemo(
      () => ({
        height: size,
        width: size,
        borderRadius: sc(3),
        marginRight,
        backgroundColor,
      }),
      [size, marginRight, backgroundColor]
    );

    const pressableStyle = useMemo(
      () => ({
        height: "100%",
        width: "100%",
        justifyContent: "center" as const,
        alignItems: "center" as const,
      }),
      []
    );

    return (
      <div className={className} style={containerStyle}>
        {/* @ts-ignore */}
        <Pressable style={pressableStyle} onPress={onPress}>
          <Icon
            svg={isSvg}
            title={title}
            image={image}
            size={iconSize}
            color={color}
          />
        </Pressable>
      </div>
    );
  }
);

const WindowTitleBar = memo(() => {
  const { theme, themeType, setTheme } = useTheme();
  const { show: showSettings } = useSettingsModal();

  const containerStyles = useMemo(
    () => ({
      main: {
        width: "100%",
        display: "flex",
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        alignItems: "center" as const,
        paddingTop: sc(15),
        paddingHorizontal: sc(15),
        paddingBottom: sc(8),
      },
      leftSection: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        flex: 1,
      },
      logoContainer: [
        styles.logoContainer,
        { backgroundColor: theme.itemBackgroundColor },
      ],
      titleText: {
        marginLeft: sc(12),
      },
      dragRegion: {
        position: "absolute" as const,
        top: 0,
        left: 0,
        height: sc(32),
        width: "100%",
        display: "flex",
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        alignItems: "center" as const,
        padding: sc(15),
      },
      rightSection: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        height: "100%",
      },
    }),
    [theme.itemBackgroundColor]
  );

  const handleThemeToggle = useCallback(() => {
    setTheme(themeType === "dark" ? "light" : "dark");
  }, [themeType, setTheme]);

  const handleMinimize = useCallback(() => {
    appWindow.minimize();
  }, []);

  const handleMaximize = useCallback(() => {
    appWindow.toggleMaximize();
  }, []);

  const handleClose = useCallback(() => {
    if (IN_GAME) {
      invoke("send_message_to_game", {
        id: IN_GAME_PROCESS_ID,
        message: "close_overlay",
      });
    }

    setTimeout(
      () => {
        appWindow.close();
      },
      IN_GAME ? 300 : 0
    );
  }, []);

  const themeIcon = useMemo(
    () =>
      themeType === "dark" ? images.icons.lightTheme : images.icons.darkTheme,
    [themeType]
  );

  return (
    // @ts-ignore
    <View style={containerStyles.main}>
      <View style={containerStyles.leftSection}>
        <View style={containerStyles.logoContainer}>
          <Icon image={images.icons.omp} size={sc(22)} />
        </View>
        <Text
          semibold
          size={3}
          color={theme.textPrimary}
          style={containerStyles.titleText}
        >
          Open Multiplayer
        </Text>
      </View>
      <div
        data-tauri-drag-region={!IN_GAME}
        style={containerStyles.dragRegion}
      />
      {/* @ts-ignore */}
      <View style={containerStyles.rightSection}>
        <CustomWindowTitleBarButtons
          title=""
          iconSize={sc(30)}
          image={themeIcon}
          marginRight={sc(10)}
          onPress={handleThemeToggle}
        />
        {!IN_GAME && (
          <>
            <CustomWindowTitleBarButtons
              title={t("settings")}
              image={images.icons.settings}
              marginRight={sc(16)}
              color={theme.textSecondary}
              backgroundColor={theme.itemBackgroundColor}
              onPress={showSettings}
            />
            <NativeWindowTitleBarButtons
              title={t("minimize")}
              image={images.icons.windowMinimize}
              onPress={handleMinimize}
            />
            <NativeWindowTitleBarButtons
              title={t("maximize")}
              image={images.icons.windowMaximize}
              onPress={handleMaximize}
            />
          </>
        )}
        <NativeWindowTitleBarButtons
          title={t("close")}
          image={images.icons.windowClose}
          onPress={handleClose}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  logoContainer: {
    height: sc(32),
    width: sc(32),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: sc(5),
  },
});

NativeWindowTitleBarButtons.displayName = "NativeWindowTitleBarButtons";
CustomWindowTitleBarButtons.displayName = "CustomWindowTitleBarButtons";
WindowTitleBar.displayName = "WindowTitleBar";

export default WindowTitleBar;
