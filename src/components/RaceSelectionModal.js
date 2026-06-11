import React, { useState } from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCharacter } from '../context/CharacterContext';
import { RACES, SUBRACE_BY_ID } from '../data/racesData';
import { TRAILS_MAGIAS } from '../data/trailsData';
import { SKILL_CATEGORIES, SKILL_LABELS, STATUS_LABELS } from '../data/initialCharacter';

// Steps: 'race' → 'subrace' → 'skillBoost' → 'magicTrail' → 'magicSkills' → 'review'

export default function RaceSelectionModal({ visible, onClose }) {
  const { dispatch } = useCharacter();
  const insets = useSafeAreaInsets();

  const [step, setStep]               = useState('race');
  const [raceId, setRaceId]           = useState(null);
  const [subraceId, setSubraceId]     = useState(null);
  const [skillBoost, setSkillBoost]   = useState(null);
  const [magicTrail, setMagicTrail]   = useState(null);
  const [magicSkills, setMagicSkills] = useState([]);

  const race    = RACES.find(r => r.id === raceId) ?? null;
  const subrace = subraceId ? SUBRACE_BY_ID[subraceId] : null;

  function reset() {
    setStep('race');
    setRaceId(null); setSubraceId(null);
    setSkillBoost(null); setMagicTrail(null); setMagicSkills([]);
  }

  function selectRace(id) {
    setRaceId(id);
    setSubraceId(null);
    setStep('subrace');
  }

  function selectSubrace(id) {
    const sub = SUBRACE_BY_ID[id];
    setSubraceId(id);
    setSkillBoost(null);
    setMagicTrail(null);
    setMagicSkills([]);
    if (sub.skillBoost) setStep('skillBoost');
    else if (sub.startingMagic) setStep('magicTrail');
    else setStep('review');
  }

  function selectSkillBoost(skill) {
    setSkillBoost(skill);
    if (subrace.startingMagic) setStep('magicTrail');
    else setStep('review');
  }

  function selectMagicTrail(trailId) {
    setMagicTrail(trailId);
    setMagicSkills([]);
    setStep('magicSkills');
  }

  function toggleMagicSkill(skillId) {
    setMagicSkills(prev => {
      if (prev.includes(skillId)) return prev.filter(s => s !== skillId);
      if (prev.length >= subrace.startingMagic.quantidade) return prev;
      return [...prev, skillId];
    });
  }

  function confirm() {
    if (!race || !subrace) return;
    if (subrace.skillBoost && !skillBoost) return;
    if (subrace.startingMagic && (!magicTrail || magicSkills.length !== subrace.startingMagic.quantidade)) return;

    dispatch({
      type: 'SET_RACE',
      raceId,
      subraceId,
      skillBoostSkill: skillBoost,
      startingMagicTrail: magicTrail,
      startingMagicSkills: magicSkills,
    });
    reset();
    onClose();
  }

  function goBack() {
    if (step === 'subrace') setStep('race');
    else if (step === 'skillBoost') setStep('subrace');
    else if (step === 'magicTrail') setStep(subrace?.skillBoost ? 'skillBoost' : 'subrace');
    else if (step === 'magicSkills') setStep('magicTrail');
    else if (step === 'review') {
      if (subrace?.startingMagic) setStep('magicSkills');
      else if (subrace?.skillBoost) setStep('skillBoost');
      else setStep('subrace');
    }
  }

  // ─── Render helpers ──────────────────────────────────────────────────────────

  const renderRaceStep = () => (
    <>
      <Text style={s.stepTitle}>Escolha sua Raça</Text>
      <Text style={s.stepHint}>Cada raça concede características únicas. Essa escolha é permanente.</Text>
      {RACES.map(r => (
        <TouchableOpacity key={r.id} style={s.card} onPress={() => selectRace(r.id)}>
          <Text style={s.cardName}>{r.nome}</Text>
          <Text style={s.cardDesc} numberOfLines={4}>{r.intro}</Text>
        </TouchableOpacity>
      ))}
    </>
  );

  const renderSubraceStep = () => (
    <>
      <Text style={s.stepTitle}>{race?.nome} — Escolha a Subraça</Text>
      <Text style={s.stepHint}>Cada subraça tem características próprias.</Text>
      {race?.subracas.map(sub => (
        <TouchableOpacity key={sub.id} style={s.card} onPress={() => selectSubrace(sub.id)}>
          <Text style={s.cardName}>{sub.nome}</Text>
          {sub.elements && <Text style={s.cardMeta}>🔮 {sub.elements}</Text>}
          <Text style={s.cardDesc} numberOfLines={3}>{sub.background}</Text>

          <View style={s.bonusList}>
            {sub.skillBoost && (
              <Text style={s.bonusText}>★ Perícia escolhida (até nível 8) — {sub.skillBoost.categorias.join('/')}</Text>
            )}
            {sub.startingMagic && (
              <Text style={s.bonusText}>★ Inicia com {sub.startingMagic.quantidade} magias nível {sub.startingMagic.nivel} de uma trilha escolhida</Text>
            )}
            {(sub.statusBonuses ?? []).map((b, i) => (
              <Text key={`sb-${i}`} style={s.bonusText}>
                ★ +{b.delta} {STATUS_LABELS[b.status] ?? b.status}
              </Text>
            ))}
            {(sub.caracteristicas ?? []).map((c, i) => (
              <Text key={`c-${i}`} style={s.bonusText}>★ {c.texto}</Text>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </>
  );

  const renderSkillBoostStep = () => {
    const cats = subrace.skillBoost.categorias;
    return (
      <>
        <Text style={s.stepTitle}>Escolha a Perícia (até nível 8)</Text>
        <Text style={s.stepHint}>
          Os {subrace.nome} podem treinar uma perícia além do limite tradicional.{'\n'}
          Categorias permitidas: {cats.join(', ')}
        </Text>
        {cats.map(cat => (
          <View key={cat} style={s.catGroup}>
            <Text style={s.catLabel}>{cat}</Text>
            <View style={s.chipRow}>
              {(SKILL_CATEGORIES[cat] ?? []).map(sk => (
                <TouchableOpacity
                  key={sk}
                  style={[s.chip, skillBoost === sk && s.chipActive]}
                  onPress={() => setSkillBoost(sk)}
                >
                  <Text style={[s.chipText, skillBoost === sk && s.chipTextActive]}>
                    {SKILL_LABELS[sk]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={[s.nextBtn, !skillBoost && s.nextBtnOff]}
          disabled={!skillBoost}
          onPress={() => selectSkillBoost(skillBoost)}
        >
          <Text style={s.nextBtnText}>Próximo</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderMagicTrailStep = () => (
    <>
      <Text style={s.stepTitle}>Escolha a Maestria de Magia</Text>
      <Text style={s.stepHint}>
        Os {subrace.nome} iniciam com {subrace.startingMagic.quantidade} magias nível {subrace.startingMagic.nivel} da Maestria escolhida.
      </Text>
      <View style={s.chipRow}>
        {TRAILS_MAGIAS.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[s.chip, magicTrail === t.id && s.chipActive]}
            onPress={() => selectMagicTrail(t.id)}
          >
            <Text style={[s.chipText, magicTrail === t.id && s.chipTextActive]}>{t.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderMagicSkillsStep = () => {
    const trail = TRAILS_MAGIAS.find(t => t.id === magicTrail);
    const needed = subrace.startingMagic.quantidade;
    return (
      <>
        <Text style={s.stepTitle}>Escolha {needed} Magias da {trail?.nome}</Text>
        <Text style={s.stepHint}>{magicSkills.length}/{needed} selecionadas</Text>
        {trail?.skills.map(sk => {
          const selected = magicSkills.includes(sk.id);
          const disabled = !selected && magicSkills.length >= needed;
          const desc = typeof sk.niveis?.['1'] === 'string' ? sk.niveis['1'] : sk.niveis?.['1']?.efeito;
          return (
            <TouchableOpacity
              key={sk.id}
              style={[s.card, selected && s.cardSelected, disabled && s.cardDisabled]}
              disabled={disabled}
              onPress={() => toggleMagicSkill(sk.id)}
            >
              <Text style={[s.cardName, selected && { color: '#a6e3a1' }]}>
                {selected ? '✓ ' : ''}{sk.nome}
              </Text>
              {desc && <Text style={s.cardDesc} numberOfLines={3}>{desc}</Text>}
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[s.nextBtn, magicSkills.length !== needed && s.nextBtnOff]}
          disabled={magicSkills.length !== needed}
          onPress={() => setStep('review')}
        >
          <Text style={s.nextBtnText}>Próximo</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderReviewStep = () => {
    const trail = magicTrail ? TRAILS_MAGIAS.find(t => t.id === magicTrail) : null;
    return (
      <>
        <Text style={s.stepTitle}>Confirmar</Text>
        <View style={s.reviewBox}>
          <Text style={s.reviewKey}>Raça</Text>
          <Text style={s.reviewVal}>{race?.nome} · {subrace?.nome}</Text>

          {skillBoost && (
            <>
              <Text style={s.reviewKey}>Perícia (até 8)</Text>
              <Text style={s.reviewVal}>{SKILL_LABELS[skillBoost] ?? skillBoost}</Text>
            </>
          )}

          {trail && (
            <>
              <Text style={s.reviewKey}>Maestria de Magia</Text>
              <Text style={s.reviewVal}>{trail.nome}</Text>
              <Text style={s.reviewKey}>Magias iniciais</Text>
              {magicSkills.map(skId => {
                const sk = trail.skills.find(s => s.id === skId);
                return <Text key={skId} style={s.reviewVal}>• {sk?.nome ?? skId}</Text>;
              })}
            </>
          )}

          {(subrace?.statusBonuses ?? []).length > 0 && (
            <>
              <Text style={s.reviewKey}>Bônus de Status</Text>
              {subrace.statusBonuses.map((b, i) => (
                <Text key={i} style={s.reviewVal}>• +{b.delta} {STATUS_LABELS[b.status] ?? b.status}</Text>
              ))}
            </>
          )}
        </View>

        <TouchableOpacity style={s.confirmBtn} onPress={confirm}>
          <Text style={s.confirmBtnText}>Confirmar Raça</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={() => {}}>
      <View style={s.overlay}>
        <Pressable style={[s.sheet, insets.bottom > 0 && { paddingBottom: 32 + insets.bottom }]} onPress={() => {}}>
          <View style={s.header}>
            {step !== 'race' && (
              <TouchableOpacity onPress={goBack} style={s.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={s.backBtnText}>‹</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Criar Personagem</Text>
              <Text style={s.subtitle}>Escolha sua raça</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            {step === 'race'        && renderRaceStep()}
            {step === 'subrace'     && renderSubraceStep()}
            {step === 'skillBoost'  && renderSkillBoostStep()}
            {step === 'magicTrail'  && renderMagicTrailStep()}
            {step === 'magicSkills' && renderMagicSkillsStep()}
            {step === 'review'      && renderReviewStep()}
          </ScrollView>
        </Pressable>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: '#181825', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%', paddingBottom: 32 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#2e2e4e', gap: 8,
  },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: '#cdd6f4', fontSize: 22, lineHeight: 24 },
  title:    { color: '#cdd6f4', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#6c7086', fontSize: 12, marginTop: 2 },

  content: { padding: 16, paddingBottom: 24 },

  stepTitle: { color: '#cba6f7', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  stepHint:  { color: '#6c7086', fontSize: 12, lineHeight: 17, marginBottom: 12 },

  card: {
    backgroundColor: '#1e1e2e', borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#2e2e4e',
  },
  cardSelected: { borderColor: '#a6e3a1', backgroundColor: '#111f11' },
  cardDisabled: { opacity: 0.4 },
  cardName:  { color: '#cdd6f4', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardMeta:  { color: '#f9e2af', fontSize: 11, marginBottom: 4 },
  cardDesc:  { color: '#a6adc8', fontSize: 12, lineHeight: 17, marginBottom: 6 },

  bonusList: { marginTop: 6, gap: 3 },
  bonusText: { color: '#89b4fa', fontSize: 11, lineHeight: 16 },

  catGroup: { marginBottom: 14 },
  catLabel: { color: '#89b4fa', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:    { backgroundColor: '#313244', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#45475a' },
  chipActive: { backgroundColor: '#1e3a5f', borderColor: '#89b4fa' },
  chipText:       { color: '#a6adc8', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#89b4fa' },

  nextBtn:     { backgroundColor: '#1d3052', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: '#89b4fa' },
  nextBtnOff:  { backgroundColor: '#1e1e2e', borderColor: '#2e2e4e' },
  nextBtnText: { color: '#89b4fa', fontSize: 14, fontWeight: '700' },

  reviewBox: { backgroundColor: '#1e1e2e', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#cba6f740', gap: 4 },
  reviewKey: { color: '#6c7086', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 8 },
  reviewVal: { color: '#cdd6f4', fontSize: 14 },

  confirmBtn:     { backgroundColor: '#cba6f7', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { color: '#1e1e2e', fontSize: 15, fontWeight: '700' },
});
