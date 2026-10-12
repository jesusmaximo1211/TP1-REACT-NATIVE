// explore.tsx — Ejercicio 02 - B: To-Do List con FlatList + Persistencia
// Pantalla accesible desde la tab "02 - To-Do List" (ruta /explore)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Habilitar LayoutAnimation en Android ─────────────────────────────────────
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── TIPOS ─────────────────────────────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  completed: boolean;
  isEditing: boolean;
}
type FilterType = 'all' | 'active' | 'completed';

// ── CONSTANTE DE STORAGE ──────────────────────────────────────────────────────
const STORAGE_KEY = '@tp1_todo_tasks';

// ── PALETA ────────────────────────────────────────────────────────────────────
const C = {
  bg: '#F0F4FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFF',
  border: '#E2E8F0',
  borderFocus: '#6366F1',
  primary: '#6366F1',       // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#EEF2FF',
  success: '#10B981',       // Emerald
  successLight: '#D1FAE5',
  danger: '#F43F5E',        // Rose
  dangerLight: '#FFE4E6',
  warning: '#F59E0B',
  textPrimary: '#1E1B4B',
  textSecondary: '#6B7280',
  textMuted: '#A5B4FC',
  strikeText: '#9CA3AF',
  cardShadow: '#6366F1',
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function TodoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mapa de timers para detectar doble tap por item (evita conflictos entre items)
  // La clave es el task.id, el valor es el timer handle
  const tapTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const tapCounts = useRef<Map<string, number>>(new Map());

  // ── CARGA INICIAL ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setTasks(JSON.parse(stored));
      } catch (e) {
        console.error('Error cargando tareas', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── GUARDAR ───────────────────────────────────────────────────────────────
  // useCallback con dependencia vacía: la función es estable.
  // Siempre usamos la forma funcional setTasks(prev => ...) para no necesitar
  // capturar `tasks` en closures.
  const persist = useCallback(async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (e) {
      console.error('Error guardando tareas', e);
    }
  }, []);

  // Helper: actualiza tasks con función transformadora y persiste
  const updateTasks = useCallback((transform: (prev: Task[]) => Task[]) => {
    setTasks((prev) => {
      const next = transform(prev);
      persist(next);
      return next;
    });
  }, [persist]);

  // ── AGREGAR TAREA ─────────────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: trimmed,
      completed: false,
      isEditing: false,
    };
    updateTasks((prev) => [newTask, ...prev]);
    setInputText('');
  }, [inputText, updateTasks]);

  // ── TOGGLE COMPLETADA (TAP SIMPLE) ────────────────────────────────────────
  // Usa la forma funcional para no tener stale closures
  const handleToggle = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, [updateTasks]);

  // ── ELIMINAR (LONG PRESS CON CONFIRMACIÓN) ────────────────────────────────
  const handleDelete = useCallback((id: string, title: string) => {
    Alert.alert('Eliminar tarea', `¿Eliminás "${title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          updateTasks((prev) => prev.filter((t) => t.id !== id));
        },
      },
    ]);
  }, [updateTasks]);

  // ── EDICIÓN INLINE (BONUS) ────────────────────────────────────────────────
  const handleStartEdit = useCallback((id: string) => {
    updateTasks((prev) =>
      prev.map((t) => ({ ...t, isEditing: t.id === id }))
    );
  }, [updateTasks]);

  const handleSaveEdit = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    updateTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, title: trimmed || t.title, isEditing: false }
          : t
      )
    );
  }, [updateTasks]);

  // ── LÓGICA DE DOBLE TAP ROBUSTA ───────────────────────────────────────────
  // Cada item tiene su propio contador/timer en un Map para evitar interferencias
  const handleTap = useCallback((id: string) => {
    const current = (tapCounts.current.get(id) ?? 0) + 1;
    tapCounts.current.set(id, current);

    if (current === 1) {
      // Primer tap: esperar 260ms para ver si viene un segundo
      const timer = setTimeout(() => {
        const count = tapCounts.current.get(id) ?? 0;
        if (count === 1) handleToggle(id); // Solo un tap → toggle
        tapCounts.current.delete(id);
        tapTimers.current.delete(id);
      }, 260);
      tapTimers.current.set(id, timer);
    } else {
      // Segundo tap: doble tap → editar
      const existing = tapTimers.current.get(id);
      if (existing) clearTimeout(existing);
      tapTimers.current.delete(id);
      tapCounts.current.delete(id);
      handleStartEdit(id);
    }
  }, [handleToggle, handleStartEdit]);

  // ── FILTROS ───────────────────────────────────────────────────────────────
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const active = total - done;
  const progress = total > 0 ? done / total : 0;

  // ── RENDER ITEM ───────────────────────────────────────────────────────────
  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onTap={handleTap}
      onLongPress={handleDelete}
      onSaveEdit={handleSaveEdit}
    />
  ), [handleTap, handleDelete, handleSaveEdit]);

  // ── PANTALLA VACÍA ────────────────────────────────────────────────────────
  const ListEmpty = useCallback(() => (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>
        {filter === 'completed' ? '🎉' : filter === 'active' ? '✅' : '📋'}
      </Text>
      <Text style={styles.emptyTitle}>
        {filter === 'completed'
          ? 'Sin completadas aún'
          : filter === 'active'
          ? '¡Todo listo!'
          : 'No hay tareas'}
      </Text>
      <Text style={styles.emptySub}>
        {filter === 'all'
          ? 'Escribí algo arriba y presioná Agregar'
          : 'Cambiá el filtro para ver otras'}
      </Text>
    </View>
  ), [filter]);

  // ── RENDER PRINCIPAL ──────────────────────────────────────────────────────
  if (isLoading) return (
    <SafeAreaView style={styles.root}>
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Cargando...</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.root}>

        {/* ── Encabezado ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.eyebrow}>Ejercicio 02 · B</Text>
              <Text style={styles.heading}>Mi Lista</Text>
            </View>
            {/* Contadores en el encabezado */}
            <View style={styles.counters}>
              <CounterPill value={active} label="Activas" color={C.primary} bg={C.primaryLight} />
              <CounterPill value={done} label="Listas" color={C.success} bg={C.successLight} />
            </View>
          </View>

          {/* Barra de progreso */}
          {total > 0 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          )}
          <Text style={styles.progressLabel}>
            {total === 0
              ? 'Sin tareas todavía'
              : `${done} de ${total} completada${done !== 1 ? 's' : ''}`}
          </Text>
        </View>

        {/* ── Input ── */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribí una tarea..."
            placeholderTextColor={C.textSecondary}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            blurOnSubmit={false}
          />
          <Pressable
            onPress={handleAdd}
            disabled={!inputText.trim()}
            style={({ pressed }) => [
              styles.addBtn,
              !inputText.trim() && styles.addBtnDisabled,
              pressed && inputText.trim() && { opacity: 0.82 },
            ]}
          >
            <Text style={styles.addBtnText}>＋</Text>
          </Pressable>
        </View>

        {/* ── Filtros ── */}
        <View style={styles.filters}>
          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            >
              <Text style={[styles.filterTxt, filter === f && styles.filterTxtActive]}>
                {f === 'all' ? `Todas (${total})` : f === 'active' ? `Activas (${active})` : `Listas (${done})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Hint de gestos */}
        <Text style={styles.hint}>Tap: completar · Doble tap: editar · Mantener: eliminar</Text>

        {/* ── Lista ── */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={[
            styles.listContent,
            filteredTasks.length === 0 && { flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ── SUBCOMPONENTE: ITEM DE TAREA ──────────────────────────────────────────────
// Lo separamos para que cada item tenga su propio ciclo de vida y el
// input de edición pueda manejar su propio ref.
interface TaskItemProps {
  task: Task;
  onTap: (id: string) => void;
  onLongPress: (id: string, title: string) => void;
  onSaveEdit: (id: string, newTitle: string) => void;
}

const TaskItem = React.memo(function TaskItem({ task, onTap, onLongPress, onSaveEdit }: TaskItemProps) {
  const editRef = useRef<TextInput>(null);
  // Estado local del input de edición — así onBlur puede leerlo sin depender de nativeEvent.text
  const [editValue, setEditValue] = useState(task.title);

  // Sincroniza el valor local cuando la tarea entra en modo edición
  useEffect(() => {
    if (task.isEditing) setEditValue(task.title);
  }, [task.isEditing, task.title]);

  // Cuando entra en modo edición, enfoca el input automáticamente
  useEffect(() => {
    if (task.isEditing) {
      const t = setTimeout(() => editRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [task.isEditing]);

  return (
    <Pressable
      onPress={() => !task.isEditing && onTap(task.id)}
      onLongPress={() => !task.isEditing && onLongPress(task.id, task.title)}
      delayLongPress={450}
      style={({ pressed }) => [
        styles.taskCard,
        task.completed && styles.taskCardDone,
        task.isEditing && styles.taskCardEditing,
        pressed && !task.isEditing && styles.taskCardPressed,
      ]}
    >
      {/* Indicador de estado */}
      <View style={[styles.check, task.completed && styles.checkDone]}>
        {task.completed && <Text style={styles.checkMark}>✓</Text>}
      </View>

      {/* Título o input de edición */}
      {task.isEditing ? (
        <TextInput
          ref={editRef}
          style={styles.editInput}
          value={editValue}
          onChangeText={setEditValue}
          onBlur={() => onSaveEdit(task.id, editValue)}
          onSubmitEditing={() => onSaveEdit(task.id, editValue)}
          returnKeyType="done"
          selectTextOnFocus
        />
      ) : (
        <Text
          style={[styles.taskText, task.completed && styles.taskTextDone]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
      )}

      {/* Indicador visual de estado en el extremo derecho */}
      {!task.isEditing && (
        <View style={[styles.statusDot, task.completed && styles.statusDotDone]} />
      )}
    </Pressable>
  );
});

// ── SUBCOMPONENTE: CONTADOR PILL ──────────────────────────────────────────────
function CounterPill({ value, label, color, bg }: { value: number; label: string; color: string; bg: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillNum, { color }]}>{value}</Text>
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Header ──
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: -0.5,
  },
  counters: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 58,
  },
  pillNum: {
    fontSize: 20,
    fontWeight: '800',
  },
  pillLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // Barra de progreso
  progressBar: {
    height: 6,
    backgroundColor: '#E0E7FF',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: 6,
    backgroundColor: C.primary,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: C.textSecondary,
    fontWeight: '500',
  },

  // ── Input ──
  inputWrap: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: C.textPrimary,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  addBtnDisabled: {
    backgroundColor: '#C7D2FE',
    shadowOpacity: 0,
    elevation: 0,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 26,
  },

  // ── Filtros ──
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 6,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterBtnActive: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary,
  },
  filterTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textSecondary,
  },
  filterTxtActive: {
    color: C.primary,
  },

  // Hint de gestos
  hint: {
    fontSize: 10.5,
    color: C.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
  },

  // ── Lista ──
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
  },

  // ── Task Card ──
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  taskCardDone: {
    backgroundColor: C.surfaceAlt,
    borderColor: '#F1F5F9',
  },
  taskCardEditing: {
    borderColor: C.borderFocus,
    borderWidth: 1.5,
    shadowColor: C.primary,
    shadowOpacity: 0.15,
  },
  taskCardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },

  // Círculo de check
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkDone: {
    backgroundColor: C.success,
    borderColor: C.success,
  },
  checkMark: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Texto de tarea
  taskText: {
    flex: 1,
    fontSize: 15,
    color: C.textPrimary,
    fontWeight: '500',
    lineHeight: 21,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: C.strikeText,
    fontWeight: '400',
  },

  // Input de edición inline
  editInput: {
    flex: 1,
    fontSize: 15,
    color: C.textPrimary,
    fontWeight: '500',
    borderBottomWidth: 1.5,
    borderBottomColor: C.borderFocus,
    paddingVertical: 2,
  },

  // Punto de estado
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    flexShrink: 0,
  },
  statusDotDone: {
    backgroundColor: C.success,
  },

  // ── Empty State ──
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  emptySub: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 36,
    lineHeight: 19,
  },
});
