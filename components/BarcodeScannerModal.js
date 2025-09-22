import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export const BarcodeScannerModal = ({ visible, onClose, onBarcodeScanned }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Request camera permissions when the modal is first opened
  useEffect(() => {
    if (visible && !permission) {
      requestPermission();
    }
  }, [visible, permission, requestPermission]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    onBarcodeScanned(data); // Send the barcode data back to the MealLogScreen
  };

  // Reset the 'scanned' state when the modal is closed
  useEffect(() => {
    if (!visible) {
      setScanned(false);
    }
  }, [visible]);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={styles.permissionContainer}>
          <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
          <Button onPress={requestPermission} title="Grant Permission" />
          <Button onPress={onClose} title="Close" color="gray" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr"], // Common barcode types
          }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.closeButton}>
            <Button title="Close" onPress={onClose} color="white" />
        </View>
        {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  }
});