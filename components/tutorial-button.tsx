"use client"

import { HelpCircle } from "lucide-react"
import { useOnboarding } from "./onboarding-provider"

export default function TutorialButton() {
  const { showOnboarding } = useOnboarding()

  return (
    <button
      onClick={showOnboarding}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
    >
      <HelpCircle className="w-5 h-5" />
      Ver Tutorial
    </button>
  )
}
