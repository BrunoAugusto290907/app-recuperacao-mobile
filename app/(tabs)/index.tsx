import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import * as Location from 'expo-location';

export default function HomeScreen() {
  // Tipagens adicionadas para o TypeScript não reclamar
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [escolas, setEscolas] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada.');
        setLoading(false);
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      try {
        const response = await fetch('https://dados.recife.pe.gov.br/api/3/action/datastore_search?resource_id=e1850a6a-f1b5-4419-874d-bdc5f1291840&limit=10');
        const data = await response.json();
        setEscolas(data.result.records);
      } catch (error) {
        console.error("Erro ao buscar API:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Tipagem 'any' adicionada no parâmetro
  const salvarNoHistorico = async (escolaSelecionada: any) => {
    if (!location) {
      Alert.alert("Aviso", "Aguarde sua localização ser carregada.");
      return;
    }

    try {
      // ATENÇÃO: Coloque o seu IP real aqui
      const response = await fetch('http://SEU_IP_AQUI:3000/salvar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localizacaoUsuario: location,
          escola: escolaSelecionada
        })
      });

      if (response.ok) {
        Alert.alert("Sucesso!", "Escola e sua localização foram salvas no backend.");
      } else if (response.status === 400) {
        Alert.alert("Aviso", "Você já salvou esta escola no seu histórico.");
      } else {
        Alert.alert("Erro", "Não foi possível salvar.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Conexão", "Não achou o servidor. Verifique se o IP está correto e se o backend está rodando.");
    }
  };

  // Tipagem '{ item: any }' adicionada
  const renderEscola = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.escola}</Text>
      <Text style={styles.cardText}>Alunos: {item.qtd_alunos}</Text>
      <Text style={styles.cardText}>Bairro: {item.bairro}</Text>
      
      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={() => salvarNoHistorico(item)}
      >
        <Text style={styles.saveButtonText}>Salvar no Histórico</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Educação - Recife</Text>
      
      <View style={styles.locationBox}>
        <Text style={styles.sectionTitle}>Sua Localização:</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : location ? (
          <Text style={styles.text}>Lat: {location.latitude.toFixed(4)} | Lon: {location.longitude.toFixed(4)}</Text>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Escolas Municipais Encontradas:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={escolas}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderEscola}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Link href="/explore" style={styles.button}>
        <Text style={styles.buttonText}>Ver Histórico Salvo</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  locationBox: { backgroundColor: '#fff', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, alignSelf: 'flex-start' },
  text: { fontSize: 14, color: '#333' },
  errorText: { color: 'red' },
  list: { width: '100%', flex: 1 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  cardText: { fontSize: 14, color: '#555', marginBottom: 10 },
  saveButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});