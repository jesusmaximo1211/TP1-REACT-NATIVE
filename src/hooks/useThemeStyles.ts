// useThemeStyles.ts — Custom Hook de Estilos Tipados
// Bonus del Ejercicio 01: En lugar de escribir los estilos dentro del componente
// y llenarlo de condicionales (if dark then color X else color Y), extraemos
// toda esa lógica a este hook reutilizable.
//
// ¿Qué es un custom hook en React?
// Es simplemente una función que empieza con "use" y puede usar otros hooks de React.
// Nos permite reutilizar lógica entre componentes de forma limpia.

import { StyleSheet } from 'react-native';

// ── TIPOS TYPESCRIPT ──────────────────────────────────────────────────────────

// ThemeMode: solo puede ser 'light' o 'dark'. TypeScript nos avisa si
// intentamos usar otro valor como 'blue' o 'auto'.
export type ThemeMode = 'light' | 'dark';

// ThemeColors: define la "forma" (shape) del objeto de colores.
// Cada propiedad es un string con un color hexadecimal.
// Esto nos da autocompletado y detección de errores en el editor.
export interface ThemeColors {
  background: string;           // Fondo de la pantalla
  cardBackground: string;       // Fondo de la tarjeta/contenedor
  cardBorder: string;           // Borde de la tarjeta
  textPrimary: string;          // Texto principal
  textSecondary: string;        // Texto secundario (subtítulos, hints)
  accent: string;               // Color de acento (número del contador)
  counterBackground: string;    // Fondo del círculo del contador
  counterBorder: string;        // Borde del círculo del contador
  buttonPrimaryBg: string;      // Fondo del botón principal (+1)
  buttonPrimaryText: string;    // Texto del botón principal
  buttonSecondaryBg: string;    // Fondo del botón secundario (Reset)
  buttonSecondaryBorder: string;// Borde del botón secundario
  buttonSecondaryText: string;  // Texto del botón secundario
  buttonDisabledBg: string;     // Fondo del botón deshabilitado
  buttonToggleBg: string;       // Fondo del botón de tema
  buttonToggleBorder: string;   // Borde del botón de tema
  buttonToggleText: string;     // Texto del botón de tema
  warningText: string;          // Texto del aviso de límite alcanzado
}

// ── FUNCIÓN DE PALETA DE COLORES ──────────────────────────────────────────────
// Recibe el tema y devuelve el objeto de colores correspondiente.
// Definimos los colores de cada tema en un solo lugar para fácil mantenimiento.
export const getThemeColors = (theme: ThemeMode): ThemeColors => {
  const isDark = theme === 'dark'; // true si el tema es oscuro

  return {
    // Fondos
    background:         isDark ? '#121212' : '#F4F6F9',  // Pantalla completa
    cardBackground:     isDark ? '#1E1E1E' : '#FFFFFF',  // Tarjeta
    cardBorder:         isDark ? '#2D2D2D' : '#E2E8F0',

    // Textos
    textPrimary:        isDark ? '#F8FAFC' : '#0F172A',
    textSecondary:      isDark ? '#94A3B8' : '#64748B',

    // Acento (número del contador)
    accent:             isDark ? '#38BDF8' : '#0284C7',  // Azul claro / Azul oscuro

    // Círculo del contador
    counterBackground:  isDark ? '#262626' : '#F1F5F9',
    counterBorder:      isDark ? '#404040' : '#CBD5E1',

    // Botón principal (+1 Incrementar)
    buttonPrimaryBg:    isDark ? '#2563EB' : '#1D4ED8',
    buttonPrimaryText:  '#FFFFFF',                        // Blanco siempre

    // Botón secundario (Reset)
    buttonSecondaryBg:     'transparent',
    buttonSecondaryBorder: isDark ? '#4B5563' : '#CBD5E1',
    buttonSecondaryText:   isDark ? '#E2E8F0' : '#334155',

    // Botón deshabilitado (cuando count === 10)
    buttonDisabledBg:   isDark ? '#374151' : '#E2E8F0',

    // Botón de toggle de tema
    buttonToggleBg:     isDark ? '#334155' : '#E2E8F0',
    buttonToggleBorder: isDark ? '#475569' : '#CBD5E1',
    buttonToggleText:   isDark ? '#F8FAFC' : '#1E293B',

    // Texto de aviso (rojo)
    warningText: '#EF4444',
  };
};

