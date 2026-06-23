import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function RealNameModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { realName, updateRealName } = useAuth();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (visible) { setValue(realName ?? ''); setError(null); }
  }, [visible, realName]);

  async function save() {
    setSaving(true); setError(null);
    try {
      await updateRealName(value);
      onClose();
    } catch (e) {
      setError('Falha ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={s.overlayPress} onPress={onClose}>
          <Pressable
            style={[s.sheet, insets.bottom > 0 && { paddingBottom: 32 + insets.bottom }]}
            onPress={() => {}}
          >
            <View style={s.handle} />
            <Text style={s.title}>Nome para os amigos</Text>
            <Text style={s.hint}>
              Como você quer aparecer nas aventuras (além do nome do personagem). Pode ser seu primeiro nome ou um apelido.
            </Text>
            <TextInput
              style={s.input}
              value={value}
              onChangeText={setValue}
              placeholder="Seu nome..."
              placeholderTextColor="#45475a"
              autoFocus
              maxLength={48}
            />
            {error && <Text style={s.error}>{error}</Text>}
            <View style={s.btnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose} disabled={saving}>
                <Text style={s.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, !value.trim() && s.saveBtnOff]}
                disabled={!value.trim() || saving}
                onPress={save}
              >
                {saving
                  ? <ActivityIndicator color="#1e1e2e" size="small" />
                  : <Text style={s.saveText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  overlayPress: { flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#181825', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#45475a', alignSelf: 'center', marginBottom: 14 },
  title: { color: '#cdd6f4', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  hint: { color: '#6c7086', fontSize: 12, lineHeight: 18, marginBottom: 14 },
  input: {
    backgroundColor: '#1e1e2e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: '#cdd6f4', fontSize: 15, borderWidth: 1, borderColor: '#45475a',
  },
  error: { color: '#f38ba8', fontSize: 12, marginTop: 8 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn: { flex: 1, backgroundColor: '#313244', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelText: { color: '#6c7086', fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: '#89b4fa', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveBtnOff: { backgroundColor: '#2e2e4e' },
  saveText: { color: '#1e1e2e', fontWeight: '700' },
});
