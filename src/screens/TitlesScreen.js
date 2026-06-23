import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCharacter } from '../context/CharacterContext';
import {
  CATEGORIAS_RAW, TITLE_BY_ID, TITLE_PREREQS, TITLE_UNLOCKS,
} from '../data/titlesData';
import { TRAILS_ARMAS, TRAILS_MAGIAS, TRAILS_PROFISSOES } from '../data/trailsData';

const FONTE_TRAILS = { armas: TRAILS_ARMAS, magias: TRAILS_MAGIAS, profissoes: TRAILS_PROFISSOES };
const FONTE_LABEL  = { armas: 'Arma', magias: 'Magia', profissoes: 'Profissão' };

const CAT_COLOR = {
  'MILITAR/MÁGICA': '#cba6f7',
  'MILITAR/FÍSICA': '#f38ba8',
  'OFICIAL':        '#fab387',
  'NOBRE':          '#f9e2af',
};
function getColor(cat, sub) {
  return sub ? CAT_COLOR[`${cat}/${sub}`] : CAT_COLOR[cat] ?? '#89b4fa';
}
const TIER_LABEL = { 1: 'Nível 1', 2: 'Nível 2', 3: 'Nível 3', 4: 'Nível 4' };

// ── Binding helpers ───────────────────────────────────────────────────────────

function getBindableSkills(req, acquiredTrails, bindings, excludeTitleId = null) {
  const allBound = new Set();
  for (const [tid, list] of Object.entries(bindings ?? {})) {
    if (tid === excludeTitleId) continue; // ignora as próprias bindings ao revincular
    for (const b of list) allBound.add(`${b.trailId}:${b.skillId}`);
  }
  const pool = FONTE_TRAILS[req.fonte] ?? [];
  const byCategory = {};
  for (const trail of pool) {
    if (req.trailFixo && trail.id !== req.trailFixo) continue;
    if (req.trilhasPermitidas && !req.trilhasPermitidas.includes(trail.id)) continue;
    const trailData = acquiredTrails[trail.id];
    if (!trailData) continue;
    for (const skill of trail.skills) {
      const level = trailData.skills[skill.id] ?? 0;
      if (level < req.nivel) continue;
      if (allBound.has(`${trail.id}:${skill.id}`)) continue;
      // mesmaTrilha: agrupa por trilha (ignora categoria mesmo se houver).
      // Caso contrário, mantém o comportamento legado (categoria ou nome).
      const cat = req.mesmaTrilha
        ? trail.nome
        : (trail.categoria ?? trail.nome);
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push({
        trailId: trail.id, skillId: skill.id,
        nome: skill.nome, trailNome: trail.nome, level, categoria: cat,
      });
    }
  }
  return byCategory;
}

function hasEnoughBindable(req, acquiredTrails, bindings) {
  const by = getBindableSkills(req, acquiredTrails, bindings);
  if (req.mesmaCategoria || req.mesmaTrilha) return Object.values(by).some(a => a.length >= req.quantidade);
  return Object.values(by).flat().length >= req.quantidade;
}

// ── Skill Binding Modal ───────────────────────────────────────────────────────

