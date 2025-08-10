import { forwardRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

type ButtonProps = {
  title?: string;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(({ title, ...touchableProps }, ref) => {
  return (
    <TouchableOpacity ref={ref} {...touchableProps} style={[styles.button, {backgroundColor: touchableProps.disabled ? "gray" : "#42E100"}, touchableProps.style]}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  ); 
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#38C400',
    borderRadius: 25,
    width: '100%',
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#040000ff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});