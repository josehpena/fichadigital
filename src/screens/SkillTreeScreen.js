import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Pressable, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCharacter } from '../context/CharacterContext';
import { TRAILS_PROFISSOES, TRAILS_ARMAS, TRAILS_MAGIAS } from '../data/trailsData';

const CATEGORY_TABS = [
  { key: 'profissoes', label: 'Profissões', color: '#fab387', trails: TRAILS_PROFISSOES },
  { key: 'armas',      label: 'Armas',      color: '#f38ba8', trails: TRAILS_ARMAS      },
  { key: 'magias',     label: 'Magias',     color: '#cba6f7', trails: TRAILS_MAGIAS     },
];

const MAX_LEVEL = 3;

// ── Skill Row ────────────────────────────────────────────────────────────────

function SkillRow({ trailId, trailCost, skill, onLongPress }) {
  const { character, dispatch } = useCharacter();
  const trailData = character.skillTree.acquiredTrails[trailId];
  const curLevel  = trailData?.skills[skill.id] ?? 0;
  const currentXp = character.status.xp.current;
  const atMax     = curLevel >= skill.maxLevel;
  const nextCost  = atMax ? 0 : xpCostForRange(curLevel, curLevel + 1, trailCost);
  const canLearn  = !atMax && nextCost <= currentXp;

  return (
    <TouchableOpacity
      style={styles.skillRow}
      onLongPress={() => onLongPress && onLongPress(skill, curLevel, trailCost)}
      activeOpacity={0.9}
    >
      <Text style={styles.skillName}>{skill.nome}</Text>
      <View style={styles.dotsRow}>
        {Array.from({ length: skill.maxLevel }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < curLevel ? styles.dotFilled : styles.dotEmpty]}
          />
        ))}
      </View>
      {atMax ? (
        <View style={styles.maxBadge}>
          <Text style={styles.maxBadgeText}>MAX</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.acquireSkillBtn, !canLearn && styles.acquireSkillBtnOff]}
          disabled={!canLearn}
          onPress={() => dispatch({ type: 'LEARN_SKILL', trailId, skillId: skill.id, targetLevel: curLevel + 1 })}
        >
          <Text style={[styles.acquireSkillBtnText, !canLearn && styles.acquireSkillBtnTextOff]}>
            +{nextCost} XP
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

// Imported helper (duplicated here to avoid circular import issues)
function xpCostForRange(fromLevel, toLevel, costPerLevel) {
  let total = 0;
  for (let lvl = fromLevel + 1; lvl <= toLevel; lvl++) {
    total += lvl * costPerLevel;
  }
  return total;
}

// ── Trail Cost Edit Modal ────────────────────────────────────────────────────

function TrailCostModal({ trail, currentCost, onClose }) {
  const { dispatch } = useCharacter();
  const insets = useSafeAreaInsets();
  const [val, setVal] = useState(String(currentCost));

  const save = () => {
    const n = parseInt(val, 10);
    if (n > 0) dispatch({ type: 'SET_TRAIL_COST', trailId: trail.id, cost: n });
    onClose();
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { paddingBottom: 24 + (insets.bottom > 0 ? insets.bottom : 0) }]}
          onPress={() => {}}
        >
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{trail.nome}</Text>
          <Text style={styles.costEditLabel}>Custo XP por nível de habilidade</Text>
          <TextInput
            style={styles.costEditInput}
            value={val}
            onChangeText={setVal}
            keyboardType="number-pad"
            maxLength={5}
            autoFocus
          />
          <TouchableOpacity style={styles.costEditSaveBtn} onPress={save}>
            <Text style={styles.costEditSaveBtnText}>Salvar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Trail Card ───────────────────────────────────────────────────────────────

