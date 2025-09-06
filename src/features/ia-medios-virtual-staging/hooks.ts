import { useState, useEffect, useCallback } from 'react';
import { virtualStagingApi } from './apis';
import type { RoomType, CreateStageJobRequest, JobStatus, Style, Item, StageJob, Credits } from './types';

interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
}

interface MutationState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
}

export const useStylesQuery = () => {
  const [state, setState] = useState<QueryState<Style[]>>({
    data: undefined,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const fetchStyles = async () => {
      try {
        const data = await virtualStagingApi.getStyles();
        if (mounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: undefined, loading: false, error: error instanceof Error ? error.message : 'Error loading styles' });
        }
      }
    };

    fetchStyles();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
};

export const useItemsQuery = (roomType: RoomType) => {
  const [state, setState] = useState<QueryState<Item[]>>({
    data: undefined,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (!roomType) {
      setState({ data: undefined, loading: false, error: null });
      return;
    }

    let mounted = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    const fetchItems = async () => {
      try {
        const data = await virtualStagingApi.getItems(roomType);
        if (mounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: undefined, loading: false, error: error instanceof Error ? error.message : 'Error loading items' });
        }
      }
    };

    fetchItems();

    return () => {
      mounted = false;
    };
  }, [roomType]);

  return state;
};

export const useCreateStageJob = () => {
  const [state, setState] = useState<MutationState<StageJob>>({
    data: undefined,
    loading: false,
    error: null
  });

  const mutate = useCallback(async (data: CreateStageJobRequest) => {
    setState({ data: undefined, loading: true, error: null });
    
    try {
      const result = await virtualStagingApi.createStageJob(data);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating stage job';
      setState({ data: undefined, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, mutate };
};

export const useJobsQuery = (status?: JobStatus) => {
  const [state, setState] = useState<QueryState<StageJob[]>>({
    data: undefined,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchJobs = async () => {
      try {
        const data = await virtualStagingApi.getJobs(status);
        if (mounted) {
          setState({ data, loading: false, error: null });
          
          // Set up polling if there are processing jobs
          const hasProcessingJobs = data.some(job => 
            job.status === 'queued' || job.status === 'processing'
          );
          
          if (hasProcessingJobs) {
            intervalId = setTimeout(fetchJobs, 3000);
          }
        }
      } catch (error) {
        if (mounted) {
          setState({ data: undefined, loading: false, error: error instanceof Error ? error.message : 'Error loading jobs' });
        }
      }
    };

    fetchJobs();

    return () => {
      mounted = false;
      if (intervalId) {
        clearTimeout(intervalId);
      }
    };
  }, [status]);

  return state;
};

export const useJobQuery = (jobId: string) => {
  const [state, setState] = useState<QueryState<StageJob>>({
    data: undefined,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (!jobId) {
      setState({ data: undefined, loading: false, error: null });
      return;
    }

    let mounted = true;
    let intervalId: NodeJS.Timeout;
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    const fetchJob = async () => {
      try {
        const data = await virtualStagingApi.getJob(jobId);
        if (mounted) {
          setState({ data, loading: false, error: null });
          
          // Continue polling if job is still processing
          if (data.status === 'queued' || data.status === 'processing') {
            intervalId = setTimeout(fetchJob, 2000);
          }
        }
      } catch (error) {
        if (mounted) {
          setState({ data: undefined, loading: false, error: error instanceof Error ? error.message : 'Error loading job' });
        }
      }
    };

    fetchJob();

    return () => {
      mounted = false;
      if (intervalId) {
        clearTimeout(intervalId);
      }
    };
  }, [jobId]);

  return state;
};

export const useJobPoll = (jobId: string) => {
  return useJobQuery(jobId); // Same implementation as useJobQuery
};

export const useCancelJob = () => {
  const [state, setState] = useState<MutationState<void>>({
    data: undefined,
    loading: false,
    error: null
  });

  const mutate = useCallback(async (jobId: string) => {
    setState({ data: undefined, loading: true, error: null });
    
    try {
      await virtualStagingApi.cancelJob(jobId);
      setState({ data: undefined, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error canceling job';
      setState({ data: undefined, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, mutate };
};

export const useCreditsQuery = () => {
  const [state, setState] = useState<QueryState<Credits>>({
    data: undefined,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const fetchCredits = async () => {
      try {
        const data = await virtualStagingApi.getCredits();
        if (mounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: undefined, loading: false, error: error instanceof Error ? error.message : 'Error loading credits' });
        }
      }
    };

    fetchCredits();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
};

export const useRoomTypeDetection = () => {
  const [state, setState] = useState<MutationState<RoomType>>({
    data: undefined,
    loading: false,
    error: null
  });

  const mutate = useCallback(async (input: File | string) => {
    setState({ data: undefined, loading: true, error: null });
    
    try {
      const result = await virtualStagingApi.detectRoomType(input);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error detecting room type';
      setState({ data: undefined, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, mutate };
};