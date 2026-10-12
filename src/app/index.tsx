// index.tsx — Ejercicio 01 - A: Contador + Toggle de Tema
// Este archivo es la primera pantalla de la app (Tab "01 - Contador").
// Expo Router usa la convención de nombres: index.tsx = ruta raíz "/"

import React, { useState } from 'react';

// View = contenedor genérico (como un <div> en HTML)
// Text = componente para mostrar texto
// Pressable = botón con soporte para efectos visuales al presionar
// ScrollView = contenedor que permite hacer scroll si el contenido es muy largo
import { View, Text, Pressable, ScrollView } from 'react-native';

// SafeAreaView respeta el "notch" del celular y la barra de navegación
// para que el contenido no quede tapado por ellos
import { SafeAreaView } from 'react-native-safe-area-context';

// Importamos nuestro custom hook de estilos (Bonus del TP)
// ThemeMode es el tipo TypeScript: 'light' | 'dark'
import { useThemeStyles, ThemeMode } from '@/hooks/useThemeStyles';

export default function CounterScreen() {
  // ── ESTADOS ──────────────────────────────────────────────────────────────
  // useState devuelve [valorActual, funcionParaCambiarElValor]
  // <number> y <ThemeMode> son los tipos TypeScript de cada estado

  // Estado del contador — valor inicial: 0 (criterio de la consigna)
  const [count, setCount] = useState<number>(0);

  // Estado del tema — valor inicial: 'light' / claro (criterio de la consigna)
  const [theme, setTheme] = useState<ThemeMode>('light');

  // ── ESTILOS DINÁMICOS ─────────────────────────────────────────────────────
  // Bonus: useThemeStyles() genera todos los estilos adaptados al tema actual.
  // Cuando `theme` cambia, el hook recalcula los estilos automáticamente.
  const styles = useThemeStyles(theme);

  // ── CONSTANTES ────────────────────────────────────────────────────────────
  const MAX_COUNT = 10; // Límite máximo (Bonus: deshabilitar botón al llegar aquí)
  const isMaxReached = count >= MAX_COUNT; // true si el contador llegó al límite

  // ── MANEJADORES DE EVENTOS ────────────────────────────────────────────────

  // Se llama al presionar "+1 Incrementar"
  // Usa la forma funcional del setter (prev => prev + 1) para asegurarse de
  // operar sobre el valor más reciente del estado (buena práctica en React)
  const handleIncrement = () => {
    if (!isMaxReached) {
      setCount((prev) => prev + 1);
    }
  };

  // Se llama al presionar "Resetear a 0"
  const handleReset = () => {
    setCount(0);
  };

  // Se llama al presionar el botón de tema
  // Alterna entre 'light' y 'dark' con un operador ternario
  const handleToggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    // SafeAreaView: evita que el contenido quede detrás del notch o las barras del sistema
    <SafeAreaView style={styles.container}>

      {/* ScrollView: permite hacer scroll si la pantalla es muy pequeña */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,          // Ocupa todo el alto disponible
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
        showsVerticalScrollIndicator={false} // Oculta la barra de scroll lateral
      >
        {/* ── Tarjeta / Contenedor principal ── */}
        <View style={styles.card}>

          {/* Badge informativo: muestra el nombre del ejercicio y el tema activo */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Ejercicio 01 - A • Tema {theme === 'light' ? 'Claro' : 'Oscuro'}
            </Text>
          </View>

          {/* Título y subtítulo de la pantalla */}
          <Text style={styles.title}>Contador Interactivo</Text>
          <Text style={styles.subtitle}>
            Práctica Base de React Native
          </Text>

          {/* Círculo con el número del contador — Grande y centrado (criterio del TP) */}
          <View style={styles.counterCircle}>
            <Text style={styles.counterNumber}>{count}</Text>
          </View>

          {/* Bonus: Zona de aviso. Cuando se llega a 10, muestra un mensaje de alerta.
              Siempre tiene altura mínima (warningContainer) para que el layout
              no "salte" cuando el mensaje aparece o desaparece. */}
          <View style={styles.warningContainer}>
            {isMaxReached && (
              <Text style={styles.warningText}>
                ⚠️ ¡Límite alcanzado! Máximo permitido: {MAX_COUNT}
              </Text>
            )}
          </View>

          {/* ── Botones de acción ── */}
          <View style={styles.actionsContainer}>

            {/* Botón +1 — Bonus: se deshabilita cuando se llega al límite */}
            {/* Pressable acepta una función como 'style' para aplicar estilos dinámicos al presionar */}
            <Pressable
              onPress={handleIncrement}
              disabled={isMaxReached} // Deshabilita el toque cuando se llegó al máximo
              style={({ pressed }) => [
                styles.button,
                // Si llegó al límite, aplica estilos de deshabilitado; si no, estilos primarios
                isMaxReached ? styles.primaryButtonDisabled : styles.primaryButton,
                // Bonus: feedback visual al presionar (opacidad + ligera reducción de escala)
                pressed && !isMaxReached && { opacity: 0.75, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  // Si está deshabilitado, cambia el color del texto
                  isMaxReached && styles.primaryButtonTextDisabled,
                ]}
              >
                +1 Incrementar
              </Text>
            </Pressable>

            {/* Botón Reset — vuelve el contador a 0 */}
            <Pressable
              onPress={handleReset}
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.secondaryButtonText}>🔄 Resetear a 0</Text>
            </Pressable>

            {/* Botón Toggle de Tema — alterna entre claro y oscuro */}
            {/* El texto del botón cambia según el tema actual para indicar la acción */}
            <Pressable
              onPress={handleToggleTheme}
              style={({ pressed }) => [
                styles.button,
                styles.toggleButton,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.toggleButtonText}>
                {theme === 'light' ? '🌙 Cambiar a Modo Oscuro' : '☀️ Cambiar a Modo Claro'}
              </Text>
            </Pressable>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
