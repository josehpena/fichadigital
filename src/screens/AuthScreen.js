import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');

    if (!email.trim() || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        Alert.alert(
          'Conta criada!',
          'Verifique seu email para confirmar a conta, ou faca login diretamente se a confirmacao estiver desativada.',
        );
      }
    } catch (err) {
      const msg = err.message || 'Erro desconhecido';
      if (msg.includes('Invalid login')) {
        setError('Email ou senha incorretos.');
      } else if (msg.includes('already registered')) {
        setError('Este email ja esta cadastrado.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.logo}>Ficha Digital</Text>
        <Text style={s.subtitle}>
          {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
        </Text>

        {!!error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        <Text style={s.label}>Email</Text>
        <TextInput
          style={s.input}
          placeholder="seu@email.com"
          placeholderTextColor="#6c7086"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={s.label}>Senha</Text>
        <TextInput
          style={s.input}
          placeholder="********"
          placeholderTextColor="#6c7086"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {!isLogin && (
          <>
            <Text style={s.label}>Confirmar Senha</Text>
            <TextInput
              style={s.input}
              placeholder="********"
              placeholderTextColor="#6c7086"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </>
        )}

        <TouchableOpacity
          style={[s.btn, loading && s.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#1e1e2e" />
          ) : (
            <Text style={s.btnText}>
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={s.toggleBtn}
          onPress={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
        >
          <Text style={s.toggleText}>
            {isLogin
              ? 'Nao tem conta? Cadastre-se'
              : 'Ja tem conta? Faca login'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11111b',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#cdd6f4',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c7086',
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    color: '#a6adc8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#1e1e2e',
    borderWidth: 1,
    borderColor: '#313244',
    borderRadius: 12,
    color: '#cdd6f4',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#89b4fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#1e1e2e',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#89b4fa',
    fontSize: 14,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#f38ba822',
    borderWidth: 1,
    borderColor: '#f38ba8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#f38ba8',
    fontSize: 13,
    textAlign: 'center',
  },
});
