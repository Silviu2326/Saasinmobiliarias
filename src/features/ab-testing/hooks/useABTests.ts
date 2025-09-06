import { useState, useEffect } from 'react';
import { ABTest, abTestingService } from '../services/abTestingService';

export interface UseABTestsReturn {
  tests: ABTest[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTest: (testData: Omit<ABTest, 'id' | 'createdAt'>) => Promise<void>;
  updateTest: (id: string, updates: Partial<ABTest>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  startTest: (id: string) => Promise<void>;
  pauseTest: (id: string) => Promise<void>;
  completeTest: (id: string) => Promise<void>;
}

export const useABTests = (): UseABTestsReturn => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await abTestingService.getTests();
      setTests(data);
    } catch (err) {
      setError('Error al cargar los tests A/B');
      console.error('Error loading AB tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTest = async (testData: Omit<ABTest, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newTest = await abTestingService.createTest(testData);
      setTests(prev => [newTest, ...prev]);
    } catch (err) {
      setError('Error al crear el test');
      throw err;
    }
  };

  const updateTest = async (id: string, updates: Partial<ABTest>) => {
    try {
      setError(null);
      const updatedTest = await abTestingService.updateTest(id, updates);
      if (updatedTest) {
        setTests(prev => prev.map(test => 
          test.id === id ? updatedTest : test
        ));
      }
    } catch (err) {
      setError('Error al actualizar el test');
      throw err;
    }
  };

  const deleteTest = async (id: string) => {
    try {
      setError(null);
      const success = await abTestingService.deleteTest(id);
      if (success) {
        setTests(prev => prev.filter(test => test.id !== id));
      }
    } catch (err) {
      setError('Error al eliminar el test');
      throw err;
    }
  };

  const startTest = async (id: string) => {
    try {
      setError(null);
      const updatedTest = await abTestingService.startTest(id);
      if (updatedTest) {
        setTests(prev => prev.map(test => 
          test.id === id ? updatedTest : test
        ));
      }
    } catch (err) {
      setError('Error al iniciar el test');
      throw err;
    }
  };

  const pauseTest = async (id: string) => {
    try {
      setError(null);
      const updatedTest = await abTestingService.pauseTest(id);
      if (updatedTest) {
        setTests(prev => prev.map(test => 
          test.id === id ? updatedTest : test
        ));
      }
    } catch (err) {
      setError('Error al pausar el test');
      throw err;
    }
  };

  const completeTest = async (id: string) => {
    try {
      setError(null);
      const updatedTest = await abTestingService.completeTest(id);
      if (updatedTest) {
        setTests(prev => prev.map(test => 
          test.id === id ? updatedTest : test
        ));
      }
    } catch (err) {
      setError('Error al finalizar el test');
      throw err;
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    tests,
    loading,
    error,
    refresh,
    createTest,
    updateTest,
    deleteTest,
    startTest,
    pauseTest,
    completeTest
  };
};