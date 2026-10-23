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

// O vínculo de um título é com uma TRILHA inteira (maestria), não com habilidades
// individuais. As habilidades só definem a ELEGIBILIDADE: para vincular, a trilha
// precisa ter `quantidade` habilidades em nível ≥ `nivel`. Depois de vinculado, o
// efeito do título (ex: +4 em testes de magia) vale para toda a trilha.
// Retorna [{ id, nome, qualificadas, categoria }] — só as trilhas elegíveis.
function getEligibleTrails(req, acquiredTrails) {
  const pool = FONTE_TRAILS[req.fonte] ?? [];
  const out = [];
  for (const trail of pool) {
    if (req.trailFixo && trail.id !== req.trailFixo) continue;
    if (req.trilhasPermitidas && !req.trilhasPermitidas.includes(trail.id)) continue;
    const trailData = acquiredTrails?.[trail.id];
    if (!trailData) continue;
    const qualificadas = trail.skills.filter(
      sk => (trailData.skills?.[sk.id] ?? 0) >= req.nivel
    );
    if (qualificadas.length < req.quantidade) continue;
    out.push({
      id: trail.id,
      nome: trail.nome,
      categoria: trail.categoria ?? null,
      qualificadas: qualificadas.map(sk => sk.nome),
    });
  }
  return out;
}

function hasEligibleTrail(req, acquiredTrails) {
  return getEligibleTrails(req, acquiredTrails).length > 0;
}

// Lê a maestria vinculada aceitando o formato novo ({trailId}) e o antigo
// (lista de habilidades, de fichas salvas antes dessa mudança).
function readBoundTrail(binding) {
  if (!binding) return null;
  if (Array.isArray(binding)) {
    return binding.length > 0
      ? { trailId: binding[0].trailId, trailNome: binding[0].trailNome ?? null }
      : null;
  }
  return binding.trailId ? binding : null;
}

// ── Trail Binding Modal ───────────────────────────────────────────────────────

