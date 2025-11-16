// src/components/PaymentModal.tsx
const PaymentModal = ({ amount, onSuccess, onFailure }) => {
  const [provider, setProvider] = useState<'mtn' | 'airtel'>('mtn');
  
  const handlePayment = async () => {
    try {
      const result = await mobileMoneyService.initiatePayment(
        provider, phoneNumber, amount
      );
      onSuccess(result);
    } catch (error) {
      onFailure(error);
    }
  };
  
  return (
    <View>
      <Text>Select Provider:</Text>
      <Button title="MTN Mobile Money" onPress={() => setProvider('mtn')} />
      <Button title="Airtel Money" onPress={() => setProvider('airtel')} />
      <Button title={`Pay ${amount} via ${provider}`} onPress={handlePayment} />
    </View>
  );
};