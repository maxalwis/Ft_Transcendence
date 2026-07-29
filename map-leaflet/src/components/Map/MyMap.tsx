import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";


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


function MyPopup()
{
	return (
		<Popup>
		A pretty CSS3 popup. <br />
		Easily customizable.
		</Popup>
	);
}

function MyMarker()
{
	return (
		<Marker position={[48.8566, 2.3522]}>
			< MyPopup />
		</Marker>
	);
}

function MyMap()
{
	return (
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
		<MyMarker />
	</MapContainer>
	);
}

export default MyMap;