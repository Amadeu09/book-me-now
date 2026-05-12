// app/index.tsx
import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from 'react-native';

export default function Index() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('token');
        console.log('Index: Token leído de AsyncStorage:', t ? 'EXISTE' : 'NULL');
        setToken(t);
        setIsReady(true);
      } catch (error) {
        console.error('Index: Error leyendo token:', error);
        setToken(null);
        setIsReady(true);
      }
    })();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const destination = token ? '/profile' : '/login';
  console.log('Index: Redirigiendo a:', destination);
  
  return <Redirect href={destination} />;
}
