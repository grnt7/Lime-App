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
    backgroundColor: '#42E100',
    borderRadius: 24,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
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
    color: 'black',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});
