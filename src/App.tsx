import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppInit } from '@/hooks/useAppInit'
import { useSettingsStore } from '@/state/settingsStore'
import { AppShell } from '@/components/layout/AppShell'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { FileManagerPage } from '@/pages/FileManagerPage'
import { TrashPage } from '@/pages/TrashPage'
import { SplashScreen } from '@/pages/SplashScreen'

const DocumentWorkspacePage = lazy(() => import('@/pages/DocumentWorkspacePage').then((m) => ({ default: m.DocumentWorkspacePage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))

function App() {
  const ready = useAppInit()
  const onboardingComplete = useSettingsStore((s) => s.settings.onboardingComplete)

  if (!ready) return <SplashScreen />
  if (!onboardingComplete) return <OnboardingPage />

  return (
    <Suspense fallback={<SplashScreen />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/documents" element={<FileManagerPage scope="all" />} />
          <Route path="/favorites" element={<FileManagerPage scope="favorites" />} />
          <Route path="/pinned" element={<FileManagerPage scope="pinned" />} />
          <Route path="/recent" element={<FileManagerPage scope="recent" />} />
          <Route path="/folder/:id" element={<FileManagerPage scope="folder" />} />
          <Route path="/trash" element={<TrashPage />} />
          <Route path="/document/:id" element={<DocumentWorkspacePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
