import EventInfo from "EventInfo/EventDetails.tsx"
import EventChat from "EventChat/EventChat.tsx"

function EventSidebar({ event }) {
    return (
        <aside className="w-96 h-screen flex flex-col border-l">

            <div className="h-[30%]">
                <EventInfo event={event} />
            </div>

            <div className="h-[70%]">
                <EventChat eventId={event.id} />
            </div>

        </aside>
    );
}