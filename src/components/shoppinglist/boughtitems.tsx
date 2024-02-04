import { useShoppingStore } from '~/store/shopping';

import { ShoppingItemEl } from './shoppingitem';

export const BoughtItems = ({ handleItemCheck }: { handleItemCheck: (id: number) => void }) => {
	const items = useShoppingStore((state) => state.finishedShoppingList);
	return (
		<>
			{items.length > 0 && (
				<div className="relative rounded-lg bg-white p-4 transition duration-200 ease-in-out dark:bg-[#1d1f20] ">
					<div className="flex items-center justify-between">
						<div className="flex w-full items-center justify-between text-lg font-bold text-[#030910] dark:text-[#e0e2e4] md:text-xl">
							<span>Zakupione:</span>
						</div>
					</div>
					<div className="flex flex-col">
						{items.length > 0 && (
							<div className="flex flex-col">
								{items.map((group) => (
									<div key={group.categoryId} className={`flex flex-col`}>
										<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
										<div className="flex items-center justify-between text-xs font-bold text-[#030910] dark:text-[#e0e2e4] md:text-sm">
											<span className="text-xs md:text-lg">
												{group.categoryName.charAt(0).toUpperCase() +
													group.categoryName.slice(1)}
											</span>
											<span>
												{group.priceForItems.toFixed(2).replace('.', ',')}{' '}
												zł
											</span>
										</div>
										<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
										{group.items &&
											group.items.map((item) => (
												<ShoppingItemEl
													key={`${item.name}shopping`}
													item={item}
													onItemCheck={() => handleItemCheck(item.id)}
													done={true}
												/>
											))}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};