function SkillBindingModal({ visible, title, acquiredTrails, bindings, excludeTitleId, color, onConfirm, onCancel }) {
  const insets = useSafeAreaInsets();
  const req = title?.requisitoHabilidades;
  const [selected, setSelected] = useState([]);   // [{trailId,skillId,nome}]
  const [lockedCat, setLockedCat] = useState(null);

  const byCategory = useMemo(
    () => req ? getBindableSkills(req, acquiredTrails, bindings, excludeTitleId) : {},
    [req, acquiredTrails, bindings, excludeTitleId]
  );

  if (!req || !title) return null;

  const isSelected = (trailId, skillId) =>
    selected.some(s => s.trailId === trailId && s.skillId === skillId);

  const toggle = (sk) => {
    if (isSelected(sk.trailId, sk.skillId)) {
      const next = selected.filter(s => !(s.trailId === sk.trailId && s.skillId === sk.skillId));
      setSelected(next);
      if (req.mesmaCategoria && next.length === 0) setLockedCat(null);
    } else {
      if (selected.length >= req.quantidade) return;
      if ((req.mesmaCategoria || req.mesmaTrilha) && lockedCat && lockedCat !== sk.categoria) return;
      const next = [...selected, { trailId: sk.trailId, skillId: sk.skillId, nome: sk.nome }];
      setSelected(next);
      if ((req.mesmaCategoria || req.mesmaTrilha) && !lockedCat) setLockedCat(sk.categoria);
    }
  };

  const canConfirm = selected.length === req.quantidade;

  const handleClose = () => { setSelected([]); setLockedCat(null); onCancel(); };
  const handleConfirm = () => {
    if (!canConfirm) return;
    const result = [...selected];
    setSelected([]); setLockedCat(null);
    onConfirm(result);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={mStyles.overlay} onPress={handleClose}>
        <Pressable style={[mStyles.sheet, insets.bottom > 0 && { paddingBottom: 32 + insets.bottom }]} onPress={() => {}}>
          <View style={mStyles.handle} />
          <Text style={[mStyles.title, { color }]}>{title.nome}</Text>
          <Text style={mStyles.subtitle}>
            Selecione {req.quantidade} habilidades de {FONTE_LABEL[req.fonte]} nível ≥ {req.nivel}
            {req.trailFixo
              ? ` da Maestria ${(FONTE_TRAILS[req.fonte] ?? []).find(t => t.id === req.trailFixo)?.nome ?? req.trailFixo}`
              : (req.mesmaCategoria || req.mesmaTrilha) ? ' da mesma Maestria' : ''}
            {req.trilhasPermitidas && !req.trailFixo && (
              <Text>{'\n'}Apenas: {(FONTE_TRAILS[req.fonte] ?? []).filter(t => req.trilhasPermitidas.includes(t.id)).map(t => t.nome).join(', ')}</Text>
            )}
          </Text>
          <Text style={[mStyles.count, canConfirm && { color }]}>
            {selected.length}/{req.quantidade} selecionadas
          </Text>

          <ScrollView style={mStyles.scroll} showsVerticalScrollIndicator={false}>
            {Object.keys(byCategory).length === 0 ? (
              <Text style={mStyles.empty}>Nenhuma habilidade disponível para vínculo.</Text>
            ) : (
              Object.entries(byCategory).map(([cat, skills]) => {
                const catLocked = (req.mesmaCategoria || req.mesmaTrilha) && lockedCat && lockedCat !== cat;
                return (
                  <View key={cat} style={[mStyles.catGroup, catLocked && mStyles.catGroupLocked]}>
                    <Text style={[mStyles.catLabel, catLocked && { color: '#45475a' }]}>{cat}</Text>
                    {skills.map(sk => {
                      const sel = isSelected(sk.trailId, sk.skillId);
                      const disabled = catLocked || (!sel && selected.length >= req.quantidade);
                      return (
                        <TouchableOpacity
                          key={`${sk.trailId}:${sk.skillId}`}
                          style={[
                            mStyles.skillItem,
                            sel && { borderColor: color, backgroundColor: color + '22' },
                            disabled && mStyles.skillItemDisabled,
                          ]}
                          disabled={disabled}
                          onPress={() => toggle(sk)}
                        >
                          <View style={[mStyles.check, sel && { backgroundColor: color, borderColor: color }]}>
                            {sel && <Text style={mStyles.checkMark}>✓</Text>}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[mStyles.skillName, disabled && { color: '#45475a' }]}>{sk.nome}</Text>
                            <Text style={mStyles.skillSub}>{sk.trailNome} · Nível {sk.level}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={mStyles.btnRow}>
            <TouchableOpacity style={mStyles.cancelBtn} onPress={handleClose}>
              <Text style={mStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[mStyles.confirmBtn, !canConfirm && mStyles.confirmBtnOff, canConfirm && { borderColor: color }]}
              disabled={!canConfirm}
              onPress={handleConfirm}
            >
              <Text style={[mStyles.confirmText, canConfirm && { color }]}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Title Card ────────────────────────────────────────────────────────────────

function TitleCard({ title, color }) {
  const { character, dispatch } = useCharacter();
  const [expanded, setExpanded] = useState(false);
  const [bindingMode, setBindingMode] = useState(null); // null | 'acquire' | 'rebind'

  const acquired   = character.titles?.acquired?.includes(title.id) ?? false;
  const prereqIds  = TITLE_PREREQS[title.id] ?? [];
  const prereqsMet = prereqIds.every(id => character.titles?.acquired?.includes(id));
  const req        = title.requisitoHabilidades;

  const skillReqMet = !req || hasEnoughBindable(
    req, character.skillTree.acquiredTrails, character.titles?.bindings ?? {}
  );
  const canAcquire = !acquired && prereqsMet && skillReqMet;

  const unlocksNames = (TITLE_UNLOCKS[title.id] ?? []).map(id => TITLE_BY_ID[id]?.nome).filter(Boolean);
  const prereqNames  = prereqIds.map(id => TITLE_BY_ID[id]?.nome).filter(Boolean);
  const boundSkills  = character.titles?.bindings?.[title.id] ?? [];
  // Título adquirido com requisito mas sem habilidades vinculadas — pode revincular
  const canRebind     = acquired && !!req;
  const missingBinding = canRebind && boundSkills.length === 0;

  const handleAcquire = () => req ? setBindingMode('acquire') : dispatch({ type: 'ACQUIRE_TITLE', titleId: title.id });
  const handleRebind  = () => setBindingMode('rebind');

  const acquireBtnLabel = !canAcquire
    ? (!prereqsMet ? 'Requer título anterior' : 'Habilidades insuficientes')
    : req ? 'Selecionar Habilidades...' : 'Adquirir Título';

  return (
    <View style={[
      styles.card,
      acquired && { borderLeftColor: color },
      missingBinding && { borderLeftColor: '#f9e2af' },
    ]}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpanded(v => !v)}
        onLongPress={canRebind ? handleRebind : undefined}
        delayLongPress={400}
        activeOpacity={0.7}
      >
        <View style={[styles.cardDot, { backgroundColor: acquired ? color : '#45475a' }]} />
        <Text style={[styles.cardName, acquired && { color }]}>{title.nome}</Text>
        {missingBinding && <Text style={styles.bindingWarn}>⚠️ sem maestria</Text>}
        {acquired && <Text style={[styles.acquiredBadge, { color }]}>✓</Text>}
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          {title.beneficios.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Benefícios</Text>
              {title.beneficios.map((b, i) => <Text key={i} style={styles.bullet}>• {b}</Text>)}
            </View>
          )}

          {title.requisitos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Requisitos</Text>
              {title.requisitos.map((r, i) => <Text key={i} style={styles.bullet}>• {r}</Text>)}
            </View>
          )}

          {(prereqNames.length > 0 || unlocksNames.length > 0) && (
            <View style={styles.chainRow}>
              {prereqNames.length > 0 && (
                <View style={styles.chainItem}>
                  <Text style={styles.chainLabel}>↑ Requer título</Text>
                  {prereqNames.map((n, i) => <Text key={i} style={[styles.chainName, { color }]}>{n}</Text>)}
                </View>
              )}
              {unlocksNames.length > 0 && (
                <View style={styles.chainItem}>
                  <Text style={styles.chainLabel}>↓ Desbloqueia</Text>
                  {unlocksNames.map((n, i) => <Text key={i} style={[styles.chainName, { color }]}>{n}</Text>)}
                </View>
              )}
            </View>
          )}

          {acquired && boundSkills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Habilidades Vinculadas</Text>
              {boundSkills.map((b, i) => (
                <Text key={i} style={[styles.bullet, { color: color + 'cc' }]}>🔗 {b.nome}</Text>
              ))}
            </View>
          )}

          {canRebind && (
            <TouchableOpacity
              style={[styles.rebindBtn, missingBinding && styles.rebindBtnWarn]}
              onPress={handleRebind}
            >
              <Text style={[styles.rebindBtnText, missingBinding && styles.rebindBtnTextWarn]}>
                {missingBinding ? 'Vincular Habilidades…' : 'Trocar Habilidades…'}
              </Text>
            </TouchableOpacity>
          )}

          {!acquired && (
            <TouchableOpacity
              style={[styles.acquireBtn, !canAcquire && styles.acquireBtnOff]}
              disabled={!canAcquire}
              onPress={handleAcquire}
            >
              <Text style={[styles.acquireBtnText, !canAcquire && styles.acquireBtnTextOff]}>
                {acquireBtnLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <SkillBindingModal
        visible={!!bindingMode}
        title={title}
        acquiredTrails={character.skillTree.acquiredTrails}
        bindings={character.titles?.bindings ?? {}}
        excludeTitleId={bindingMode === 'rebind' ? title.id : null}
        color={color}
        onConfirm={skills => {
          const mode = bindingMode;
          setBindingMode(null);
          if (mode === 'rebind') {
            dispatch({ type: 'REBIND_TITLE_SKILLS', titleId: title.id, boundSkills: skills });
          } else {
            dispatch({ type: 'ACQUIRE_TITLE', titleId: title.id, boundSkills: skills });
          }
        }}
        onCancel={() => setBindingMode(null)}
      />
    </View>
  );
}

// ── Tier Group ────────────────────────────────────────────────────────────────

function TierGroup({ tier, titles, color }) {
  return (
    <View style={styles.tierGroup}>
      <View style={styles.tierHeader}>
        <View style={[styles.tierLine, { backgroundColor: color + '44' }]} />
        <Text style={[styles.tierLabel, { color }]}>{TIER_LABEL[tier] ?? `Nível ${tier}`}</Text>
        <View style={[styles.tierLine, { backgroundColor: color + '44' }]} />
      </View>
      {titles.map(t => <TitleCard key={t.id} title={t} color={color} />)}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function TitlesScreen() {
  const { character } = useCharacter();
  const [activeCat, setActiveCat] = useState(0);
  const [activeSub, setActiveSub] = useState(0);

  const cat    = CATEGORIAS_RAW[activeCat];
  const hasSubs = !!cat.subcategorias;
  const sub    = hasSubs ? cat.subcategorias[activeSub] : null;
  const titulos = sub ? sub.titulos : cat.titulos;
  const color  = getColor(cat.categoria, sub?.subcategoria);

  const tiers = {};
  titulos.forEach(t => { if (!tiers[t.ordem]) tiers[t.ordem] = []; tiers[t.ordem].push(t); });

  const totalAcquired = (character.titles?.acquired ?? []).length;

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Títulos</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>Adquiridos</Text>
          <Text style={styles.badgeValue}>{totalAcquired}</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {CATEGORIAS_RAW.map((c, i) => {
          const col = getColor(c.categoria);
          return (
            <TouchableOpacity
              key={c.categoria}
              style={[styles.tab, activeCat === i && { borderBottomColor: col, borderBottomWidth: 2 }]}
              onPress={() => { setActiveCat(i); setActiveSub(0); }}
            >
              <Text style={[styles.tabLabel, activeCat === i && { color: col }]}>{c.categoria}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {hasSubs && (
        <View style={styles.subTabRow}>
          {cat.subcategorias.map((s, i) => {
            const col = getColor(cat.categoria, s.subcategoria);
            return (
              <TouchableOpacity
                key={s.subcategoria}
                style={[styles.subTab, activeSub === i && { backgroundColor: col + '22', borderColor: col }]}
                onPress={() => setActiveSub(i)}
              >
                <Text style={[styles.subTabLabel, activeSub === i && { color: col }]}>{s.subcategoria}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {cat.aviso && (
        <View style={styles.avisoBox}>
          <Text style={styles.avisoText}>{cat.aviso}</Text>
        </View>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {Object.keys(tiers).sort((a, b) => +a - +b).map(tier => (
          <TierGroup key={tier} tier={+tier} titles={tiers[tier]} color={color} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#11111b' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  pageTitle: { color: '#cdd6f4', fontSize: 22, fontWeight: 'bold' },
  badge: { backgroundColor: '#1e1e2e', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center' },
  badgeLabel: { color: '#6c7086', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  badgeValue: { color: '#89b4fa', fontSize: 14, fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', backgroundColor: '#1e1e2e', borderBottomWidth: 1, borderBottomColor: '#2e2e4e' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabLabel: { color: '#6c7086', fontSize: 12, fontWeight: '700' },
  subTabRow: { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: '#181825' },
  subTab: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#2e2e4e' },
  subTabLabel: { color: '#6c7086', fontSize: 12, fontWeight: '600' },
  avisoBox: { margin: 12, backgroundColor: '#2d2d1e', borderRadius: 8, padding: 10, borderLeftWidth: 3, borderLeftColor: '#f9e2af' },
  avisoText: { color: '#f9e2af', fontSize: 11, lineHeight: 16 },
  list: { flex: 1 },
  listContent: { padding: 12, paddingBottom: 40 },
  tierGroup: { marginBottom: 12 },
  tierHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tierLine: { flex: 1, height: 1 },
  tierLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  card: { backgroundColor: '#1e1e2e', borderRadius: 12, marginBottom: 6, borderWidth: 1, borderColor: '#2e2e4e', borderLeftWidth: 3, borderLeftColor: '#2e2e4e', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  cardDot: { width: 9, height: 9, borderRadius: 5 },
  cardName: { flex: 1, color: '#cdd6f4', fontSize: 13, fontWeight: '700' },
  acquiredBadge: { fontSize: 14, fontWeight: 'bold' },
  chevron: { color: '#6c7086', fontSize: 11 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 12, gap: 8 },
  section: { gap: 3 },
  sectionLabel: { color: '#6c7086', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  bullet: { color: '#cdd6f4', fontSize: 12, lineHeight: 18 },
  chainRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
  chainItem: { flex: 1, gap: 2 },
  chainLabel: { color: '#45475a', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  chainName: { fontSize: 11, fontWeight: '700' },
  acquireBtn: { marginTop: 6, backgroundColor: '#1d3052', borderRadius: 8, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: '#89b4fa' },
  acquireBtnOff: { backgroundColor: '#1e1e2e', borderColor: '#2e2e4e' },
  acquireBtnText: { color: '#89b4fa', fontSize: 13, fontWeight: '700' },
  acquireBtnTextOff: { color: '#3d3d5c' },
  bindingWarn:       { color: '#f9e2af', fontSize: 10, fontWeight: '700', marginRight: 6 },
  rebindBtn:         { marginTop: 6, backgroundColor: '#1e1e2e', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#45475a' },
  rebindBtnWarn:     { borderColor: '#f9e2af', backgroundColor: '#3d2f1a' },
  rebindBtnText:     { color: '#a6adc8', fontSize: 12, fontWeight: '600' },
  rebindBtnTextWarn: { color: '#f9e2af', fontSize: 12, fontWeight: '700' },
});

const mStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1e1e2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32, maxHeight: '85%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#45475a', alignSelf: 'center', marginBottom: 14 },
  title: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#6c7086', fontSize: 12, lineHeight: 18, marginBottom: 8 },
  count: { color: '#45475a', fontSize: 13, fontWeight: '700', marginBottom: 12 },
  scroll: { flexGrow: 0, maxHeight: 380 },
  empty: { color: '#45475a', textAlign: 'center', padding: 20 },
  catGroup: { marginBottom: 12 },
  catGroupLocked: { opacity: 0.4 },
  catLabel: { color: '#89b4fa', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  skillItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#313244', borderRadius: 8, padding: 10, marginBottom: 6, borderWidth: 1.5, borderColor: 'transparent' },
  skillItemDisabled: { opacity: 0.35 },
  skillName: { color: '#cdd6f4', fontSize: 13, fontWeight: '600' },
  skillSub: { color: '#6c7086', fontSize: 11 },
  check: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#45475a', alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#11111b', fontSize: 11, fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn: { flex: 1, backgroundColor: '#313244', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelText: { color: '#6c7086', fontWeight: '600' },
  confirmBtn: { flex: 1, backgroundColor: '#1d3052', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#89b4fa' },
  confirmBtnOff: { backgroundColor: '#1e1e2e', borderColor: '#2e2e4e' },
  confirmText: { color: '#89b4fa', fontWeight: '700' },
});
