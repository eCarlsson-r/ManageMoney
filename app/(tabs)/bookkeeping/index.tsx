import { AccountRow, getAllAccounts, initDb } from '@/db/handler';
import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SelectBook() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initDb();
      const rows = await getAllAccounts();
      if (!cancelled) setAccounts(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack.Screen options={{ title: 'Account Selection' }} />

        <Text style={styles.title}>Account Selection</Text>
        <Text style={styles.subtitle}>Which book are you going to interact with?</Text>

        <ScrollView style={styles.scrollView}>
          <View style={styles.listView}>
            {accounts.map((item) => (
              <Link
                key={item.id}
                href={{ pathname: '/bookkeeping/[id]', params: { id: String(item.id) } }}
                style={styles.accountItem}
                asChild
              >
                <Pressable>
                  <Text style={styles.accountName}>{item.name}</Text>
                  <View style={styles.currencyContainer}>
                    <Text>Currency: </Text>
                    <Text>{item.currency}</Text>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  content: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    color: '#2d7d30',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  listView: {
    flex: 1,
  },
  accountItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
  },
  currencyContainer: {
    flexDirection: 'row',
  },
});

