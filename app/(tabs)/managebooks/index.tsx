import { AccountRow, deleteAccount, getAllAccounts, initDb } from '@/db/handler';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link, Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import Snackbar from '../../components/Snackbar';

export default function ManageBooks() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        await initDb();
        const rows = await getAllAccounts();
        if (!cancelled) setAccounts(rows);
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const [selectedAccount, setSelectedAccount] = useState<AccountRow | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);

  const modify = () => {
    if (!selectedAccount) return;
    router.push({
      pathname: '/newbook',
      params: selectedAccount,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAccount) return;
    setDialogVisible(false);
    try {
      await deleteAccount(selectedAccount.id.toString());
      const rows = await getAllAccounts();
      setAccounts(rows);
      setSelectedAccount(null);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Book deleted', ToastAndroid.SHORT);
      } else {
        setSnackbarMessage('Book deleted');
        setSnackbarVisible(true);
      }
    } catch (e) {
      console.warn('Failed to delete account', e);
      setSnackbarMessage('Could not delete the book.');
      setSnackbarVisible(true);
    }
  };

  const end = () => {
    if (!selectedAccount) return;
    setDialogVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack.Screen
          options={{
            title: 'Manage Books',
            headerRight: () => (
              <Link href="/newbook" asChild>
                <Pressable>
                  <MaterialCommunityIcons name="book-plus" size={28} color="#3957ce" />
                </Pressable>
              </Link>
            )
          }}
        />
        <Text style={styles.title}>Manage Books</Text>
        <Text style={styles.subtitle}>Here is the list of account books that you have</Text>

        <ScrollView style={styles.scrollView}>
          <View style={styles.booksContainer}>
            {accounts.map((book) => (
              <Pressable
                key={book.id}
                style={[styles.bookItem, selectedAccount?.id === book.id && styles.bookItemSelected]}
                onPress={() => setSelectedAccount(book)}
              >
                <Text style={styles.bookName}>{book.name}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, !selectedAccount && styles.buttonDisabled]}
            onPress={modify}
            disabled={!selectedAccount}
          >
            <Text style={styles.buttonText}>Update Book</Text>
          </Pressable>

          <Pressable
            style={[styles.button, !selectedAccount && styles.buttonDisabled]}
            onPress={end}
            disabled={!selectedAccount}
          >
            <Text style={styles.buttonText}>Delete Book</Text>
          </Pressable>
        </View>
        <Snackbar message={snackbarMessage} visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} />
      </View>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Delete Book</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete {selectedAccount?.name}? This cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteConfirm} textColor="#d32f2f">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    color: '#3957ce',
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
  booksContainer: {
    flexDirection: 'column',
  },
  bookItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  bookItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  bookName: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#3957ce',
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

