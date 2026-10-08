import { useState, useEffect, useRef, useCallback } from 'react';

export interface IndianTimeState {
  timeDisplay: string;
  datePart: string;
  timePart: string;
  loading: boolean;
  error: string | null;
  syncedWithApi: boolean;
  refresh: () => void;
  rawDate: Date | null;
}

const IST_TIMEZONE = 'Asia/Kolkata';

export const formatIndianDateTime = (dateObj: Date): string => {
  return dateObj.toLocaleString('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export const useIndianTime = (): IndianTimeState => {
  const [timeDisplay, setTimeDisplay] = useState<string>('Loading...');
  const [datePart, setDatePart] = useState<string>('');
  const [timePart, setTimePart] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syncedWithApi, setSyncedWithApi] = useState<boolean>(false);
  const [rawDate, setRawDate] = useState<Date | null>(null);

  // Store the millisecond difference between server time and local Date.now()
  const clockOffsetRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const updateFromCurrentTime = useCallback(() => {
    try {
      const now = new Date(Date.now() + clockOffsetRef.current);
      setRawDate(now);
      const formatted = formatIndianDateTime(now);
      setTimeDisplay(formatted);

      // Split into date and time parts if format contains comma
      const parts = formatted.split(', ');
      if (parts.length >= 2) {
        setDatePart(parts[0]);
        setTimePart(parts[1]);
      } else {
        setDatePart(formatted);
        setTimePart('');
      }
    } catch (err) {
      console.error('Error formatting Indian time:', err);
    }
  }, []);

  const fetchIndianTime = useCallback(() => {
    setLoading(true);
    setError(null);

    fetch('https://worldtimeapi.org/api/timezone/Asia/Kolkata')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!isMountedRef.current) return;
        const dateObj = new Date(data.datetime);
        clockOffsetRef.current = dateObj.getTime() - Date.now();
        
        const formatted = dateObj.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        setTimeDisplay(formatted);
        const parts = formatted.split(', ');
        if (parts.length >= 2) {
          setDatePart(parts[0]);
          setTimePart(parts[1]);
        }
        setRawDate(dateObj);
        setSyncedWithApi(true);
        setLoading(false);
      })
      .catch(err => {
        console.error('WorldTimeAPI fetch error:', err);
        if (!isMountedRef.current) return;

        // Graceful fallback to browser's clock formatted in Asia/Kolkata
        try {
          const fallbackDate = new Date();
          clockOffsetRef.current = 0;
          const formatted = fallbackDate.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          setTimeDisplay(formatted);
          const parts = formatted.split(', ');
          if (parts.length >= 2) {
            setDatePart(parts[0]);
            setTimePart(parts[1]);
          }
          setRawDate(fallbackDate);
          setError('Offline / Local IST fallback');
        } catch {
          setTimeDisplay('Error loading time');
          setError('Error loading time');
        }
        setSyncedWithApi(false);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchIndianTime();

    // Re-sync with worldtimeapi every 5 minutes to prevent clock drift
    const syncInterval = setInterval(() => {
      fetchIndianTime();
    }, 5 * 60 * 1000);

    // Tick every 1 second to update the displayed seconds
    const tickInterval = setInterval(() => {
      updateFromCurrentTime();
    }, 1000);

    return () => {
      isMountedRef.current = false;
      clearInterval(syncInterval);
      clearInterval(tickInterval);
    };
  }, [fetchIndianTime, updateFromCurrentTime]);

  return {
    timeDisplay,
    datePart,
    timePart,
    loading,
    error,
    syncedWithApi,
    refresh: fetchIndianTime,
    rawDate
  };
};
