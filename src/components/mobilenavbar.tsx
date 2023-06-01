import { signOut } from 'next-auth/react';

const MobileNavbar = ({ addNewButton }: { addNewButton: () => void }) => {
	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-1 bg-gray-200 p-1 shadow-main md:hidden">
			<button
				onClick={addNewButton}
				className="h-14 w-full rounded-sm bg-green-700 py-4 text-white hover:bg-green-800 md:hidden"
			>
				Add new
			</button>
			<button
				className="h-14 rounded-sm bg-red-500 p-4 font-semibold text-white no-underline transition hover:bg-red-800 md:absolute md:right-4"
				onClick={() => void signOut()}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
					className="w-5 fill-white"
				>
					<path d="M96 480h64C177.7 480 192 465.7 192 448S177.7 416 160 416H96c-17.67 0-32-14.33-32-32V128c0-17.67 14.33-32 32-32h64C177.7 96 192 81.67 192 64S177.7 32 160 32H96C42.98 32 0 74.98 0 128v256C0 437 42.98 480 96 480zM504.8 238.5l-144.1-136c-6.975-6.578-17.2-8.375-26-4.594c-8.803 3.797-14.51 12.47-14.51 22.05l-.0918 72l-128-.001c-17.69 0-32.02 14.33-32.02 32v64c0 17.67 14.34 32 32.02 32l128 .001l.0918 71.1c0 9.578 5.707 18.25 14.51 22.05c8.803 3.781 19.03 1.984 26-4.594l144.1-136C514.4 264.4 514.4 247.6 504.8 238.5z" />
				</svg>
			</button>
		</div>
	);
};

export default MobileNavbar;
