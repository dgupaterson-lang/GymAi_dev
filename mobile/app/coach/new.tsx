import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import ScreenHeader from '@/components/ui/ScreenHeader';
import {
  createCoachProgram,
  type CreateProgramPayload,
  type ProgramDayInput,
} from '@/api/programs';
import { DEMO_EXERCISES } from '@/data/demo';

/**
 * Création d'un programme coaché : titre, description, durée (jours), et des
 * jours avec exercices choisis dans un catalogue mock (DEMO_EXERCISES) faute
 * d'endpoint catalog exposé (documenté). POST /coach/programs à la validation.
 */

interface DraftDay {
  title: string;
  exerciseIds: number[];
}

/** Champ texte réutilisant le style AuthField (sans logique mot de passe). */
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
  multiline?: boolean;
}) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[fieldStyles.label, { color: c.muted2 }]}>{label}</Text>
      <View
        style={[
          fieldStyles.box,
          {
            backgroundColor: c.surface,
            borderColor: focused ? c.accent : c.line,
            height: multiline ? 84 : 52,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        <TextInput
          style={[fieldStyles.input, { color: c.txt, paddingTop: multiline ? 14 : 0 }]}
          placeholderTextColor={c.muted2}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

export default function NewCoachProgram() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [objective, setObjective] = useState('');
  const [level, setLevel] = useState('');
  const [days, setDays] = useState<DraftDay[]>([
    { title: 'Jour 1', exerciseIds: [] },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDay = () =>
    setDays((d) => [...d, { title: `Jour ${d.length + 1}`, exerciseIds: [] }]);

  const removeDay = (i: number) =>
    setDays((d) => d.filter((_, idx) => idx !== i));

  const setDayTitle = (i: number, t: string) =>
    setDays((d) => d.map((day, idx) => (idx === i ? { ...day, title: t } : day)));

  const toggleExercise = (i: number, exId: number) =>
    setDays((d) =>
      d.map((day, idx) => {
        if (idx !== i) return day;
        const has = day.exerciseIds.includes(exId);
        return {
          ...day,
          exerciseIds: has
            ? day.exerciseIds.filter((x) => x !== exId)
            : [...day.exerciseIds, exId],
        };
      }),
    );

  const onSubmit = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Donne un titre au programme.');
      return;
    }
    const durationDays = parseInt(duration, 10) || 30;
    const payloadDays: ProgramDayInput[] = days.map((day, di) => ({
      title: day.title.trim() || `Jour ${di + 1}`,
      order: di,
      exercises: day.exerciseIds.map((exId, ei) => {
        const ex = DEMO_EXERCISES.find((e) => e.id === exId);
        return {
          exercise_id: exId,
          sets: ex?.default_sets ?? 3,
          reps: ex?.default_reps ?? 10,
          charge: ex?.charge_hint,
          rest_s: ex?.default_rest_s ?? 60,
          order: ei,
        };
      }),
    }));

    const payload: CreateProgramPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      duration_days: durationDays,
      objective: objective.trim() || undefined,
      level: level.trim() || undefined,
      days: payloadDays,
    };

    setBusy(true);
    try {
      const created = await createCoachProgram(payload);
      router.replace({ pathname: '/coach/[id]', params: { id: String(created.id) } });
    } catch {
      // Repli démo : on ne bloque pas, on renvoie vers l'espace coach.
      setError(
        "Création impossible (API injoignable). Programme non enregistré côté serveur.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Nouveau programme" />

        <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Défi 30 jours — Prise de masse" />
        <Field label="Description" value={description} onChangeText={setDescription} placeholder="Programme coaché suivi sur 1 mois." multiline />
        <View style={styles.rowFields}>
          <View style={{ flex: 1 }}>
            <Field label="Durée (jours)" value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholder="30" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Niveau" value={level} onChangeText={setLevel} placeholder="Intermédiaire" />
          </View>
        </View>
        <Field label="Objectif" value={objective} onChangeText={setObjective} placeholder="Prendre du muscle" />

        <View style={styles.daysHead}>
          <Text style={[styles.sectionTitle, { color: c.txt }]}>Jours & exercices</Text>
          <PressableScale onPress={addDay} style={[styles.addDayBtn, { backgroundColor: c.accentDim }]} hitSlop={6}>
            <Icon name="add" size={16} color={c.accent} />
            <Text style={[styles.addDayTxt, { color: c.accent }]}>Ajouter un jour</Text>
          </PressableScale>
        </View>

        {days.map((day, i) => (
          <View key={i} style={[styles.dayCard, { backgroundColor: c.surface, borderColor: c.line }]}>
            <View style={styles.dayTop}>
              <TextInput
                style={[styles.dayTitleInput, { color: c.txt, borderBottomColor: c.line }]}
                value={day.title}
                onChangeText={(t) => setDayTitle(i, t)}
                placeholder={`Jour ${i + 1}`}
                placeholderTextColor={c.muted2}
              />
              {days.length > 1 ? (
                <PressableScale onPress={() => removeDay(i)} hitSlop={8}>
                  <Icon name="remove_circle" size={22} color={c.muted2} />
                </PressableScale>
              ) : null}
            </View>
            <View style={styles.exList}>
              {DEMO_EXERCISES.map((ex) => {
                const selected = day.exerciseIds.includes(ex.id);
                return (
                  <PressableScale
                    key={ex.id}
                    onPress={() => toggleExercise(i, ex.id)}
                    style={[
                      styles.exChip,
                      {
                        backgroundColor: selected ? c.accent : c.surface2,
                        borderColor: selected ? c.accent : c.line,
                      },
                    ]}
                  >
                    <Icon
                      name={selected ? 'check' : 'add'}
                      size={14}
                      color={selected ? c.onAccent : c.muted}
                    />
                    <Text
                      style={[styles.exChipTxt, { color: selected ? c.onAccent : c.txt }]}
                    >
                      {ex.name}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        ))}

        {error ? (
          <View style={styles.errorRow}>
            <Icon name="error_outline" size={16} color={c.warn} />
            <Text style={[styles.errorTxt, { color: c.warn }]}>{error}</Text>
          </View>
        ) : null}

        <PressableScale
          onPress={onSubmit}
          disabled={busy}
          style={[styles.cta, { backgroundColor: c.accent, shadowColor: c.accentDim, opacity: busy ? 0.6 : 1 }]}
        >
          <Icon name="check_circle" size={20} color={c.onAccent} />
          <Text style={[styles.ctaTxt, { color: c.onAccent }]}>
            {busy ? 'Création…' : 'Créer le programme'}
          </Text>
        </PressableScale>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const fieldStyles = StyleSheet.create({
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  box: { paddingHorizontal: 15, borderRadius: 14, borderWidth: 1.5, flexDirection: 'row' },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 15, padding: 0, width: '100%' },
});

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 2, paddingBottom: 40 },
  rowFields: { flexDirection: 'row', gap: 12 },
  daysHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: fonts.display, fontSize: 16 },
  addDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  addDayTxt: { fontFamily: fonts.bodyBold, fontSize: 12 },
  dayCard: { borderRadius: 18, padding: 15, borderWidth: 1, marginBottom: 12 },
  dayTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  dayTitleInput: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 15,
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  exList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  exChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  exChipTxt: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 4 },
  errorTxt: { fontFamily: fonts.bodyMedium, fontSize: 13, flex: 1 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 15,
    marginTop: 12,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ctaTxt: { fontFamily: fonts.display, fontSize: 15 },
});
