import { createContext, useContext, useState, useEffect } from 'react'

const UIContext = createContext()

export const UIProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('syncspace_theme') || 'dark')
  const [compact, setCompact] = useState(() => localStorage.getItem('syncspace_compact') === 'true')

  useEffect(() => {
    try { localStorage.setItem('syncspace_theme', theme) } catch (e) {}
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('syncspace_compact', compact) } catch (e) {}
  }, [compact])

  return (
    <UIContext.Provider value={{ theme, setTheme, compact, setCompact }}>
      {children}
    </UIContext.Provider>
  )
}

export const useUI = () => useContext(UIContext)

export default UIContext
