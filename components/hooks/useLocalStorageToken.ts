import { useEffect, useState } from "react"

function getStorageValue(key: string, defaultValue: string) {
  // getting stored value
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(key)
      const initial = saved !== null ? JSON.parse(saved) : defaultValue
      return initial
    } catch {
      return defaultValue
    }
  }
  return defaultValue
}

export const useLocalStorageToken = (key: string, defaultValue: string) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue)
  })

  useEffect(() => {
    // storing input name
    if (value) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }, [key, value])

  return [value, setValue]
}
