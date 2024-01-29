import { useEffect, useRef, useState } from 'react';

export const DialogWindow = ({
	isOpen,
	onClose,
	hasCloseButton,
	header,
	children,
}: {
	isOpen: boolean;
	onClose?: () => void;
	hasCloseButton?: boolean;
	header?: React.ReactNode;
	children: React.ReactNode;
}): JSX.Element => {
	const [isModalOpen, setIsModalOpen] = useState(isOpen);
	const modalRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setIsModalOpen(isOpen);
	}, [isOpen]);

	useEffect(() => {
		const modalElement = modalRef.current;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				handleCloseModal();
			}
		};
		if (modalElement) {
			if (isModalOpen) {
				document.body.addEventListener('keydown', handleKeyDown);
				document.body.style.overflow = 'hidden'; // Disable scrolling when modal is open
			} else {
				document.body.removeEventListener('keydown', handleKeyDown);
				document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
			}
		}

		return () => {
			document.body.removeEventListener('keydown', handleKeyDown);
		};
	}, [isModalOpen]);

	const handleCloseModal = () => {
		if (onClose) {
			onClose();
		}
		setIsModalOpen(false);
	};

	return (
		<div
			ref={modalRef}
			className={`customDialog fixed inset-0 z-50 flex items-center justify-center ${
				isModalOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
			}`}
		>
			<div
				className="modal-overlay fixed inset-0 z-10 bg-black opacity-50"
				onClick={handleCloseModal}
				role="none"
				onKeyDown={(e) => {
					console.log(e.key);
				}}
			/>
			<div className="modal-content z-20 w-full max-w-md rounded-sm bg-white p-6 shadow-lg dark:bg-[#101213]">
				<header className="mb-2 flex justify-between">
					{header && <div className="modal-header">{header}</div>}
					{hasCloseButton && (
						<button
							className="modal-close-btn rounded-sm bg-gray-200 p-2 font-bold hover:bg-gray-300"
							onClick={handleCloseModal}
						>
							X
						</button>
					)}
				</header>
				{children}
			</div>
		</div>
	);
};
