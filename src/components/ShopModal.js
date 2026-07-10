import React, { useState, useMemo } from 'react';
import {
  Modal, View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet,
  Pressable, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCharacter } from '../context/CharacterContext';
import {
  ITEMS_BY_GROUP, PROFESSION_GROUPS, SHOP_NAMES, PROFESSION_ITEMS,
} from '../data/professionItemsData';

const TIPO_FILTERS = [
  { id: 'todos',      label: 'Todos'      },
  { id: 'Item Final', label: 'Itens'      },
  { id: 'Ingrediente', label: 'Ingr.'     },
  { id: 'Recurso Bruto', label: 'Recursos'},
];

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

function shopNameFor(group) {
  return SHOP_NAMES[group] || `Loja de ${group.charAt(0) + group.slice(1).toLowerCase()}`;
}

export default function ShopModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { character } = useCharacter();
  const [selectedGroup, setSelectedGroup] = useState(null);   // { group, initialSearch }

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          {selectedGroup ? (
            <TouchableOpacity onPress={() => setSelectedGroup(null)}>
              <Text style={s.back}>‹ Lojas</Text>
            </TouchableOpacity>
          ) : (
            <Text style={s.title}>🛒 Lojas</Text>
          )}
          <View style={s.headerRight}>
            <Text style={s.moedas}>🪙 {character.inventory?.moedas ?? 0}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={s.close}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {selectedGroup
          ? <ShopDetail
              group={selectedGroup.group}
              initialSearch={selectedGroup.initialSearch}
              onClose={onClose}
            />
          : <ShopList onSelect={(group, initialSearch) => setSelectedGroup({ group, initialSearch: initialSearch ?? '' })} />
        }
      </View>
    </Modal>
  );
}

