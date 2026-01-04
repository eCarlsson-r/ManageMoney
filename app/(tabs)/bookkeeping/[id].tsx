import { getAllRecords, initDb, RecordRow } from '@/db/handler';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Bookkeeping() {
  const { id } = useLocalSearchParams();

  const [records, setRecords] = useState<RecordRow[]>([]);
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        await initDb();
        const rows = await getAllRecords(id as string);
        if (!cancelled) setRecords(rows);
      })();
      return () => {
        cancelled = true;
      };
    }, [id]),
  );

  const balance = React.useMemo(() => records.reduce((sum, t) => sum + t.amount, 0), [records]);

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Bookkeeping',
            headerRight: () => (
              <Link href={{ pathname: '/newtransaction', params: { bookId: id } }} asChild>
                <Pressable>
                  <MaterialCommunityIcons name="plus-circle" size={28} color="#2d7d30" />
                </Pressable>
              </Link>
            ),
          }}
        />

        <Text style={styles.title}>Account Summary</Text>
        <Text style={styles.subtitle}>Here are the records of this account.</Text>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell, styles.dateCol]}>Date</Text>
            <Text style={[styles.cell, styles.headerCell, styles.descCol]}>Description</Text>
            <Text style={[styles.cell, styles.headerCell, styles.amountCol]}>Amount</Text>
          </View>

          {records.map((t) => (
            <Link
              key={t.id}
              href={{ pathname: '/newtransaction', params: t }}
              style={[styles.row, styles.dataRow]}
              asChild
            >
              <Pressable>
                <Text style={[styles.cell, styles.dateCol]}>{t.date}</Text>
                <Text style={[styles.cell, styles.descCol]} numberOfLines={1}>
                  {t.description}
                </Text>
                <Text style={[styles.cell, styles.amountCol]}>{t.amount.toFixed(2)}</Text>
              </Pressable>
            </Link>
          ))}
        </ScrollView>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <TextInput
            value={balance.toFixed(2)}
            editable={false}
            selectTextOnFocus={false}
            style={styles.balanceInput}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    color: '#2d7d30',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#111',
  },
  scroll: {
    marginTop: 10,
    flex: 1,
  },
  table: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  dateCol: {
    flexBasis: 100,
    flexGrow: 0,
    flexShrink: 0,
  },
  descCol: {
    flex: 1,
  },
  amountCol: {
    flexBasis: 100,
    flexGrow: 0,
    flexShrink: 0,
    textAlign: 'right',
  },
  headerRow: {
    backgroundColor: '#2d7d30',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  headerCell: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dataRow: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
  },
  balanceLabel: {
    color: '#111',
  },
  balanceInput: {
    minWidth: 120,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    color: '#111',
    textAlign: 'right',
  },
});
