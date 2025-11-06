import { Card, Button, Collapse, Table, Form, Row, Col } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import type { Device, DevicePlace } from '../App';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { PinPad } from './PinPad';
import { motion } from 'framer-motion';

type Props = {
	device: Device | null;
	onDeviceChange: (device: Device | null) => void;
};

export function PlayersPanel({ device, onDeviceChange }: Props) {
	const [open, setOpen] = useState<boolean>(true);
	const [pendingPlace, setPendingPlace] = useState<number | null>(null);

	const rows = useMemo(() => device?.places ?? [], [device]);

	const handleSubmit = async (place: DevicePlace, deltaMajorUnits: number) => {
		// Convert major units (e.g., 12.34) to minor units (e.g., cents) as integers
		const delta = Math.round(deltaMajorUnits * 100);
		setPendingPlace(place.place);
		try {
			const updated = await api.updateBalance(place.device_id, place.place, delta);
			// refresh active device
			const fresh = await api.getDevice(place.device_id);
			onDeviceChange(fresh);
			toast.success(`Balance updated: ${formatMoney(updated / 100, place.currency)}`);
		} catch (e: any) {
			toast.error(e?.message ?? 'Operation failed');
		} finally {
			setPendingPlace(null);
		}
	};

	return (
		<Card className="shadow-sm">
			<Card.Header className="d-flex justify-content-between align-items-center">
				<div>Players</div>
				<Button
					variant="outline-secondary"
					size="sm"
					onClick={() => setOpen((v) => !v)}
					aria-controls="players-collapse"
					aria-expanded={open}
				>
					{open ? 'Hide' : 'Show'}
				</Button>
			</Card.Header>
			<Collapse in={open}>
				<div id="players-collapse">
					{!device ? (
						<div className="p-3 text-muted">Select a device to view players.</div>
					) : (
						<div className="p-3">
							<Table hover responsive className="align-middle">
								<thead>
									<tr>
										<th style={{ minWidth: 120 }}>Player</th>
										<th>Balance</th>
										<th style={{ minWidth: 260 }}>Operation</th>
									</tr>
								</thead>
                                <tbody>
                                    {rows.map((p, idx) => (
                                        <PlayerRow
                                            key={p.place}
                                            place={p}
                                            idx={idx}
                                            disabled={pendingPlace === p.place}
                                            onSubmit={handleSubmit}
                                        />
                                    ))}
                                </tbody>
							</Table>
						</div>
					)}
				</div>
			</Collapse>
		</Card>
	);
}

function PlayerRow({ place, onSubmit, disabled, idx }: { place: DevicePlace; onSubmit: (place: DevicePlace, deltaMajorUnits: number) => void; disabled: boolean; idx: number; }) {
	const [amount, setAmount] = useState<string>('');
	const [error, setError] = useState<string | null>(null);

	const validate = (value: string) => {
		if (!value) return 'Enter amount';
		const n = Number(value);
		if (!Number.isFinite(n) || n <= 0) return 'Enter a positive number';
		// Financial note: we restrict to two decimals to match ledger precision
		// (minor currency units) and avoid floating-point rounding issues.
		if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) {
			return 'Max 2 decimal places';
		}
		return null;
	};

	const handleAction = (sign: 1 | -1) => {
		const v = amount.replace(',', '.');
		const msg = validate(v);
		setError(msg);
		if (msg) return;
		onSubmit(place, sign * parseFloat(v));
		setAmount('');
	};

    return (
        <motion.tr
            className="fade-in"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .25, delay: idx * 0.04 }}
        >
			<td className="fw-medium">Player #{place.place}</td>
			<td>{formatMoney(place.balances / 100, place.currency)}</td>
			<td>
				<Row className="g-2">
						<Col xs={12} md={6}>
						<Form.Control
							inputMode="decimal"
							placeholder="Amount"
							aria-label={`Amount for player ${place.place}`}
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							isInvalid={!!error}
						/>
						<Form.Control.Feedback type="invalid">{error ?? ''}</Form.Control.Feedback>
						</Col>
					<Col xs="auto" className="d-flex gap-2">
							<PinPad value={amount} onChange={setAmount} />
						<Button disabled={disabled} onClick={() => handleAction(1)}>Deposit</Button>
						<Button variant="outline-danger" disabled={disabled} onClick={() => handleAction(-1)}>Withdraw</Button>
					</Col>
				</Row>
			</td>
        </motion.tr>
	);
}

export function formatMoney(amountMajor: number, currency: string) {
	return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amountMajor);
}


