"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

const DISTRICTS = [
  "Ahmednagar",
  "Akola",
  "Amravati",
  "Aurangabad",
  "Beed",
  "Bhandara",
  "Buldhana",
  "Chandrapur",
  "Dhule",
  "Gadchiroli",
  "Gondia",
  "Hingoli",
  "Jalgaon",
  "Jalna",
  "Kolhapur",
  "Latur",
  "Mumbai",
  "Nagpur",
  "Nanded",
  "Nandurbar",
  "Nashik",
  "Osmanabd",
  "Parbhani",
  "Pune",
  "Raigad",
  "Ratnagiri",
  "Sangli",
  "Satara",
  "Sindhudurg",
  "Solapur",
  "Thane",
  "Wardha",
  "Washim",
  "Yavatmal",
]

interface DistrictSelectorProps {
  onSelect: (district: string) => void
}

export default function DistrictSelector({ onSelect }: DistrictSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredDistricts = DISTRICTS.filter((d) => d.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 md:px-8 py-5 md:py-6 bg-green-600 text-white text-2xl md:text-3xl font-black rounded-xl hover:bg-green-700 transition-colors border-2 border-green-700 shadow-lg"
      >
        इलाका चुनें
      </button>
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-3 z-50 max-h-96 overflow-y-auto border-4 border-green-600 rounded-xl shadow-xl">
          <div className="p-4 md:p-6 sticky top-0 bg-white border-b-4 border-green-300">
            <input
              type="text"
              placeholder="खोजें..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 md:px-6 py-3 md:py-4 text-xl md:text-2xl font-semibold border-3 border-green-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div className="p-4 md:p-6 space-y-2 md:space-y-3">
            {filteredDistricts.map((district) => (
              <button
                key={district}
                onClick={() => {
                  onSelect(district)
                  setIsOpen(false)
                  setSearch("")
                }}
                className="w-full text-left px-4 md:px-6 py-4 md:py-5 text-xl md:text-2xl font-bold text-gray-800 hover:bg-green-100 rounded-lg transition-colors border-2 border-transparent hover:border-green-400"
              >
                {district}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
