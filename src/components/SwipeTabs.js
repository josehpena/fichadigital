import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useWindowDimensions,
} from 'react-native';

// Pager de subseções: barra de sub-abas no topo + swipe horizontal entre páginas.
// Implementado com ScrollView pagingEnabled (sem módulo nativo extra, compatível com OTA).
export default function SwipeTabs({ pages }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const scrollRef = useRef(null);

  // Realinha a página atual se a largura mudar (rotação da tela)
  useEffect(() => {
    scrollRef.current?.scrollTo({ x: indexRef.current * width, animated: false });
  }, [width]);

  const onScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== indexRef.current && i >= 0 && i < pages.length) {
      indexRef.current = i;
      setIndex(i);
    }
  };

  const goTo = (i) => {
    indexRef.current = i;
    setIndex(i);
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {pages.map((p, i) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.tab, i === index && styles.tabActive]}
            onPress={() => goTo(i)}
          >
            <Text
              style={[styles.tabText, i === index && styles.tabTextActive]}
              numberOfLines={1}
            >
              {p.icon} {p.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        style={styles.pager}
      >
        {pages.map((p) => {
          const Page = p.component;
          return (
            <View key={p.key} style={{ width }}>
              <Page />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11111b' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e1e2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2e2e4e',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabActive: { backgroundColor: '#313244' },
  tabText: { color: '#6c7086', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#89b4fa', fontWeight: '700' },
  pager: { flex: 1 },
});
