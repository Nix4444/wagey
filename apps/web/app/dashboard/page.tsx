import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../../lib/auth"
import { EventCard } from "../components/EventCard"
import axios from "axios"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/")
  }

  const eventsData = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/events`)
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Browse and trade on prediction markets
        </p>
      </div>

      {eventsData.data.events.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No events available</h2>
          <p className="text-muted-foreground">
            Check back later for new prediction markets to trade on.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {eventsData.data.events.map((event: any) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}