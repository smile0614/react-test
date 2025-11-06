import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { DevicesList } from './components/DevicesList';
import { PlayersPanel } from './components/PlayersPanel';
import { api } from './services/api';
import { ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';

export type Device = {
	id: number;
	name: string;
	created_at: string;
	updated_at?: string;
	places: DevicePlace[];
};

export type DevicePlace = {
	device_id: number;
	place: number;
	currency: string;
	balances: number; // stored in minor units (e.g., cents)
};

export default function App() {
	const [devices, setDevices] = useState<Device[] | null>(null);
	const [activeDevice, setActiveDevice] = useState<Device | null>(null);

	useEffect(() => {
		api.getDevices().then(setDevices);
	}, []);

	return (
		<Container fluid className="py-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
			<Row className="mb-3">
				<Col>
					<h1 className="h3 m-0 app-title">Device and Player Management</h1>
				</Col>
				<Col xs="auto">
					<TimeBadge />
				</Col>
			</Row>

			<Row>
				<Col lg={4} className="mb-4">
					{!devices ? (
						<div className="d-flex align-items-center gap-2">
							<Spinner size="sm" /> Loading devices...
						</div>
					) : (
						<motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
							<DevicesList
							devices={devices}
							onOpenDevice={async (id) => {
								const d = await api.getDevice(id);
								setActiveDevice(d);
							}}
						/>
						</motion.div>
					)}
				</Col>
				<Col lg={8}>
					<motion.div key={activeDevice?.id ?? 'none'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
						<PlayersPanel device={activeDevice} onDeviceChange={setActiveDevice} />
					</motion.div>
				</Col>
			</Row>

			<ToastContainer position="top-right" newestOnTop closeOnClick />
		</Container>
	);
}

function TimeBadge() {
	const [time, setTime] = useState<string>('');
	useEffect(() => {
		let isMounted = true;
		api.getTime().then((t) => isMounted && setTime(t));
		const id = setInterval(async () => {
			const t = await api.getTime();
			setTime(t);
		}, 30_000);
		return () => {
			isMounted = false;
			clearInterval(id);
		};
	}, []);
	return <span className="badge text-bg-light">Server time: {time || '...'}</span>;
}


