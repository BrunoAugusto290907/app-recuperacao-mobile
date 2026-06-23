import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';

export default function HistoricoScreen() {
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarHistorico = async () => {
    setLoading(true);
    try {
      // ATENÇÃO: Coloque o seu IP real aqui
      const response = await fetch('http://SEU_IP_AQUI:3000/historico');
      
      if (response.ok) {
        const data = await response.json();
        setHistorico(data.reverse()); 
      } else {
        Alert.alert("Erro", "Não foi possível carregar o histórico.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Conexão", "Servidor não encontrado. O backend está rodando?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarHistorico();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Escola: {item.escola.escola}</Text>
      <Text style={styles.cardText}>Salvo em: {item.dataHora}</Text>
      <Text style={styles.cardSubtitle}>Localização no momento do salvamento:</Text>
      <Text style={styles.cardText}>Lat: {item.localizacaoUsuario.latitude.toFixed(4)}</Text>
      <Text style={styles.cardText}>Lon: {item.localizacaoUsuario.longitude.toFixed(4)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Registros</Text>
      
      <TouchableOpacity style={styles.refreshButton} onPress={buscarHistorico}>
        <Text style={styles.refreshButtonText}>Atualizar Lista</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : historico.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum registro salvo ainda.</Text>
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  refreshButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 15 },
  refreshButtonText: { color: 'white', fontWeight: 'bold' },
  emptyText: { fontSize: 16, color: '#666', marginTop: 20 },
  list: { width: '100%', flex: 1 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#28a745', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  cardSubtitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 10 },
  cardText: { fontSize: 14, color: '#555' }
});