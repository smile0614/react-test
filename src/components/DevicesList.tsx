import { Card, ListGroup, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import type { Device } from '../App';

type Props = {
	devices: Device[];
	onOpenDevice: (deviceId: number) => void;
};

export function DevicesList({ devices, onOpenDevice }: Props) {
	return (
		<Card className="shadow-sm devices-list">
			<Card.Header>Devices</Card.Header>
			<ListGroup variant="flush">
				<AnimatePresence initial={false}>
					{devices.map((d) => (
						<motion.li
							key={d.id}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: .25 }}
							className="list-group-item d-flex justify-content-between align-items-center"
						>
						<div>
							<div className="fw-semibold device-title">{d.name}</div>
							<small className="device-meta">#{d.id} • {new Date(d.created_at).toLocaleString()}</small>
						</div>
							<Button size="sm" className="pulse" onClick={() => onOpenDevice(d.id)}>Open</Button>
						</motion.li>
					))}
				</AnimatePresence>
			</ListGroup>
		</Card>
	);
}


