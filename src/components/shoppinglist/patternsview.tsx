import { TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';

import { useShoppingStore } from '~/store/shopping';
import type { PatternGrouped } from '~/types/shoppinglist';

import { patternsGroupByCategory, filterByKeyword } from './helpers';
import { PatternItemEl } from './patternitem';

export const PatternsView = () => {
	const [patternsGrouped, setPatternsGrouped] = useState<PatternGrouped[]>([]);
	const [inputValue, setInputValue] = useState('');

	const { patterns, categories } = useShoppingStore((state) => ({
		patterns: state.patterns,
		categories: state.categories,
	}));

	useEffect(() => {
		if (patterns.length > 0 && categories.length > 0) {
			setPatternsGrouped(
				patternsGroupByCategory(
					patterns.sort((a, b) => b.weight - a.weight),
					categories
				)
			);
		}
	}, [patterns, categories]);

	useEffect(() => {
		if (inputValue.length > 0) {
			setPatternsGrouped(
				patternsGroupByCategory(filterByKeyword(patterns, inputValue), categories)
			);
		} else {
			setPatternsGrouped(
				patternsGroupByCategory(
					patterns.sort((a, b) => b.weight - a.weight),
					categories
				)
			);
		}
	}, [inputValue, patterns, categories]);

	return (
		<>
			<div className="relative rounded-lg bg-white p-4 transition duration-200 ease-in-out dark:bg-[#1d1f20] ">
				<div className="flex items-center justify-between">
					<div className="flex w-full items-center justify-between text-base font-bold text-[#030910] dark:text-[#e0e2e4] md:text-xl">
						<span>Search for pattern item</span>
						<button
							className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white opacity-100 hover:bg-blue-800"
							onClick={() => useShoppingStore.setState({ patternsView: false })}
						>
							Back to shopping list
						</button>
					</div>
				</div>
				<hr className="my-2 mt-3 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
				<div className="relative flex justify-between gap-2">
					<div className="w-full flex-auto md:relative">
						<TextInput
							placeholder="Nazwa"
							className="mb-1 w-full"
							value={inputValue}
							onChange={(event) => {
								setInputValue(event.currentTarget.value);
							}}
							rightSection={
								inputValue.length > 0 && (
									<div
										className="cursor-pointer text-blue-700"
										onClick={() => setInputValue('')}
										onKeyDown={() => setInputValue('')}
										role="button"
										tabIndex={0}
									>
										X
									</div>
								)
							}
						/>
					</div>
				</div>
			</div>
			{patternsGrouped.length > 0 && (
				<div className="relative rounded-lg bg-white p-4 transition duration-200 ease-in-out dark:bg-[#1d1f20] ">
					<div className="flex items-center justify-between">
						<div className="flex w-full items-center justify-between text-lg font-bold text-[#030910] dark:text-[#e0e2e4] md:text-xl">
							<span>Zakupione:</span>
						</div>
					</div>
					<div className="flex flex-col">
						{patternsGrouped.length > 0 && (
							<div className="flex flex-col">
								{patternsGrouped.map((group) => (
									<div key={group.categoryId} className={`flex flex-col`}>
										<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
										<div className="flex items-center justify-between text-xs font-bold text-[#030910] dark:text-[#e0e2e4] md:text-sm">
											<span className="text-xs md:text-lg">
												{group.categoryName.charAt(0).toUpperCase() +
													group.categoryName.slice(1)}
											</span>
										</div>
										<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
										{group.items &&
											group.items.map((item) => (
												<PatternItemEl
													key={`${item.name}-shopping`}
													item={item}
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
