import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import { useState } from "react";
import "../Sidebar/Chat/Chat.tsx"
import "leaflet/dist/leaflet.css";
import "../Sidebar/sidebar.css";
import MyButton from "../Sidebar/Chat/Chat.tsx";
import MyChat from "../Sidebar/Chat/Chat.tsx";

const idfBounds = new LatLngBounds(
  [48.65, 1.95],
  [49.05, 2.75],
);

type Event = {
	title: string;
	description: string;
};

function MyTileLayer()
{
	return (
		<TileLayer
			attribution='&copy; <a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			url="https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=4WuRvsSGNfmiSQizbI3DVZxUqDNOgTXjHvNMXONKplADuRzTbn7p0x5wlenNak14"
		/>
	);
}


/* function MyPopup()
{
	return (
		<Popup>
		A pretty CSS3 popup. <br />
		Easily customizable.
		</Popup>
	);
} */

/* function MyMarker()
{
	return (
		<Marker 
		position={[48.8566, 2.3522]}
		eventHandlers= {{
			click: () => {
				setSelectedEvent({
					title: "Concert à Paris",
					description: "Le concert commence à 20h."
				});
			}
		}}
		>
		</Marker>
	);
} */

function MyMap()
{
	const [selectedEvent, setSelectedEvent] = useState<Event | null >(null);

	return (
	<>
		<MapContainer
		center={[48.8566, 2.3522]}
		zoom={12}
		minZoom={12}
		scrollWheelZoom={true}
		maxBounds={idfBounds}
		maxBoundsViscosity={1.0}
		style={{ height: "100vh", width: "100vw" }}
		>
		<MyTileLayer />
		{/* <MyMarker /> */}
		<Marker 
		position={[48.8566, 2.3522]}
		eventHandlers= {{
			click: () => {
				console.log("Clique !");
				console.log(selectedEvent);
				setSelectedEvent({
					title: "Concert à Paris",
					description: "Le concert commence à 20h."
				});
			}
		}}
		/>

	</MapContainer>
	{selectedEvent && (
		<div className="sidebar">
			<h2>{selectedEvent.title}</h2>
			 <p>{selectedEvent.description}</p>
			<MyButton />
			<MyChat />
		</div>
		)}
	</>
	);
}

export default MyMap;