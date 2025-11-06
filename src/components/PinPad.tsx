import { Button, Modal } from 'react-bootstrap';
import { useState } from 'react';

type Props = {
	value: string;
	onChange: (next: string) => void;
};

export function PinPad({ value, onChange }: Props) {
	const [open, setOpen] = useState(false);

	const press = (ch: string) => onChange(sanitize(value + ch));
	const del = () => onChange(value.slice(0, -1));

	return (
		<>
			<Button size="sm" variant="outline-secondary" onClick={() => setOpen(true)}>Keypad</Button>
			<Modal show={open} onHide={() => setOpen(false)} centered>
				<Modal.Header closeButton><Modal.Title>Enter amount</Modal.Title></Modal.Header>
				<Modal.Body>
					<div className="text-center fs-4 mb-3">{value || '0'}</div>
					<div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)', display: 'grid' }}>
						{['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((k) => (
							<Button key={k} onClick={() => (k === '⌫' ? del() : press(k === '.' ? '.' : k))}>{k}</Button>
						))}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => setOpen(false)}>Done</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}

function sanitize(input: string) {
	// allow only digits and one dot, max 2 decimal places
	const m = input.match(/^\d*(?:\.\d{0,2})?/);
	return m ? m[0] : '';
}


