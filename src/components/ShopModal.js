import React, { useState, useMemo } from 'react';
import {
  Modal, View, Text, TextInput, FlatList, ScrollView, TouchableOpacity, StyleSheet,
  Pressable, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCharacter } from '../context/CharacterContext';
import {
  PROFESSION_ITEMS, PROFESSION_GROUPS, SHOP_NAMES,
} from '../data/professionItemsData';

const GROUP_ICONS = {
  'JOALHEIRO':              '💍',
  'FERREIRO':               '⚒️',
  'COSTUREIRO':             '🧵',
  'GRÃO MESTRE FIANDEIRO':  '🧶',
  'GRÃO MESTRE DOS TALHERES': '🍖',
  'SÁBIO DO CALDEIRÃO':     '🧪',
  'ROEDOR DE MINÉRIOS':     '⛏️',
  'CHEFE DA CAÇADA':        '🪤',
  'CONSTRUTOR':             '🔨',
  'RITUALISTA':             '📜',
  'SENHOR DOS REGISTROS':   '✒️',
  'MAGICONDUTOR':           '🔮',
  'FERMENTADOR':            '🍷',
  'XAMÃ':                   '🌿',
  'PEADOR DE BICHÃO':       '🐕',
  'CHEFIA DA TORA E LASCAS': '🪵',
};

const CATEGORY_ICONS = {
  'Matéria-Prima':           '🪨',
  'Combate':                 '⚔️',
  'Cura/Suporte':            '❤️',
  'Vestuário/Acessório':     '👕',
  'Outros':                  '📦',
  'Magia':                   '🔮',
  'Utilidade/Sobrevivência': '🏕️',
  'Alimento/Bebida':         '🍖',
  'Equipamento':             '🛡️',
  'Documento/Mapa':          '📜',
  'Construção/Móvel':        '🪑',
  'Alquimia':                '⚗️',
};

function shopNameFor(group) {
  return SHOP_NAMES[group] || `Loja de ${group.charAt(0) + group.slice(1).toLowerCase()}`;
}