// ── CUSTOM HOOK ───────────────────────────────────────────────────────────────
// useThemeStyles: recibe el tema actual y devuelve un objeto de estilos
// creado con StyleSheet.create() (que es la forma optimizada de hacer estilos en RN).
//
// El componente lo usa así:
//   const styles = useThemeStyles(theme);
//   <View style={styles.card}>...</View>
export function useThemeStyles(theme: ThemeMode) {
  // Obtenemos la paleta de colores según el tema
  const colors = getThemeColors(theme);
  const isDark = theme === 'dark';

  // StyleSheet.create() valida los estilos en tiempo de desarrollo
  // y los optimiza para el render nativo
  return StyleSheet.create({
    // Contenedor de la pantalla completa
    container: {
      flex: 1,                          // Ocupa todo el espacio disponible
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },

    // Tarjeta central donde vive todo el contenido
    card: {
      width: '100%',
      maxWidth: 380,                    // Limita el ancho en tablets y web
      backgroundColor: colors.cardBackground,
      borderRadius: 24,                 // Esquinas redondeadas
      paddingVertical: 28,
      paddingHorizontal: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
      // Sombras — En iOS se usa shadowColor/Offset/Opacity/Radius
      shadowColor: isDark ? '#000000' : '#64748B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 16,
      // En Android la sombra se controla con elevation
      elevation: 5,
    },

    // Etiqueta pequeña en la parte superior de la tarjeta
    badge: {
      backgroundColor: isDark ? '#374151' : '#E2E8F0',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 12,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Título y subtítulo
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
      marginBottom: 16,
      textAlign: 'center',
    },

    // Círculo que muestra el número del contador
    counterCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,                 // La mitad del ancho/alto = círculo perfecto
      backgroundColor: colors.counterBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 12,
      borderWidth: 2,
      borderColor: colors.counterBorder,
    },
    // Número grande y centrado (criterio del TP)
    counterNumber: {
      fontSize: 56,
      fontWeight: 'bold',
      color: colors.accent,
    },

    // Contenedor del mensaje de aviso (siempre existe para no "saltar" el layout)
    warningContainer: {
      minHeight: 24,                    // Altura mínima aunque no haya mensaje
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    warningText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.warningText,        // Rojo
    },

    // Contenedor de los tres botones
    actionsContainer: {
      width: '100%',
      gap: 12,                          // Espacio entre botones
    },

    // Estilo base de todos los botones (compartido)
    button: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },

    // Estilos específicos de cada tipo de botón
    primaryButton: {
      backgroundColor: colors.buttonPrimaryBg,
    },
    primaryButtonDisabled: {
      backgroundColor: colors.buttonDisabledBg,  // Gris cuando está deshabilitado
    },
    primaryButtonText: {
      color: colors.buttonPrimaryText,
      fontSize: 16,
      fontWeight: '600',
    },
    primaryButtonTextDisabled: {
      color: colors.textSecondary,      // Texto gris cuando está deshabilitado
    },
    secondaryButton: {
      backgroundColor: colors.buttonSecondaryBg,
      borderWidth: 1.5,
      borderColor: colors.buttonSecondaryBorder,
    },
    secondaryButtonText: {
      color: colors.buttonSecondaryText,
      fontSize: 15,
      fontWeight: '600',
    },
    toggleButton: {
      backgroundColor: colors.buttonToggleBg,
      borderWidth: 1,
      borderColor: colors.buttonToggleBorder,
      marginTop: 4,
    },
    toggleButtonText: {
      color: colors.buttonToggleText,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
