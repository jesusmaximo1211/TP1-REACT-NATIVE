// app-tabs.tsx
// Este componente define la barra de navegación inferior (Tab Bar) para
// dispositivos nativos (Android e iOS).
// En la web se usa app-tabs.web.tsx en su lugar (Expo los distingue automáticamente).

// NativeTabs es el componente de Expo Router que genera los tabs nativos del SO
import { NativeTabs } from 'expo-router/unstable-native-tabs';

// useColorScheme detecta si el usuario tiene el modo oscuro o claro activado en su celular
import { useColorScheme } from 'react-native';

// Colors es nuestra paleta de colores definida en constants/theme
import { Colors } from '@/constants/theme';

export default function AppTabs() {
  // scheme puede ser 'light', 'dark' o 'unspecified'
  const scheme = useColorScheme();

  // Si por alguna razón el scheme es nulo o 'unspecified', usamos 'light' por defecto
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    // NativeTabs renderiza la barra de tabs con los colores del tema del sistema
    <NativeTabs
      backgroundColor={colors.background}         // Color de fondo de la barra
      indicatorColor={colors.backgroundElement}    // Color del indicador del tab activo
      labelStyle={{ selected: { color: colors.text } }}  // Color del texto seleccionado
    >
      {/* --- Tab 1: Ejercicio 01 - Contador --- */}
      {/* name="index" hace referencia al archivo src/app/index.tsx */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>01 - Contador</NativeTabs.Trigger.Label>
        {/* Ícono que se muestra en la tab. renderingMode="template" permite tintarlo con color */}
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* --- Tab 2: Ejercicio 02 - To-Do List --- */}
      {/* name="explore" hace referencia al archivo src/app/explore.tsx */}
      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>02 - To-Do List</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
