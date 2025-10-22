import { Card } from "@/components/ui/card"

interface PerformanceCardProps {
  title: string
  value: number
  unit: string
  icon: string
  color: string
  textColor: string
  prefix?: string
}

export default function PerformanceCard({
  title,
  value,
  unit,
  icon,
  color,
  textColor,
  prefix = "",
}: PerformanceCardProps) {
  return (
    <Card className={`${color} border-4 border-gray-400 p-6 md:p-8 text-center rounded-xl shadow-lg`}>
      <div className="text-6xl md:text-7xl mb-4 md:mb-6">{icon}</div>
      <p className="text-gray-700 text-xl md:text-2xl font-bold mb-3 md:mb-4">{title}</p>
      <p className={`text-5xl md:text-6xl font-black ${textColor} mb-3 md:mb-4`}>
        {prefix}
        {value.toLocaleString("en-IN")}
      </p>
      <p className="text-gray-600 text-lg md:text-xl font-semibold">{unit}</p>
    </Card>
  )
}