// ── Lista de lojas ───────────────────────────────────────────────────────────
function ShopList({ onSelect }) {
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return PROFESSION_ITEMS
      .filter(it => it.nome.toLowerCase().includes(q))
      .slice(0, 40);
  }, [q]);

  return (
    <ScrollView contentContainerStyle={s.listContent} keyboardShouldPersistTaps="handled">
      <View style={s.searchRowList}>
        <TextInput
          style={[s.searchInput, { flex: 1 }]}
          placeholder="Buscar item em todas as lojas..."
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

      {q ? (
        results.length === 0 ? (
          <Text style={s.empty}>Nenhum item encontrado.</Text>
        ) : (
          results.map(it => (
            <TouchableOpacity
              key={it.id}
              style={s.searchResult}
              onPress={() => onSelect(it.grupo, it.nome)}
              activeOpacity={0.8}
            >
              <Text style={s.searchResultIcon}>{GROUP_ICONS[it.grupo] ?? '🏪'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.searchResultName}>
                  {it.narrativo ? '★ ' : ''}{it.nome}
                </Text>
                <Text style={s.searchResultShop}>{shopNameFor(it.grupo)} · {it.tipo}</Text>
              </View>
              <Text style={s.itemPrice}>🪙 {it.valor}</Text>
            </TouchableOpacity>
          ))
        )
      ) : (
        <>
          <Text style={s.subtitle}>
            Catálogo de referência. As compras precisam ser combinadas narrativamente com o mestre.
          </Text>
          {PROFESSION_GROUPS.map(g => {
            const count = (ITEMS_BY_GROUP[g] ?? []).length;
            return (
              <TouchableOpacity
                key={g}
                style={s.shopCard}
                onPress={() => onSelect(g)}
                activeOpacity={0.8}
              >
                <Text style={s.shopIcon}>{GROUP_ICONS[g] ?? '🏪'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.shopName}>{shopNameFor(g)}</Text>
                  <Text style={s.shopGroup}>{g}</Text>
                </View>
                <Text style={s.shopCount}>{count} itens</Text>
                <Text style={s.shopChevron}>›</Text>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

// ── Detalhe de uma loja ──────────────────────────────────────────────────────
function ShopDetail({ group, initialSearch, onClose }) {
  const { character, dispatch } = useCharacter();
  const [filtro, setFiltro] = useState('todos');
  const [search, setSearch] = useState(initialSearch ?? '');
  const [buying, setBuying] = useState(null); // item sendo comprado
  const items = ITEMS_BY_GROUP[group] ?? [];

  // Quais itens já estão na bolsa (por nome)
  const ownedNames = useMemo(() => {
    const all = [
      ...(character.inventory?.bolsa?.itens ?? []),
      ...(character.inventory?.cinto?.itens ?? []),
      ...((character.inventory?.storages ?? []).flatMap(st => st.itens ?? [])),
    ];
    return new Set(all.map(it => (it?.nome || '').toLowerCase()).filter(Boolean));
  }, [character.inventory]);

  const moedas = character.inventory?.moedas ?? 0;
  const bolsa  = character.inventory?.bolsa;
  const hasEmptySlot = bolsa?.itens?.slice(0, bolsa.capacidade)
    .some(it => !it?.nome);

  const filtered = items
    .filter(it => filtro === 'todos' || it.tipo === filtro)
    .filter(it => !search.trim() || it.nome.toLowerCase().includes(search.toLowerCase().trim()));

  return (
    <>
      <View style={s.shopHeader}>
        <Text style={s.shopHeaderName}>{shopNameFor(group)}</Text>
        <Text style={s.shopHeaderGroup}>{group}</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar item..."
          placeholderTextColor="#6c7086"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={s.filterRow}>
        {TIPO_FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[s.filterBtn, filtro === f.id && s.filterBtnActive]}
            onPress={() => setFiltro(f.id)}
          >
            <Text style={[s.filterText, filtro === f.id && s.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.itemList}>
        {filtered.length === 0 ? (
          <Text style={s.empty}>Nenhum item encontrado.</Text>
        ) : (
          filtered.map(it => {
            const owned = ownedNames.has(it.nome.toLowerCase());
            const tooExpensive = it.valor > moedas;
            return (
              <View key={it.id} style={[s.itemCard, owned && s.itemCardOwned]}>
                <View style={s.itemHeader}>
                  <Text style={s.itemName}>
                    {it.narrativo ? '★ ' : ''}{it.nome}
                  </Text>
                  <Text style={s.itemPrice}>🪙 {it.valor}</Text>
                </View>
                <View style={s.itemTags}>
                  <Text style={[s.tag, tagColor(it.tipo)]}>{it.tipo}</Text>
                  {it.subProfissao && <Text style={s.tagSub}>{it.subProfissao}</Text>}
                  <Text style={s.tagLvl}>Nv {it.nivel}</Text>
                  {owned && <Text style={s.tagOwned}>já tem</Text>}
                </View>
                {it.ingredientes && (
                  <Text style={s.itemIngredients}>📦 {it.ingredientes}</Text>
                )}
                {it.descricao && (
                  <Text style={s.itemDesc}>{it.descricao}</Text>
                )}
                <TouchableOpacity
                  style={[s.buyBtn, (tooExpensive || !hasEmptySlot) && s.buyBtnWarn]}
                  onPress={() => setBuying(it)}
                >
                  <Text style={s.buyBtnText}>Adquirir</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <BuyDialog
        item={buying}
        onClose={() => setBuying(null)}
        onConfirm={(price) => {
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
            `Comprado em ${shopNameFor(group)} por ${price} mo`,
          ].filter(Boolean).join('\n');
          dispatch({
            type: 'INVENTORY_BUY_ITEM',
            nome: buying.nome,
            obs,
            price,
          });
          setBuying(null);
        }}
      />
    </>
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
  back:  { color: '#89b4fa', fontSize: 16, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  moedas: { color: '#f9e2af', fontSize: 14, fontWeight: '700' },
  close:  { color: '#6c7086', fontSize: 18, fontWeight: '600' },

  listContent: { padding: 16, gap: 10 },
  subtitle:    { color: '#6c7086', fontSize: 12, lineHeight: 18, marginBottom: 6 },

  searchRowList: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchClear: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#313244', alignItems: 'center', justifyContent: 'center',
  },
  searchClearText: { color: '#cdd6f4', fontSize: 14 },
  searchResult: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1e1e2e', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#2e2e4e',
  },
  searchResultIcon: { fontSize: 18 },
  searchResultName: { color: '#cdd6f4', fontSize: 13, fontWeight: '700' },
  searchResultShop: { color: '#6c7086', fontSize: 11, marginTop: 2 },

  shopCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e1e2e', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#2e2e4e',
  },
  shopIcon:  { fontSize: 24 },
  shopName:  { color: '#cdd6f4', fontSize: 15, fontWeight: '700' },
  shopGroup: { color: '#6c7086', fontSize: 11, marginTop: 2 },
  shopCount: { color: '#fab387', fontSize: 11 },
  shopChevron: { color: '#6c7086', fontSize: 18 },

  shopHeader: { padding: 16, backgroundColor: '#181825', borderBottomWidth: 1, borderBottomColor: '#2e2e4e' },
  shopHeaderName:  { color: '#cdd6f4', fontSize: 16, fontWeight: '700' },
  shopHeaderGroup: { color: '#6c7086', fontSize: 11, marginTop: 2 },

  searchRow: { padding: 10, backgroundColor: '#1e1e2e' },
  searchInput: {
    backgroundColor: '#181825', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: '#cdd6f4', fontSize: 14, borderWidth: 1, borderColor: '#2e2e4e',
  },
  filterRow: { flexDirection: 'row', gap: 6, padding: 10, paddingTop: 0, backgroundColor: '#1e1e2e', borderBottomWidth: 1, borderBottomColor: '#2e2e4e' },
  filterBtn: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center', backgroundColor: '#313244' },
  filterBtnActive: { backgroundColor: '#1d3052', borderWidth: 1, borderColor: '#89b4fa' },
  filterText: { color: '#6c7086', fontSize: 11, fontWeight: '600' },
  filterTextActive: { color: '#89b4fa' },

  itemList: { padding: 12, gap: 8 },
  empty: { color: '#45475a', textAlign: 'center', padding: 24 },

  itemCard: {
    backgroundColor: '#1e1e2e', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#2e2e4e', gap: 6,
  },
  itemCardOwned: { borderColor: '#a6e3a155' },
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
  itemName: { color: '#cdd6f4', fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 12 },
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
