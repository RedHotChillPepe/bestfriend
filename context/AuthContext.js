// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        console.log('Checking stored user...');
        const storedUser = await SecureStore.getItemAsync('user');
        if (storedUser) {
          console.log('User found in SecureStore:', storedUser);
          setUser(JSON.parse(storedUser));
        } else {
          console.log('No user found in SecureStore');
        }
      } catch (error) {
        console.error('Error retrieving user from SecureStore', error);
      }
    };

    checkStoredUser();
  }, []);

  const login = async (userData) => {
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error storing user in SecureStore', error);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      setUser(null);
    } catch (error) {
      console.error('Error removing user from SecureStore', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);