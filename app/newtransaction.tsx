import { createRecord, deleteRecord, updateRecord } from '@/db/handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View
} from "react-native";
import { Button, Dialog, Portal } from 'react-native-paper';
import Snackbar from './components/Snackbar';

export default function NewTransaction() {
    const params = useLocalSearchParams();
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(""); 
    const [mode, setMode] = useState("new"); // "new" or "edit"

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const router = useRouter();

    if (params.date && params.description && params.amount && mode === "new") {
        setDate(new Date(params.date as string));
        setDescription(params.description as string);
        setAmount(params.amount as string);
        setMode("edit");
    }

    const enter = () => {
        if (mode === "edit") {
            updateRecord({
                id: parseInt(params.id as string),
                date: date.toISOString().split('T')[0],
                description,
                amount: parseFloat(amount),
                bookId: params.bookId as string
            });
        } else {
            createRecord({
                date: date.toISOString().split('T')[0],
                description,
                amount: parseFloat(amount),
                bookId: params.bookId as string
            });
        }
        router.back();
    };

    const handleDeleteConfirm = async () => {
        if (!params.id) return;
        setDialogVisible(false);
        try {
          await deleteRecord(params.id as string);
          if (Platform.OS === 'android') {
            ToastAndroid.show('Record deleted', ToastAndroid.SHORT);
          } else {
            setSnackbarMessage('Record deleted');
            setSnackbarVisible(true);
          }
          router.back();
        } catch (e) {
          console.warn('Failed to delete record', e);
          setSnackbarMessage('Could not delete the record.');
          setSnackbarVisible(true);
        }
      };

    const discard = () => {
        if (mode === "edit") {
            setDialogVisible(true);
        } else {
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Stack.Screen
                    options={{
                        title: 'New Transaction'
                    }}
                />

                <Text style={styles.title}>New Transaction</Text>
                <Text style={styles.instruction}>
                    Here you enter details of the new transaction.
                </Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Date</Text>
                    {Platform.OS === 'ios'  && (
                        <DateTimePicker
                            value={date || new Date()}
                            mode="date"
                            display='default'
                            onChange={(event, selectedDate) => {
                                const current = selectedDate || date;
                                setShowPicker(Platform.OS === 'ios');
                                setDate(current);
                            }}
                        />
                    )}
                    {Platform.OS !== 'ios' && (
                        <>
                        <TouchableOpacity
                            onPress={() => setShowPicker(true)}
                            style={styles.input}
                        >
                            <Text>{date ? date.toLocaleDateString() : 'Select date'}</Text>
                        </TouchableOpacity>
                        {showPicker && (
                            <DateTimePicker
                                value={date || new Date()}
                                mode="date"
                                display='default'
                                onChange={(event, selectedDate) => {
                                    const current = selectedDate || date;
                                    setShowPicker(Platform.OS === 'ios');
                                    setDate(current);
                                }}
                            />
                        )}
                        </>
                    )}
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Description"
                        style={styles.input}
                        returnKeyType="done"
                    />
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Amount</Text>
                    <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        style={styles.input}
                        keyboardType="decimal-pad"
                    />
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.button} onPress={enter}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={discard}>
                        <Text style={styles.buttonText}>{ (mode === "edit") ? 'Remove' : 'Cancel' }</Text>
                    </TouchableOpacity>
                </View>
                <Snackbar message={snackbarMessage} visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} />
            </View>

            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Title>Delete Record</Dialog.Title>
                    <Dialog.Content>
                        <Text>Are you sure you want to delete this record? This cannot be undone.</Text>
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
        justifyContent: "flex-start",
        alignItems: "stretch",
    },
    content: {
        flex: 1,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 12,
    },
    title: {
        fontSize: 25,
        color: "#2d7d30",
        marginBottom: 4,
    },
    instruction: {
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    label: {
        width: 80,
        textAlign: "right",
        marginRight: 10,
    },
    smallInput: {
        width: 50,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 4,
        marginRight: 8,
    },
    mediumInput: {
        width: 90,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 4,
    },
    input: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 4,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 8,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: "#2d7d30",
        borderRadius: 4,
        marginRight: 12,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
});