// 'GRÃO MESTRE DOS TALHERES' → 'Grão Mestre dos Talheres'
function professionLabel(group) {
  const minor = ['da', 'de', 'do', 'das', 'dos', 'e'];
  return group
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i > 0 && minor.includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

export default function ShopModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { character, dispatch } = useCharacter();
  const [search, setSearch]     = useState('');
  const [grupo, setGrupo]       = useState('todos');
  const [buying, setBuying]     = useState(null);

  const moedas = character.inventory?.moedas ?? 0;
  const bolsa  = character.inventory?.bolsa;
  const hasEmptySlot = bolsa?.itens?.slice(0, bolsa.capacidade).some(it => !it?.nome);

  // Itens já possuídos (por nome) em qualquer armazenamento
  const ownedNames = useMemo(() => {
    const all = [
      ...(character.inventory?.bolsa?.itens ?? []),
      ...(character.inventory?.cinto?.itens ?? []),
      ...((character.inventory?.storages ?? []).flatMap(st => st.itens ?? [])),
    ];
    return new Set(all.map(it => (it?.nome || '').toLowerCase()).filter(Boolean));
  }, [character.inventory]);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => (
    PROFESSION_ITEMS
      .filter(it => grupo === 'todos' || it.grupo === grupo)
      .filter(it => !q || it.nome.toLowerCase().includes(q))
  ), [grupo, q]);

  if (!visible) return null;

  function confirmBuy(price) {
    if (!buying) return;
    if (!hasEmptySlot) {
      Alert.alert('Bolsa cheia', 'Esvazie um slot na bolsa antes de adquirir.');
      return;
    }
    if (price > moedas) {
      Alert.alert('Moedas insuficientes', `Você tem ${moedas} mo e o preço é ${price} mo.`);
      return;
    }
    const obs = [
      buying.descricao,
      buying.ingredientes ? `📦 ${buying.ingredientes}` : '',
      `Comprado em ${shopNameFor(buying.grupo)} por ${price} mo`,
    ].filter(Boolean).join('\n');
    dispatch({ type: 'INVENTORY_BUY_ITEM', nome: buying.nome, obs, price });
    setBuying(null);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>🛒 Itens à venda</Text>
          <View style={s.headerRight}>
            <Text style={s.moedas}>🪙 {moedas}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={s.close}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Busca */}
        <View style={s.searchRow}>
          <TextInput
            style={s.searchInput}
            placeholder="Buscar item pelo nome..."
            placeholderTextColor="#6c7086"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={s.searchClear}>
              <Text style={s.searchClearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtro por profissão (chips horizontais) */}
        <View style={s.catBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
            <TouchableOpacity
              style={[s.catChip, grupo === 'todos' && s.catChipActive]}
              onPress={() => setGrupo('todos')}
            >
              <Text style={[s.catChipText, grupo === 'todos' && s.catChipTextActive]}>
                Todos ({PROFESSION_ITEMS.length})
              </Text>
            </TouchableOpacity>
            {PROFESSION_GROUPS.map(g => (
              <TouchableOpacity
                key={g}
                style={[s.catChip, grupo === g && s.catChipActive]}
                onPress={() => setGrupo(grupo === g ? 'todos' : g)}
              >
                <Text style={[s.catChipText, grupo === g && s.catChipTextActive]}>
                  {GROUP_ICONS[g] ?? '🏪'} {professionLabel(g)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lista de itens */}
        <FlatList
          data={filtered}
          keyExtractor={it => it.id}
          contentContainerStyle={s.itemList}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Text style={s.resultCount}>
              {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
              {grupo !== 'todos' ? ` de ${professionLabel(grupo)}` : ''}
            </Text>
          }
          ListEmptyComponent={<Text style={s.empty}>Nenhum item encontrado.</Text>}
          renderItem={({ item: it }) => {
            const owned = ownedNames.has(it.nome.toLowerCase());
            const tooExpensive = it.valor > moedas;
            return (
              <View style={[s.itemCard, owned && s.itemCardOwned]}>
                {/* Loja que vende */}
                <View style={s.shopRow}>
                  <Text style={s.shopRowText}>
                    {GROUP_ICONS[it.grupo] ?? '🏪'} {shopNameFor(it.grupo)}
                  </Text>
                  <Text style={s.tagCat}>{CATEGORY_ICONS[it.categoria] ?? ''} {it.categoria}</Text>
                </View>

                <View style={s.itemHeader}>
                  <Text style={s.itemName}>
                    {it.narrativo ? '★ ' : ''}{it.nome}
                  </Text>
                  <Text style={s.itemPrice}>🪙 {it.valor}</Text>
                </View>

                <View style={s.itemTags}>
                  <Text style={[s.tag, tagColor(it.tipo)]}>{it.tipo}</Text>
                  {it.subProfissao ? <Text style={s.tagSub}>{it.subProfissao}</Text> : null}
                  <Text style={s.tagLvl}>Nv {it.nivel}</Text>
                  {owned && <Text style={s.tagOwned}>já tem</Text>}
                </View>

                {it.ingredientes ? (
                  <Text style={s.itemIngredients}>📦 {it.ingredientes}</Text>
                ) : null}
                {it.descricao ? (
                  <Text style={s.itemDesc}>{it.descricao}</Text>
                ) : null}

                <TouchableOpacity
                  style={[s.buyBtn, (tooExpensive || !hasEmptySlot) && s.buyBtnWarn]}
                  onPress={() => setBuying(it)}
                >
                  <Text style={s.buyBtnText}>Adquirir</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />

        <BuyDialog
          item={buying}
          onClose={() => setBuying(null)}
          onConfirm={confirmBuy}
        />
      </View>
    </Modal>
  );
}

// ── Dialog de compra ─────────────────────────────────────────────────────────
function BuyDialog({ item, onClose, onConfirm }) {
  const [price, setPrice] = useState('');

  React.useEffect(() => {
    if (item) setPrice(String(item.valor));
  }, [item]);

  if (!item) return null;

  return (
    <Modal transparent animationType="fade" visible={!!item} onRequestClose={onClose}>
      <Pressable style={d.overlay} onPress={onClose}>
        <Pressable style={d.card} onPress={() => {}}>
          <Text style={d.title}>Adquirir item</Text>
          <Text style={d.itemName}>{item.nome}</Text>
          <Text style={d.shopHint}>
            {GROUP_ICONS[item.grupo] ?? '🏪'} Vendido em: {shopNameFor(item.grupo)}
          </Text>
          <Text style={d.label}>Quanto vai pagar (mo)?</Text>
          <TextInput
            style={d.input}
            value={price}
            onChangeText={v => setPrice(v.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            autoFocus
          />
          <Text style={d.hint}>Sugestão da tabela: {item.valor} mo</Text>
          <View style={d.btnRow}>
            <TouchableOpacity style={d.cancelBtn} onPress={onClose}>
              <Text style={d.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[d.confirmBtn, !price && d.confirmBtnOff]}
              disabled={!price}
              onPress={() => onConfirm(parseInt(price) || 0)}
            >
              <Text style={d.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function tagColor(tipo) {
  switch (tipo) {
    case 'Item Final':    return { color: '#a6e3a1', borderColor: '#a6e3a155' };
    case 'Ingrediente':   return { color: '#fab387', borderColor: '#fab38755' };
    case 'Recurso Bruto': return { color: '#89dceb', borderColor: '#89dceb55' };
    default:              return { color: '#cdd6f4', borderColor: '#2e2e4e' };
  }
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11111b' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#2e2e4e', backgroundColor: '#1e1e2e',
  },
  title: { color: '#cdd6f4', fontSize: 17, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  moedas: { color: '#f9e2af', fontSize: 14, fontWeight: '700' },
  close:  { color: '#6c7086', fontSize: 18, fontWeight: '600' },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, backgroundColor: '#1e1e2e',
  },
  searchInput: {
    flex: 1, backgroundColor: '#181825', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    color: '#cdd6f4', fontSize: 14, borderWidth: 1, borderColor: '#2e2e4e',
  },
  searchClear: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center',
  },
  searchClearText: { color: '#cdd6f4', fontSize: 14 },

  catBar: { backgroundColor: '#1e1e2e', borderBottomWidth: 1, borderBottomColor: '#2e2e4e' },
  catRow: { paddingHorizontal: 10, paddingBottom: 10, gap: 6 },
  catChip: {
    backgroundColor: '#313244', borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#45475a',
  },
  catChipActive: { backgroundColor: '#1d3052', borderColor: '#89b4fa' },
  catChipText: { color: '#a6adc8', fontSize: 12, fontWeight: '600' },
  catChipTextActive: { color: '#89b4fa' },

  itemList: { padding: 12, gap: 8, paddingBottom: 40 },
  resultCount: { color: '#6c7086', fontSize: 11, marginBottom: 4 },
  empty: { color: '#45475a', textAlign: 'center', padding: 24 },

  itemCard: {
    backgroundColor: '#1e1e2e', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#2e2e4e', gap: 6, marginBottom: 8,
  },
  itemCardOwned: { borderColor: '#a6e3a155' },

  shopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#2e2e4e',
  },
  shopRowText: { color: '#89b4fa', fontSize: 12, fontWeight: '700' },
  tagCat: { color: '#6c7086', fontSize: 10 },

  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  itemName:   { color: '#cdd6f4', fontSize: 14, fontWeight: '700', flex: 1 },
  itemPrice:  { color: '#f9e2af', fontSize: 14, fontWeight: '700' },

  itemTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:      { fontSize: 10, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  tagSub:   { color: '#cba6f7', fontSize: 10, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2 },
  tagLvl:   { color: '#6c7086', fontSize: 10, paddingHorizontal: 6, paddingVertical: 2 },
  tagOwned: { color: '#a6e3a1', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2 },

  itemIngredients: { color: '#fab387', fontSize: 11 },
  itemDesc:        { color: '#a6adc8', fontSize: 12, lineHeight: 17 },

  buyBtn:  { backgroundColor: '#1d3052', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#89b4fa', marginTop: 4 },
  buyBtnWarn: { backgroundColor: '#1e1e2e', borderColor: '#f38ba8' },
  buyBtnText: { color: '#89b4fa', fontSize: 12, fontWeight: '700' },
});

const d = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#1e1e2e', borderRadius: 14, padding: 20, width: '100%', maxWidth: 360, borderWidth: 1, borderColor: '#2e2e4e' },
  title: { color: '#89b4fa', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  itemName: { color: '#cdd6f4', fontSize: 16, fontWeight: '700', marginTop: 6 },
  shopHint: { color: '#89b4fa', fontSize: 12, marginTop: 4, marginBottom: 12 },
  label: { color: '#6c7086', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#181825', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#f9e2af', fontSize: 18, fontWeight: '700', textAlign: 'center', borderWidth: 1, borderColor: '#45475a' },
  hint: { color: '#45475a', fontSize: 11, marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, backgroundColor: '#313244', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelText: { color: '#6c7086', fontWeight: '600' },
  confirmBtn: { flex: 1, backgroundColor: '#89b4fa', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  confirmBtnOff: { backgroundColor: '#2e2e4e' },
  confirmText: { color: '#1e1e2e', fontWeight: '700' },
});
