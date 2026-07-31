import { MapContainer, TileLayer, Marker} from "react-leaflet";
import { LatLngBounds } from "leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import MySidebar from "../Sidebar/Sidebar"


const idfBounds = new LatLngBounds(
  [48.65, 1.95],
  [49.05, 2.75],
);

function MyTileLayer()
{
	return (
		<TileLayer
			attribution='&copy; <a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			url="https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=4WuRvsSGNfmiSQizbI3DVZxUqDNOgTXjHvNMXONKplADuRzTbn7p0x5wlenNak14"
		/>
	);
}

function MyMap()
{
	const [showSidebar, setShowSidebar] = useState(false);
	console.log(showSidebar);

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
		<Marker 
		position={[48.8566, 2.3522]}
		eventHandlers= {{
			click: () => {
				setShowSidebar(true);
			}
		}}
		/>
	</MapContainer>
	{showSidebar && (
		<MySidebar />
	)}
	</>
	);
}

export default MyMap;