function TrailCard({ trail, nextTrailCost, color, onSelectSkillDetail }) {
  const { character } = useCharacter();
  const [expanded, setExpanded] = useState(false);
  const [editingCost, setEditingCost] = useState(false);
  const trailData    = character.skillTree.acquiredTrails[trail.id];
  const acquired     = !!trailData;
  const customCost   = character.skillTree.customCosts?.[trail.id];
  const trailCost    = trailData?.cost ?? customCost ?? nextTrailCost;
  const totalLevels  = trailData
    ? Object.values(trailData.skills).reduce((s, v) => s + v, 0)
    : 0;

  return (
    <View style={[styles.trailCard, acquired && { borderLeftColor: color }]}>
      {editingCost && (
        <TrailCostModal
          trail={trail}
          currentCost={trailCost}
          onClose={() => setEditingCost(false)}
        />
      )}
      <TouchableOpacity
        style={styles.trailHeader}
        onPress={() => setExpanded(v => !v)}
        onLongPress={() => setEditingCost(true)}
        activeOpacity={0.7}
      >
        <View style={[styles.trailDot, { backgroundColor: acquired ? color : '#45475a' }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.trailName, acquired && { color }]}>{trail.nome}</Text>
          {trail.categoria && (
            <Text style={styles.trailCategory}>{trail.categoria}</Text>
          )}
        </View>
        <View style={styles.trailBadge}>
          <Text style={[styles.trailBadgeText, { color: acquired ? color : '#45475a' }]}>
            {trailCost} XP/nível
          </Text>
          {acquired && totalLevels > 0 && (
            <Text style={styles.trailLevels}>{totalLevels} pts</Text>
          )}
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.skillList}>
          {trail.skills.map(s => (
            <SkillRow
              key={s.id}
              trailId={trail.id}
              trailCost={trailCost}
              skill={s}
              onLongPress={(skill, curLevel, cost) =>
                onSelectSkillDetail({ skill, curLevel, trailCost: cost, trailId: trail.id })
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ── Skill Detail Modal ───────────────────────────────────────────────────────

function SkillDetailModal({ detail, onClose }) {
  const insets = useSafeAreaInsets();
  if (!detail) return null;
  const { skill, curLevel, trailCost } = detail;

  const renderNivelContent = (nivelData) => {
    if (Array.isArray(nivelData)) {
      return nivelData.map((line, i) => (
        <Text key={i} style={styles.nivelLine}>{line}</Text>
      ));
    }
    if (typeof nivelData === 'object' && nivelData !== null) {
      return (
        <View>
          {nivelData.custo !== undefined && nivelData.custo !== null && (
            <Text style={styles.nivelLine}>Custo: {nivelData.custo} mana</Text>
          )}
          {nivelData.alcance !== undefined && nivelData.alcance !== null && (
            <Text style={styles.nivelLine}>Alcance: {nivelData.alcance}m</Text>
          )}
          {nivelData.raio !== undefined && nivelData.raio !== null && (
            <Text style={styles.nivelLine}>Raio: {nivelData.raio}m</Text>
          )}
          {nivelData.efeito ? (
            <Text style={styles.nivelLine}>{nivelData.efeito}</Text>
          ) : null}
        </View>
      );
    }
    return <Text style={styles.nivelLine}>{String(nivelData)}</Text>;
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, insets.bottom > 0 && { paddingBottom: 32 + insets.bottom }]} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{skill.nome}</Text>
          {skill.descricao ? (
            <Text style={styles.modalDesc}>{skill.descricao}</Text>
          ) : null}
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {Object.entries(skill.niveis).sort(([a],[b]) => +a - +b).map(([lvl, data]) => (
              <View key={lvl} style={[
                styles.nivelBlock,
                parseInt(lvl) <= curLevel && styles.nivelBlockLearned,
              ]}>
                <Text style={[
                  styles.nivelLabel,
                  parseInt(lvl) <= curLevel && styles.nivelLabelLearned,
                ]}>
                  Nível {lvl}
                  {parseInt(lvl) > curLevel && trailCost > 0 && (
                    <Text style={styles.nivelCost}>
                      {' '}· {xpCostForRange(parseInt(lvl)-1, parseInt(lvl), trailCost)} XP
                    </Text>
                  )}
                </Text>
                {renderNivelContent(data)}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function SkillTreeScreen() {
  const { character } = useCharacter();
  const [activeTab, setActiveTab] = useState('profissoes');
  const [skillDetail, setSkillDetail] = useState(null);

  const nextTrailCost = 40 + character.skillTree.trailCount * 20;
  const tab = CATEGORY_TABS.find(t => t.key === activeTab);

  const totalAcquired = Object.keys(character.skillTree.acquiredTrails).length;

  return (
    <View style={styles.screen}>
      {/* Header info */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Habilidades</Text>
        <View style={styles.headerBadges}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Trilhas</Text>
            <Text style={styles.badgeValue}>{totalAcquired}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Próxima</Text>
            <Text style={[
              styles.badgeValue,
              nextTrailCost > character.status.xp.current && { color: '#f38ba8' },
            ]}>
              {nextTrailCost} XP
            </Text>
          </View>
        </View>
      </View>

      {/* Category tabs */}
      <View style={styles.tabRow}>
        {CATEGORY_TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && { borderBottomColor: t.color, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabLabel, activeTab === t.key && { color: t.color }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trail list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <Text style={styles.hint}>
          Toque para expandir · Compre uma habilidade para desbloquear a trilha · Segure a trilha para editar custo · Segure habilidade para detalhes
        </Text>
        {tab.trails.map(trail => (
          <TrailCard
            key={trail.id}
            trail={trail}
            nextTrailCost={nextTrailCost}
            color={tab.color}
            onSelectSkillDetail={setSkillDetail}
          />
        ))}
      </ScrollView>

      <SkillDetailModal detail={skillDetail} onClose={() => setSkillDetail(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#11111b' },

  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
  },
  pageTitle: { color: '#cdd6f4', fontSize: 22, fontWeight: 'bold' },
  headerBadges: { flexDirection: 'row', gap: 8 },
  badge: {
    backgroundColor: '#1e1e2e', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center',
  },
  badgeLabel: { color: '#6c7086', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  badgeValue: { color: '#89b4fa', fontSize: 14, fontWeight: 'bold' },

  tabRow: {
    flexDirection: 'row', backgroundColor: '#1e1e2e',
    borderBottomWidth: 1, borderBottomColor: '#2e2e4e',
  },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabLabel: { color: '#6c7086', fontSize: 13, fontWeight: '600' },

  list:        { flex: 1 },
  listContent: { padding: 12, paddingBottom: 40 },
  hint: { color: '#45475a', fontSize: 11, marginBottom: 10, textAlign: 'center' },

  trailCard: {
    backgroundColor: '#1e1e2e', borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#2e2e4e', borderLeftWidth: 3, borderLeftColor: '#2e2e4e',
    overflow: 'hidden',
  },
  trailHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, gap: 10,
  },
  trailDot: { width: 10, height: 10, borderRadius: 5 },
  trailName: { color: '#cdd6f4', fontSize: 14, fontWeight: '700' },
  trailCategory: { color: '#6c7086', fontSize: 11 },
  trailBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trailBadgeText: { fontSize: 11, fontStyle: 'italic' },
  trailLevels: { color: '#6c7086', fontSize: 12 },
  chevron: { color: '#6c7086', fontSize: 11 },
  skillList: { paddingHorizontal: 12, paddingBottom: 8 },
  skillRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 7, borderTopWidth: 1, borderTopColor: '#2e2e4e',
    gap: 8,
  },
  skillName: { color: '#cdd6f4', fontSize: 12, flex: 1 },
  dotsRow:   { flexDirection: 'row', gap: 5 },
  dot:       { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5 },
  dotFilled: { backgroundColor: '#89b4fa', borderColor: '#89b4fa' },
  dotEmpty:  { backgroundColor: 'transparent', borderColor: '#45475a' },
  acquireSkillBtn: {
    backgroundColor: '#1d3052', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#89b4fa',
  },
  acquireSkillBtnOff: { backgroundColor: '#1e1e2e', borderColor: '#2e2e4e' },
  acquireSkillBtnText:    { color: '#89b4fa', fontSize: 11, fontWeight: '700' },
  acquireSkillBtnTextOff: { color: '#3d3d5c' },
  maxBadge: { backgroundColor: '#313244', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  maxBadgeText: { color: '#45475a', fontSize: 10, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1e1e2e', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 32, maxHeight: '80%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#45475a', alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { color: '#cdd6f4', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  modalDesc:  { color: '#6c7086', fontSize: 12, marginBottom: 14, lineHeight: 18 },
  modalScroll: { flexGrow: 0 },
  nivelBlock: {
    backgroundColor: '#313244', borderRadius: 8, padding: 10, marginBottom: 8,
  },
  nivelBlockLearned: { backgroundColor: '#1d3052', borderWidth: 1, borderColor: '#89b4fa33' },
  nivelLabel:        { color: '#6c7086', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  nivelLabelLearned: { color: '#89b4fa' },
  nivelCost:         { color: '#94e2d5', fontWeight: '400' },
  nivelLine:         { color: '#cdd6f4', fontSize: 12, lineHeight: 18 },
  modalClose: {
    marginTop: 12, backgroundColor: '#313244', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  modalCloseText: { color: '#cdd6f4', fontWeight: '600' },

  // Trail cost edit
  costEditLabel: { color: '#6c7086', fontSize: 12, marginBottom: 8, marginTop: 4 },
  costEditInput: {
    backgroundColor: '#181825', borderRadius: 10, borderWidth: 1,
    borderColor: '#313244', color: '#cdd6f4', fontSize: 22, fontWeight: 'bold',
    textAlign: 'center', paddingVertical: 10, marginBottom: 12,
  },
  costEditSaveBtn: {
    backgroundColor: '#1d3052', borderRadius: 10, borderWidth: 1,
    borderColor: '#89b4fa', paddingVertical: 12, alignItems: 'center',
  },
  costEditSaveBtnText: { color: '#89b4fa', fontWeight: '700', fontSize: 14 },
});
