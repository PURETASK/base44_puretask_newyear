import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { handleError } from '@/lib/errorHandler';

/**
 * Hook for fetching a list of entities with caching
 * 
 * @param {string} entityName - Name of the Base44 entity
 * @param {Object} filter - Filter object for query
 * @param {Object} options - Additional options
 * @returns {Object} Query result with data, loading, error
 */
export function useEntityList(entityName, filter = {}, options = {}) {
  const {
    enabled = true,
    refetchInterval = false,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    onError = null
  } = options;

  return useQuery({
    queryKey: [entityName, 'list', filter],
    queryFn: async () => {
      try {
        const hasFilter = Object.keys(filter).length > 0;
        const data = hasFilter 
          ? await base44.entities[entityName].filter(filter)
          : await base44.entities[entityName].list();
        return data;
      } catch (error) {
        if (onError) {
          onError(error);
        } else {
          handleError(error, {
            userMessage: `Failed to load ${entityName}`,
            context: { entity: entityName, filter }
          });
        }
        throw error;
      }
    },
    enabled,
    refetchInterval,
    staleTime: cacheTime,
    cacheTime
  });
}

/**
 * Hook for fetching a single entity by ID
 * 
 * @param {string} entityName - Name of the Base44 entity
 * @param {string} id - Entity ID
 * @param {Object} options - Additional options
 * @returns {Object} Query result
 */
export function useEntity(entityName, id, options = {}) {
  const {
    enabled = true,
    onError = null
  } = options;

  return useQuery({
    queryKey: [entityName, id],
    queryFn: async () => {
      try {
        const data = await base44.entities[entityName].get(id);
        return data;
      } catch (error) {
        if (onError) {
          onError(error);
        } else {
          handleError(error, {
            userMessage: `Failed to load ${entityName}`,
            context: { entity: entityName, id }
          });
        }
        throw error;
      }
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook for creating an entity
 * 
 * @param {string} entityName - Name of the Base44 entity
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useCreateEntity(entityName, options = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess = null,
    onError = null,
    invalidateQueries = true
  } = options;

  return useMutation({
    mutationFn: async (data) => {
      try {
        const result = await base44.entities[entityName].create(data);
        return result;
      } catch (error) {
        handleError(error, {
          userMessage: `Failed to create ${entityName}`,
          context: { entity: entityName, data }
        });
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: [entityName] });
      }
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError
  });
}

/**
 * Hook for updating an entity
 * 
 * @param {string} entityName - Name of the Base44 entity
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useUpdateEntity(entityName, options = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess = null,
    onError = null,
    invalidateQueries = true
  } = options;

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const result = await base44.entities[entityName].update(id, data);
        return result;
      } catch (error) {
        handleError(error, {
          userMessage: `Failed to update ${entityName}`,
          context: { entity: entityName, id, data }
        });
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: [entityName] });
        if (variables.id) {
          queryClient.invalidateQueries({ queryKey: [entityName, variables.id] });
        }
      }
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError
  });
}

/**
 * Hook for deleting an entity
 * 
 * @param {string} entityName - Name of the Base44 entity
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useDeleteEntity(entityName, options = {}) {
  const queryClient = useQueryClient();
  const {
    onSuccess = null,
    onError = null,
    invalidateQueries = true
  } = options;

  return useMutation({
    mutationFn: async (id) => {
      try {
        const result = await base44.entities[entityName].delete(id);
        return result;
      } catch (error) {
        handleError(error, {
          userMessage: `Failed to delete ${entityName}`,
          context: { entity: entityName, id }
        });
        throw error;
      }
    },
    onSuccess: (data, id) => {
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: [entityName] });
      }
      if (onSuccess) {
        onSuccess(data, id);
      }
    },
    onError
  });
}

/**
 * Hook for calling a Base44 function
 * 
 * @param {string} functionName - Name of the Base44 function
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useFunction(functionName, options = {}) {
  const {
    onSuccess = null,
    onError = null
  } = options;

  return useMutation({
    mutationFn: async (params) => {
      try {
        const result = await base44.functions[functionName](params);
        return result;
      } catch (error) {
        handleError(error, {
          userMessage: `Operation failed`,
          context: { function: functionName, params }
        });
        throw error;
      }
    },
    onSuccess,
    onError
  });
}

/**
 * Hook for loading user profile (client or cleaner)
 * 
 * @param {string} userType - 'client' or 'cleaner'
 * @param {string} email - User email
 * @returns {Object} Query result
 */
export function useUserProfile(userType, email) {
  const entityName = userType === 'cleaner' ? 'CleanerProfile' : 'ClientProfile';
  
  return useQuery({
    queryKey: ['profile', userType, email],
    queryFn: async () => {
      try {
        const profiles = await base44.entities[entityName].filter({
          user_email: email
        });
        return profiles[0] || null;
      } catch (error) {
        handleError(error, {
          userMessage: 'Failed to load profile',
          context: { userType, email }
        });
        throw error;
      }
    },
    enabled: !!email,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  });
}

/**
 * Hook for loading bookings with various filters
 * 
 * @param {Object} filter - Filter object
 * @param {Object} options - Additional options
 * @returns {Object} Query result
 */
export function useBookings(filter = {}, options = {}) {
  return useEntityList('Booking', filter, {
    ...options,
    cacheTime: 2 * 60 * 1000 // 2 minutes for bookings (more real-time)
  });
}

/**
 * Hook for loading messages
 * 
 * @param {Object} filter - Filter object
 * @returns {Object} Query result
 */
export function useMessages(filter = {}) {
  return useEntityList('Message', filter, {
    refetchInterval: 30000, // Refetch every 30 seconds
    cacheTime: 1 * 60 * 1000 // 1 minute cache
  });
}

/**
 * Hook for loading notifications
 * 
 * @param {string} userEmail - User email
 * @returns {Object} Query result
 */
export function useNotifications(userEmail) {
  return useEntityList('Notification', { 
    user_email: userEmail,
    is_read: false 
  }, {
    refetchInterval: 30000, // Refetch every 30 seconds
    cacheTime: 1 * 60 * 1000
  });
}

/**
 * Hook with loading state and data fetching
 * Simple wrapper for common async operations
 * 
 * @param {Function} asyncFn - Async function to execute
 * @param {Array} dependencies - Dependencies array
 * @returns {Object} { data, loading, error, refetch }
 */
export function useAsyncData(asyncFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
    } catch (err) {
      setError(err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

