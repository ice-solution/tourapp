import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const STORAGE_KEY = 'tourapp.language'

const LanguageContext = createContext({
  language: 'zh',
  setLanguage: () => {},
  t: () => '',
})

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('zh')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang) => {
    setLanguageState(lang)
    window.localStorage.setItem(STORAGE_KEY, lang)
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)


