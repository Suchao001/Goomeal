# API Client Documentation

## Overview

The `ApiClient` is a centralized HTTP client that handles authentication, token refresh, and error handling automatically for the GoodMeal app. It provides a clean interface for making API calls without having to worry about token management.

## Features

- **Automatic Token Management**: Includes access token in all requests
- **Token Refresh**: Automatically refreshes expired tokens using refresh token
- **Error Handling**: Provides user-friendly error messages
- **Request/Response Interceptors**: Handles authentication seamlessly
- **Retry Logic**: Retries failed requests after token refresh

## Usage

### Basic Usage

```typescript
import { apiClient, handleApiError } from '../utils/apiClient';

// GET request
try {
  const response = await apiClient.get('/user/profile');
  console.log(response.data);
} catch (error) {
  const errorInfo = handleApiError(error);
  Alert.alert(errorInfo.title, errorInfo.message);
}

// POST request
try {
  const response = await apiClient.post('/user/update', {
    name: 'John Doe',
    age: 25
  });
  console.log(response.data);
} catch (error) {
  const errorInfo = handleApiError(error);
  Alert.alert(errorInfo.title, errorInfo.message);
}

// PUT request
try {
  const response = await apiClient.put('/user/update-personal-data', {
    height: 180,
    weight: 75,
    age: 25,
    gender: 'male'
  });
  console.log(response.data);
} catch (error) {
  const errorInfo = handleApiError(error);
  Alert.alert(errorInfo.title, errorInfo.message);
}
```

### Error Handling

The `handleApiError` function provides consistent error handling:

```typescript
import { handleApiError } from '../utils/apiClient';

try {
  const response = await apiClient.get('/some/endpoint');
  // Handle success
} catch (error) {
  const errorInfo = handleApiError(error);
  
  Alert.alert(
    errorInfo.title,
    errorInfo.message,
    [
      { 
        text: 'OK', 
        onPress: () => {
          if (errorInfo.shouldLogout) {
            // User needs to login again
            apiClient.logout();
            navigation.navigate('Login');
          }
        }
      }
    ]
  );
}
```

### Authentication Check

```typescript
// Check if user is authenticated
const isAuth = await apiClient.isAuthenticated();
if (!isAuth) {
  // Redirect to login
  navigation.navigate('Login');
}
```

### Manual Logout

```typescript
// Clear all tokens and logout
await apiClient.logout();
```

## Token Refresh Flow

1. **Request Made**: ApiClient automatically includes access token
2. **Token Check**: Before each request, checks if token expires within 30 seconds
3. **Auto Refresh**: If token is about to expire, automatically refreshes it
4. **401 Handling**: If request returns 401, tries to refresh token and retry
5. **Failure Handling**: If refresh fails, clears all tokens

## Error Types

The `handleApiError` function handles these scenarios:

- **401 Unauthorized**: Session expired, user needs to login
- **403 Forbidden**: User doesn't have permission
- **500+ Server Error**: Server-side issue
- **Network Error**: Connection problems
- **Other Errors**: Generic error handling

## Example: Complete API Integration

```typescript
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { apiClient, handleApiError } from '../utils/apiClient';

const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/my/endpoint');
      
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      Alert.alert(errorInfo.title, errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (newData) => {
    try {
      setLoading(true);
      const response = await apiClient.put('/my/endpoint', newData);
      
      if (response.data.success) {
        Alert.alert('Success', 'Data updated successfully');
        fetchData(); // Refresh data
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      Alert.alert(errorInfo.title, errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Component JSX...
};
```

## Benefits

1. **Consistent Error Handling**: All API calls have the same error handling pattern
2. **Automatic Authentication**: No need to manually manage tokens in each component
3. **Better UX**: Users don't see 401 errors, tokens are refreshed transparently
4. **Centralized Logic**: All API logic is in one place, easy to maintain
5. **Type Safety**: Full TypeScript support with proper error types

## Migration from Direct Axios

**Before (Manual Token Management):**
```typescript
const token = await SecureStore.getItemAsync('accessToken');
const response = await axios.get(`${base_url}/endpoint`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**After (Using ApiClient):**
```typescript
const response = await apiClient.get('/endpoint');
```

The ApiClient handles all the token management automatically!
