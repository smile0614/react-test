import type { Device, DevicePlace } from '../App';

// In lieu of a real backend, we simulate the Swagger endpoints with
// local state and delays. Balances are stored as integers in minor
// currency units to avoid floating-point rounding errors.

type Db = {
	devices: Device[];
};

const db: Db = {
	devices: [
		{
			id: 1,
			name: 'Arcade A',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			places: [
				{ device_id: 1, place: 1, currency: 'USD', balances: 12500 },
				{ device_id: 1, place: 2, currency: 'USD', balances: 5000 },
			],
		},
		{
			id: 2,
			name: 'Arcade B',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			places: [
				{ device_id: 2, place: 1, currency: 'EUR', balances: 3000 },
				{ device_id: 2, place: 2, currency: 'EUR', balances: 7650 },
				{ device_id: 2, place: 3, currency: 'EUR', balances: 0 },
			],
		},
	],
};

function delay(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

async function simulate<T>(fn: () => T): Promise<T> {
	await delay(300 + Math.random() * 350);
	return fn();
}

export const api = {
	async getDevices(): Promise<Device[]> {
		return simulate(() => db.devices.map((d) => ({ ...d, places: d.places.map((p) => ({ ...p })) })));
	},

	async getDevice(id: number): Promise<Device> {
		return simulate(() => {
			const d = db.devices.find((x) => x.id === id);
			if (!d) throw new Error('Device not found');
			return { ...d, places: d.places.map((p) => ({ ...p })) };
		});
	},

	async updateBalance(deviceId: number, placeId: number, deltaMinor: number): Promise<number> {
		// POST /a/devices/{device_id}/place/{place_id}/update
		return simulate(() => {
			if (!Number.isInteger(deltaMinor)) {
				const err = new Error('Incorrect amount');
				(err as any).code = 'INCORRECT_AMOUNT';
				throw err;
			}
			const device = db.devices.find((d) => d.id === deviceId);
			if (!device) throw new Error('Device not found');
			const place = device.places.find((p) => p.place === placeId);
			if (!place) throw new Error('Place not found');
			const next = place.balances + deltaMinor;
			if (next < 0) {
				const err = new Error('Insufficient funds');
				(err as any).code = 'INSUFFICIENT_FUNDS';
				throw err;
			}
			place.balances = next;
			return place.balances;
		});
	},

	async getTime(): Promise<string> {
		// GET /time
		return simulate(() => new Date().toLocaleString());
	},
};

export type { Device, DevicePlace };


