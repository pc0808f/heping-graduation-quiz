import ErrorPage from "@razzia/web/components/ErrorPage"
import NotFound from "@razzia/web/components/NotFound"
import {
  SocketProvider,
  useSocket,
} from "@razzia/web/features/game/contexts/socket-context"
import { THEME_TITLES, useGameThemeStore } from "@razzia/web/hooks/useTheme"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { useEffect } from "react"

const GameLayout = () => {
  const { isConnected, connect } = useSocket()
  const theme = useGameThemeStore((s) => s.theme)

  useEffect(() => {
    if (!isConnected) {
      connect()
    }
  }, [connect, isConnected])

  useEffect(() => {
    document.body.classList.add("bg-secondary")
    document.title = THEME_TITLES[theme] ?? "Razzia"

    return () => {
      document.body.classList.remove("bg-secondary")
    }
  }, [theme])

  return (
    <div className="bg-secondary antialiased">
      <Outlet />
    </div>
  )
}

export const Route = createRootRoute({
  component: () => (
    <SocketProvider>
      <GameLayout />
    </SocketProvider>
  ),
  errorComponent: ({ error }) => (
    <div className="bg-secondary antialiased">
      <ErrorPage error={error} />
    </div>
  ),
  notFoundComponent: () => (
    <div className="bg-secondary antialiased">
      <NotFound />
    </div>
  ),
})