function TrailBindingModal({ visible, title, acquiredTrails, color, onConfirm, onCancel }) {
  const insets = useSafeAreaInsets();
  // Mesmo motivo do TitleCard: requisitoHabilidades só existe em TITLE_BY_ID.
  const req = title?.id ? (TITLE_BY_ID[title.id]?.requisitoHabilidades ?? null) : null;
  const [selected, setSelected] = useState(null);   // trailId escolhido

  const trilhas = useMemo(
    () => req ? getEligibleTrails(req, acquiredTrails) : [],
    [req, acquiredTrails]
  );

  if (!req || !title) return null;

  const canConfirm = !!selected;
  const handleClose = () => { setSelected(null); onCancel(); };
  const handleConfirm = () => {
    const t = trilhas.find(x => x.id === selected);
    if (!t) return;
    setSelected(null);
    onConfirm({ trailId: t.id, trailNome: t.nome });
  };

  const fonteLabel = FONTE_LABEL[req.fonte] ?? req.fonte;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={mStyles.overlay} onPress={handleClose}>
        <Pressable style={[mStyles.sheet, insets.bottom > 0 && { paddingBottom: 32 + insets.bottom }]} onPress={() => {}}>
          <View style={mStyles.handle} />
          <Text style={[mStyles.title, { color }]}>{title.nome}</Text>
          <Text style={mStyles.subtitle}>
            Escolha a Maestria de {fonteLabel} que este título potencializa.
            {'\n'}O efeito vale para TODA a maestria escolhida.
          </Text>
          <Text style={mStyles.reqNote}>
            Requisito: {req.quantidade} habilidades em nível ≥ {req.nivel} na maestria.
          </Text>

          <ScrollView style={mStyles.scroll} showsVerticalScrollIndicator={false}>
            {trilhas.length === 0 ? (
              <Text style={mStyles.empty}>
                Nenhuma maestria de {fonteLabel} atende o requisito ainda
                ({req.quantidade} habilidades em nível ≥ {req.nivel}).
              </Text>
            ) : (
              trilhas.map(t => {
                const sel = selected === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      mStyles.trailItem,
                      sel && { borderColor: color, backgroundColor: color + '22' },
                    ]}
                    onPress={() => setSelected(sel ? null : t.id)}
                  >
                    <View style={[mStyles.radio, sel && { borderColor: color }]}>
                      {sel && <View style={[mStyles.radioDot, { backgroundColor: color }]} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[mStyles.trailName, sel && { color }]}>{t.nome}</Text>
                      <Text style={mStyles.trailSub}>
                        {t.qualificadas.length} hab. em nível ≥ {req.nivel}
                        {t.categoria ? ` · ${t.categoria}` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
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
              <Text style={[mStyles.confirmText, canConfirm && { color }]}>Vincular</Text>
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
  // `title` chega cru de CATEGORIAS_RAW, que não carrega requisitoHabilidades —
  // esse campo só é anexado em TITLE_BY_ID por buildMaps().
  const req        = TITLE_BY_ID[title.id]?.requisitoHabilidades ?? null;

  const skillReqMet = !req || hasEligibleTrail(req, character.skillTree.acquiredTrails);
  const canAcquire = !acquired && prereqsMet && skillReqMet;

  const unlocksNames = (TITLE_UNLOCKS[title.id] ?? []).map(id => TITLE_BY_ID[id]?.nome).filter(Boolean);
  const prereqNames  = prereqIds.map(id => TITLE_BY_ID[id]?.nome).filter(Boolean);
  const boundTrail   = readBoundTrail(character.titles?.bindings?.[title.id]);
  // Título adquirido com requisito mas sem maestria vinculada — pode vincular
  const canRebind     = acquired && !!req;
  const missingBinding = canRebind && !boundTrail;

  const handleAcquire = () => req ? setBindingMode('acquire') : dispatch({ type: 'ACQUIRE_TITLE', titleId: title.id });
  const handleRebind  = () => setBindingMode('rebind');

  const acquireBtnLabel = !canAcquire
    ? (!prereqsMet ? 'Requer título anterior' : 'Nenhuma maestria elegível')
    : req ? 'Escolher Maestria...' : 'Adquirir Título';

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

          {acquired && boundTrail && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Maestria Vinculada</Text>
              <Text style={[styles.bullet, { color: color + 'cc' }]}>
                🔗 {boundTrail.trailNome ?? boundTrail.trailId}
              </Text>
            </View>
          )}

          {canRebind && (
            <TouchableOpacity
              style={[styles.rebindBtn, missingBinding && styles.rebindBtnWarn]}
              onPress={handleRebind}
            >
              <Text style={[styles.rebindBtnText, missingBinding && styles.rebindBtnTextWarn]}>
                {missingBinding ? 'Vincular Maestria…' : 'Trocar Maestria…'}
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

      <TrailBindingModal
        visible={!!bindingMode}
        title={title}
        acquiredTrails={character.skillTree.acquiredTrails}
        color={color}
        onConfirm={boundTrail => {
          const mode = bindingMode;
          setBindingMode(null);
          if (mode === 'rebind') {
            dispatch({ type: 'REBIND_TITLE_SKILLS', titleId: title.id, boundTrail });
          } else {
            dispatch({ type: 'ACQUIRE_TITLE', titleId: title.id, boundTrail });
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
  scroll: { flexGrow: 0, maxHeight: 380 },
  empty: { color: '#45475a', textAlign: 'center', padding: 20 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn: { flex: 1, backgroundColor: '#313244', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelText: { color: '#6c7086', fontWeight: '600' },
  confirmBtn: { flex: 1, backgroundColor: '#1d3052', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#89b4fa' },
  confirmBtnOff: { backgroundColor: '#1e1e2e', borderColor: '#2e2e4e' },
  confirmText: { color: '#89b4fa', fontWeight: '700' },
  reqNote: { color: '#45475a', fontSize: 11, marginBottom: 12 },
  trailItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#313244', borderRadius: 10, padding: 14,
    marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent',
  },
  trailName: { color: '#cdd6f4', fontSize: 14, fontWeight: '700' },
  trailSub:  { color: '#6c7086', fontSize: 11, marginTop: 2 },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: '#45475a', alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});
