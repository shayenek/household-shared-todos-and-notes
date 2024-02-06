import { useShoppingStore } from '~/store/shopping';

import { ItemEl } from './item';

export const ItemsListEl = ({
	handleItemDeletion,
	handleItemCheck,
	handleQuantityChange,
}: {
	handleItemDeletion: (id: number) => void;
	handleItemCheck: (id: number) => void;
	handleQuantityChange: (id: number, quantity: number) => void;
}) => {
	const items = useShoppingStore((state) => state.itemsGrouped);
	const clicksOnListBlocked = useShoppingStore((state) => state.clicksOnListBlocked);
	return (
		<>
			{items.length > 0 && (
				<div className="relative rounded-lg bg-white p-4 transition duration-200 ease-in-out dark:bg-[#1d1f20] ">
					<div className="flex flex-col">
						{items.map((group) => (
							<div
								key={group.categoryId}
								className={`flex flex-col ${
									clicksOnListBlocked ? 'pointer-events-none' : ''
								}`}
							>
								<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
								<div className="flex items-center justify-between text-xs font-bold text-[#030910] dark:text-[#e0e2e4] md:text-sm">
									<span className="text-xs md:text-lg">
										{group.categoryName.charAt(0).toUpperCase() +
											group.categoryName.slice(1)}
									</span>
									<span>
										{group.priceForItems.toFixed(2).replace('.', ',')} zł
									</span>
								</div>
								<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
								{group.items &&
									group.items.map((item) => (
										<ItemEl
											key={`${item.name}shopping`}
											item={item}
											onItemDeletion={() => handleItemDeletion(item.id)}
											onItemCheck={() => handleItemCheck(item.id)}
											onQuantityChange={handleQuantityChange}
											done={false}
										/>
									))}
							</div>
						))}
					</div>
					<hr className="my-2 mt-3 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]" />
				</div>
			)}
		</>
	);
};
