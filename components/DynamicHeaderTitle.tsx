"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/teacher": "Teacher",
  "/course": "Course",
  "/projects": "Projects",
  "/team": "Team",
}

export function DynamicHeaderTitle() {
  const pathname = usePathname()

  const title = useMemo(() => {
    return pageTitles[pathname] ?? "Documents"
  }, [pathname])

  return <h1 className="text-base font-medium">{title}</h1>
}
