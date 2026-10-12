# TP1 - Práctica Base de React Native

> **Materia:** Desarrollo de Aplicaciones Móviles
> **Tecnología:** React Native + Expo SDK 57 + TypeScript
> **Framework de navegación:** Expo Router v4

---

## Índice

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Cómo correr la app](#cómo-correr-la-app)
- [Ejercicio 01 - A: Contador + Toggle de Tema](#ejercicio-01---a-contador--toggle-de-tema)
- [Ejercicio 02 - B: To-Do List con FlatList y Persistencia](#ejercicio-02---b-to-do-list-con-flatlist-y-persistencia)
- [Decisiones de diseño globales](#decisiones-de-diseño-globales)

---

## Estructura del Proyecto

```
TP1-ReactNative/
├── src/
│   ├── app/
│   │   ├── _layout.tsx       # Layout raíz con navegación por tabs
│   │   ├── index.tsx         # Pantalla Ejercicio 01 - Contador
│   │   └── explore.tsx       # Pantalla Ejercicio 02 - To-Do List
│   ├── components/
│   │   ├── app-tabs.tsx      # Tabs nativos (Android/iOS)
│   │   └── app-tabs.web.tsx  # Tabs para versión web
│   └── hooks/
│       └── useThemeStyles.ts # Custom hook de estilos tipados (Bonus 01)
├── app.json
├── package.json
└── README.md
```

---

## Cómo correr la app

### Prerequisitos
- Node.js 18+
- Para Android: Android Studio con un AVD configurado
- Para iOS físico: App **Expo Go** instalada desde la App Store

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

### Opciones de ejecución desde la terminal

| Tecla | Acción |
|-------|--------|
| `a` | Abrir en emulador Android |
| `i` | Abrir en simulador iOS |
| `w` | Abrir en navegador web |
| `r` | Recargar la app |
| `t` | Modo tunnel (útil si el celular no está en la misma red WiFi) |
| `?` | Ver todos los comandos |

---

## Ejercicio 01 - A: Contador + Toggle de Tema

### Objetivo
Crear un contador simple con soporte para modo claro/oscuro, manejando todo con estado local del componente.

### Archivos relevantes
- `src/app/index.tsx` — Componente principal del ejercicio
- `src/hooks/useThemeStyles.ts` — Custom hook de estilos tipados *(Bonus)*

---

### ¿Cómo se resolvió?

#### 1. Manejo de estado con `useState`

Se utilizaron **dos estados locales** tal como lo indica la consigna:

```tsx
const [count, setCount] = useState<number>(0);       // Estado inicial: 0
const [theme, setTheme] = useState<ThemeMode>('light'); // Estado inicial: claro
```

Ambos estados están tipados con TypeScript. `ThemeMode` es un tipo literal unión definido en el hook:

```ts
export type ThemeMode = 'light' | 'dark';
```

#### 2. Lógica de las acciones

Las tres acciones requeridas se resolvieron con funciones simples:

```tsx
// +1: incrementa solo si no se alcanzó el límite (Bonus)
const handleIncrement = () => {
  if (!isMaxReached) setCount((prev) => prev + 1);
};

// Reset: vuelve el contador a 0
const handleReset = () => setCount(0);

// Toggle: alterna entre 'light' y 'dark'
const handleToggleTheme = () => {
  setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
};
```

> Se usó la forma funcional del setter (`prev => ...`) para garantizar que siempre se trabaje sobre el valor más reciente del estado, evitando problemas de *closure stale state*.

#### 3. Estilos dinámicos según el tema — `useThemeStyles()`

En lugar de usar condicionales inline en el JSX, **se extrajo toda la lógica de estilos a un custom hook** llamado `useThemeStyles`. Esto cumple con el requerimiento de no crear dos pantallas distintas, manteniendo el código limpio y desacoplado.

```ts
// src/hooks/useThemeStyles.ts
export function useThemeStyles(theme: ThemeMode) {
  const colors = getThemeColors(theme); // Paleta de colores según el tema
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.cardBorder,
    },
    // ... todos los estilos centralizados
  });
}
```

El componente simplemente invoca el hook pasándole el tema actual:

```tsx
const styles = useThemeStyles(theme);
// A partir de aquí todos los estilos tienen los colores correctos según el tema
```

#### 4. Bonus implementados

| Bonus | Implementación |
|-------|----------------|
| ✅ Deshabilitar `+1` al llegar a 10 | `disabled={isMaxReached}` en `Pressable` + estilos diferenciados |
| ✅ Mostrar aviso al llegar al límite | Renderizado condicional de `<Text>` con mensaje de advertencia en rojo |
| ✅ Tipado con TypeScript | Tipos `ThemeMode`, `ThemeColors` e interfaces exportados desde el hook |
| ✅ Custom hook `useThemeStyles()` | Estilos completamente centralizados y desacoplados del componente |
| ✅ `Pressable` con feedback visual | `opacity` + `transform: scale(0.98)` al presionar cada botón |

#### 5. Responsividad

- Se envolvió todo en `SafeAreaView` para respetar el notch y la barra de navegación nativa del sistema.
- Se usó `ScrollView` para evitar que el contenido se corte en pantallas muy pequeñas.
- La tarjeta tiene un `maxWidth: 380` para verse correctamente en compactos, tablets y web.

---

## Ejercicio 02 - B: To-Do List con FlatList y Persistencia

### Objetivo
Crear una lista de tareas (To-Do list) con persistencia local usando `AsyncStorage`.

### Archivos relevantes
- `src/app/explore.tsx` — Componente principal del ejercicio

---

### ¿Cómo se resolvió?

#### 1. Tipos e interfaz de datos

Cada tarea es un objeto tipado con TypeScript:

```ts
interface Task {
  id: string;         // Identificador único: timestamp + random
  title: string;      // Texto de la tarea
  completed: boolean; // Estado: completada o pendiente
  isEditing: boolean; // Modo edición inline activo (Bonus)
}
```

#### 2. Carga inicial desde AsyncStorage

Se usa `useEffect` con array vacío `[]` para cargar las tareas UNA sola vez al montar el componente:

```tsx
useEffect(() => {
  const loadTasks = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored !== null) setTasks(JSON.parse(stored));
  };
  loadTasks();
}, []);
```

Criterio cumplido: al reiniciar la app, las tareas se restauran automáticamente.

#### 3. Guardado automático

Cada acción (agregar, completar, eliminar) llama a `saveTasks()` que serializa el array con `JSON.stringify` y lo persiste:

```tsx
const saveTasks = async (updatedTasks: Task[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
};
```

#### 4. FlatList con keyExtractor estable

Criterio: el `keyExtractor` devuelve siempre el mismo `id` por tarea, evitando re-renders y warnings:

```tsx
<FlatList
  data={filteredTasks}
  keyExtractor={(item) => item.id}  // ID estable: timestamp + random
  renderItem={renderTask}
  ...
/>
```

#### 5. Filtrado sin perder estado

El array `tasks` (fuente de verdad) NUNCA se modifica al filtrar.
Se calcula una vista derivada `filteredTasks`:

```tsx
const filteredTasks = tasks.filter((task) => {
  if (filter === 'active') return !task.completed;
  if (filter === 'completed') return task.completed;
  return true;
});
```

#### 6. Gestos

| Gesto | Acción |
|-------|--------|
| Tap simple | Marcar/desmarcar como completada |
| Long press (400ms) | Eliminar con confirmación (Bonus) |
| Doble tap | Edición inline del título (Bonus) |

#### 7. Bonus implementados

| Bonus | Implementación |
|-------|----------------|
| ✅ Confirmación de borrado | `Alert.alert()` con botones Cancelar / Eliminar |
| ✅ Edición inline | Doble tap convierte el texto en `TextInput` |
| ✅ Animaciones | `LayoutAnimation.configureNext()` al agregar, completar y eliminar |
| ✅ `KeyboardAvoidingView` | El input no queda tapado por el teclado virtual |

---

## Decisiones de diseño globales

### Paleta de colores
Se definió una paleta completa para ambos temas en `src/hooks/useThemeStyles.ts`, usando valores hexadecimales cuidados en lugar de colores planos:

| Token | Claro | Oscuro |
|-------|-------|--------|
| Fondo de pantalla | `#F4F6F9` | `#121212` |
| Fondo de tarjeta | `#FFFFFF` | `#1E1E1E` |
| Borde de tarjeta | `#E2E8F0` | `#2D2D2D` |
| Color de acento | `#0284C7` | `#38BDF8` |
| Texto principal | `#0F172A` | `#F8FAFC` |
| Texto secundario | `#64748B` | `#94A3B8` |

### Navegación
Se usa **Expo Router** con estructura de tabs nativa del template oficial. Las dos pestañas corresponden a cada ejercicio:
- Tab **"01 - Contador"** → `src/app/index.tsx` (Ejercicio 01)
- Tab **"02 - To-Do List"** → `src/app/explore.tsx` (Ejercicio 02)

### TypeScript
Toda la codebase está escrita en TypeScript con tipado explícito para estados, props y valores de retorno, siguiendo las buenas prácticas recomendadas en la consigna del TP.
