import { useEffect, useState } from 'react';
import { getDefaultLocalDateTime } from '../utils/date';

export function useLiveLocalDateTime() {
  const [value, setValueState] = useState(getDefaultLocalDateTime);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isDirty) {
      return;
    }

    const timer = window.setInterval(() => {
      setValueState(getDefaultLocalDateTime());
    }, 15000);

    return () => window.clearInterval(timer);
  }, [isDirty]);

  function setValue(nextValue: string) {
    setIsDirty(true);
    setValueState(nextValue);
  }

  function resetValue() {
    setIsDirty(false);
    setValueState(getDefaultLocalDateTime());
  }

  return {
    value,
    setValue,
    resetValue
  };
}
