import { getAllAccounts, getRecentRecords, getRecordCount, getRecordSum, initDb } from '@/db/handler';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link, Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, BackHandler, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';

type AccountSummary = {
  id: number;
  name: string;
  currency: string;
  recordCount: number;
  balance: number;
};

export default function Dashboard() {
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [recent, setRecent] = useState<Awaited<ReturnType<typeof getRecentRecords>>>([]);
  const [totalRecordCount, setTotalRecordCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        await initDb();

        const [allAccounts, recentRecords, overallCount] = await Promise.all([
          getAllAccounts(),
          getRecentRecords(5),
          getRecordCount(),
        ]);

        const accountSummaries = await Promise.all(
          allAccounts.map(async (a) => {
            const [recordCount, balance] = await Promise.all([getRecordCount(a.id), getRecordSum(a.id)]);
            return { ...a, recordCount, balance };
          }),
        );

        if (cancelled) return;
        setAccounts(accountSummaries);
        setRecent(recentRecords);
        setTotalRecordCount(overallCount);
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const exitApp = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
      return;
    }
    Alert.alert(
      'Exit',
      'iOS does not allow apps to exit programmatically. Press Home/Swipe up to close the app.',
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'ControlMoney',
        headerRight: () => (
          <Pressable onPress={exitApp} hitSlop={10}>
            <MaterialCommunityIcons name="exit-to-app" size={24} color="#d32f2f" />
          </Pressable>
        )
      }} />
      <Image src='../../assets/banner.png'></Image>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Title
            title="Quick Actions"
            left={(props) => <MaterialCommunityIcons {...props} name="flash" size={24} />}
          />
          <Card.Content style={styles.quickActions}>
            <Button mode="contained" buttonColor="#2d7d30" onPress={() => router.navigate('/bookkeeping')}>
              Bookkeeping
            </Button>
            <Button mode="contained" buttonColor="#3957ce" onPress={() => router.navigate('/managebooks')}>
              Manage Books
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Recent Activity"
            subtitle={totalRecordCount ? `Total records: ${totalRecordCount}` : undefined}
            left={(props) => <MaterialCommunityIcons {...props} name="history" size={24} />}
          />
          <Card.Content>
            {recent.length === 0 ? (
              <Text style={styles.muted}>No transactions yet.</Text>
            ) : (
              <View style={styles.list}>
                {recent.map((r) => (
                  <Link
                    key={`${r.bookId}-${r.id}`}
                    href={{
                      pathname: '/newtransaction',
                      params: {
                        ...r,
                        amount: String(r.amount),
                        description: r.description ?? '',
                      },
                    }}
                    style={styles.recentRow}
                    asChild
                  >
                    <Pressable>
                      <View style={styles.recentRowTop}>
                        <Text style={styles.recentTitle} numberOfLines={1}>
                          {r.description || 'No description'}
                        </Text>
                        <Text style={styles.recentAmount}>
                          {r.amount.toFixed(2)} {r.currency}
                        </Text>
                      </View>
                      <Text style={styles.muted} numberOfLines={1}>
                        {r.date} • {r.accountName}
                      </Text>
                    </Pressable>
                  </Link>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Books"
            left={(props) => <MaterialCommunityIcons {...props} name="bookshelf" size={24} />}
          />
          <Card.Content>
            {accounts.length === 0 ? (
              <Text style={styles.muted}>No books yet. Create one in “Manage Books”.</Text>
            ) : (
              <View style={styles.list}>
                {accounts.map((a) => (
                  <Link
                    key={a.id}
                    href={{ pathname: '/bookkeeping/[id]', params: { id: String(a.id) } }}
                    style={styles.bookRow}
                    asChild
                  >
                    <Pressable>
                      <View style={styles.bookRowTop}>
                        <Text style={styles.bookName} numberOfLines={1}>
                          {a.name}
                        </Text>
                        <Text style={styles.bookBalance}>
                          {a.balance.toFixed(2)} {a.currency}
                        </Text>
                      </View>
                      <Text style={styles.muted}>{a.recordCount} records</Text>
                    </Pressable>
                  </Link>
                ))}
              </View>
            )}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.navigate('/newbook')}>New Book</Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    overflow: 'hidden',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  list: {
    gap: 10,
  },
  recentRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  recentRowTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  recentAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  bookRowTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  bookBalance: {
    fontSize: 14,
    fontWeight: '600',
  },
  muted: {
    opacity: 0.7,
  },
});

