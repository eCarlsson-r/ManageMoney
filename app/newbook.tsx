import { createAccount, updateAccount } from '@/db/handler';
import { Picker } from '@react-native-picker/picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function NewBook() {
  const [bookId, setBookId] = useState("");
  const [bookName, setBookName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState("new"); // "new" or "edit"
  const router = useRouter();
  const params = useLocalSearchParams();

  if (params.name && params.currency && mode === "new") {
    setBookId(params.id as string);
    setBookName(params.name as string);
    setCurrency(params.currency as string);
    setMode("edit");
  }

  const submit = () => {
    if (mode === "edit") {
      updateAccount({
        id: parseInt(bookId),
        name: bookName,
        currency: currency,
      });
    } else {
      createAccount({
        name: bookName,
        currency: currency,
      });
    }

    router.back();
  };

  const cancel = () => {
    setBookId("");
    setBookName("");
    setCurrency("USD");
    console.log("Cancelled");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack.Screen
          options={{
            title: 'New Book'
          }}
        />
        <Text style={styles.title}>New Book</Text>
        <Text style={styles.desc}>Here you enter the details of new book.</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Book Name</Text>
          <TextInput
            value={bookName}
            onChangeText={setBookName}
            placeholder="Enter book name"
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Book Currency</Text>
          {Platform.OS === 'android' ? (
            <Picker
              selectedValue={currency}
              onValueChange={(itemValue) => setCurrency(itemValue)}
              mode="dropdown"
              style={styles.picker}
            >
              <Picker.Item label="IDR - Indonesian Rupiah" value="IDR" />
              <Picker.Item label="USD - US Dollar" value="USD" />
              <Picker.Item label="SGD - Singapore Dollar" value="SGD" />
              <Picker.Item label="AUD - Australian Dollar" value="AUD" />
              <Picker.Item label="EUR - Euro" value="EUR" />
              <Picker.Item label="VND - Vietnamese Dong" value="VND" />
              <Picker.Item label="CNY - Chinese Yuan" value="CNY" />
              <Picker.Item label="JPY - Japanese Yen" value="JPY" />
            </Picker>
          ) : (
            <TouchableOpacity style={[styles.input, styles.currencyButton]} onPress={() => setShowPicker(true)}>
              <Text>{currency}</Text>
            </TouchableOpacity>
          )}
        </View>

        {Platform.OS === 'ios' && (
          <Modal
            visible={showPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowPicker(false)}
          >
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.pickerDoneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={currency}
                onValueChange={(itemValue) => setCurrency(itemValue)}
                mode="dialog"
                style={styles.pickerModal}
              >
                <Picker.Item label="IDR - Indonesian Rupiah" value="IDR" />
                <Picker.Item label="USD - US Dollar" value="USD" />
                <Picker.Item label="SGD - Singapore Dollar" value="SGD" />
                <Picker.Item label="AUD - Australian Dollar" value="AUD" />
                <Picker.Item label="EUR - Euro" value="EUR" />
                <Picker.Item label="VND - Vietnamese Dong" value="VND" />
                <Picker.Item label="CNY - Chinese Yuan" value="CNY" />
                <Picker.Item label="JPY - Japanese Yen" value="JPY" />
              </Picker>
            </View>
          </Modal>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={submit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={cancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    color: "#3957ce",
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  label: {
    width: 100,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'flex-end',
  },
  pickerDoneButton: {
    color: '#3957ce',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerModal: {
    backgroundColor: '#fff',
  },
  currencyButton: {
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#3957ce",
    borderRadius: 4,
    marginRight: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
