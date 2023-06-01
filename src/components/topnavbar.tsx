const MobileNavbar = ({ setTaskAuthor }: { setTaskAuthor: (display: string) => void }) => {
	return (
		<div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-1 bg-[#1d1f20] p-4 shadow-main md:hidden">
			<button
				className="basis-1/2 rounded-lg border-2 border-[#2b3031] bg-[#17181c] p-2 text-sm text-white hover:bg-blue-500"
				onClick={() => setTaskAuthor('all')}
			>
				All
			</button>
			<button
				className="basis-1/2 rounded-lg border-2 border-[#2b3031] bg-[#17181c] p-2 text-sm text-white hover:bg-blue-500"
				onClick={() => setTaskAuthor('mine')}
			>
				Mine
			</button>
		</div>
	);
};

export default MobileNavbar;
