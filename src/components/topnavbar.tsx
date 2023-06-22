import { ItemTypeMenu } from './itemtypemenu';

const MobileNavbar = () => {
	return (
		<div className="fixed left-0 right-0 top-0 z-[48] flex items-center justify-center gap-1 bg-white p-4 shadow-main transition duration-200 dark:bg-[#1d1f20] md:hidden">
			<ItemTypeMenu />
		</div>
	);
};

export default MobileNavbar;
