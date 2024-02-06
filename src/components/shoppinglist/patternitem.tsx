import { TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { type Pattern } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
import { set } from 'zod';

import { useShoppingStore } from '~/store/shopping';
import { api } from '~/utils/api';

export const PatternItemEl = ({
	item,
	shouldBeFocused,
}: {
	item: Pattern;
	shouldBeFocused: boolean;
}) => {
	const deleteItem = api.pattern.deleteItem.useMutation();
	const updateWeight = api.pattern.setItemWeight.useMutation();
	const updatePrice = api.pattern.setItemPrice.useMutation();
	const [itemWeight, setItemWeight] = useState(item.weight);
	const [itemPrice, setItemPrice] = useState(item.price.toString());

	const handleChangeWeight = (type: 'add' | 'subtract') => {
		const newWeight = type === 'add' ? itemWeight + 1 : itemWeight - 1;
		setItemWeight((prev) => prev + (type === 'add' ? 1 : -1));
		updateWeight.mutate({ id: item.id, weight: newWeight });
		useShoppingStore.setState({
			patterns: useShoppingStore.getState().patterns.map((pattern) => {
				if (pattern.id === item.id) {
					return { ...pattern, weight: newWeight };
				}
				return pattern;
			}),
		});
	};

	const handleDeleteItem = () => {
		modals.openConfirmModal({
			title: `Do you really wanna delete: ${item.name}?`,
			styles: {
				content: {
					background: '#1d1f20',
					borderWidth: '2px',
					borderColor: '#2b3031',
				},
				body: {
					color: '#fff',
					background: '#1d1f20',
				},
				header: {
					color: '#fff',
					background: '#1d1f20',
				},
				close: {
					background: '#17181c',
					borderWidth: '2px',
					borderColor: '#2b3031',
				},
			},
			centered: true,
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onConfirm: () => {
				useShoppingStore.setState({
					patterns: useShoppingStore
						.getState()
						.patterns.filter((pattern) => pattern.id !== item.id),
				});
				deleteItem.mutate({ id: item.id });
			},
		});
	};

	const handleNewPrice = (newPrice: string) => {
		const newPriceParsed = parseFloat(newPrice.replace(',', '.'));
		if (newPriceParsed === item.price) return;
		updatePrice.mutate({ id: item.id, price: newPriceParsed });
		useShoppingStore.setState({
			patterns: useShoppingStore.getState().patterns.map((pattern) => {
				if (pattern.id === item.id) {
					return { ...pattern, price: newPriceParsed };
				}
				return pattern;
			}),
		});
	};

	const priceInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (shouldBeFocused) {
			priceInputRef.current?.focus();
		}
	}, [shouldBeFocused]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key === 'Enter' &&
				item.price !== parseFloat(itemPrice) &&
				priceInputRef.current === document.activeElement
			) {
				handleNewPrice(itemPrice);
				useShoppingStore.setState({ currentPatternPriceInputId: item.id });
			}
		};

		const handleSubmit = () => {
			if (
				item.price !== parseFloat(itemPrice) &&
				priceInputRef.current === document.activeElement
			) {
				handleNewPrice(itemPrice);
				useShoppingStore.setState({ currentPatternPriceInputId: item.id });
			}
		};

		document.body.addEventListener('keydown', handleKeyDown);
		document.body.addEventListener('submit', handleSubmit);

		return () => {
			document.body.removeEventListener('keydown', handleKeyDown);
			document.body.removeEventListener('submit', handleSubmit);
		};
	}, [itemPrice]);

	return (
		<div
			className={`my-1 flex items-center justify-between rounded-md bg-white px-2 py-1 dark:bg-[#232527]`}
		>
			<div className={`flex w-full items-center justify-between`} role="none">
				<div className="flex items-center gap-2">
					<span className="text-xs text-[#030910] dark:text-white md:text-base">
						{item.name.charAt(0).toUpperCase() + item.name.slice(1)}
					</span>
				</div>
			</div>
			<div className="flex items-center">
				<TextInput
					ref={priceInputRef}
					value={itemPrice}
					onChange={(event) => {
						// Remove any non-digit, non-comma, non-dot characters
						const sanitizedValue = event.target.value.replace(/[^\d,.]/g, '');

						// Check if the sanitized value matches the format
						const regex = /^\d*([,.]\d{0,2})?$/;
						if (regex.test(sanitizedValue)) {
							// Replace multiple commas or dots with a single dot
							const formattedValue = sanitizedValue.replace(/[,.]+/g, '.');
							setItemPrice(formattedValue);
						}
					}}
					onBlur={() => {
						handleNewPrice(itemPrice);
						useShoppingStore.setState({
							currentPatternPriceInputId: -1,
							nextPatternPriceInputId: -1,
						});
					}}
					onSubmitCapture={() => {
						handleNewPrice(itemPrice);
					}}
					onSubmit={() => {
						handleNewPrice(itemPrice);
					}}
					className="w-16"
				/>
				<div className="flex w-16 justify-center">
					<span className="flex items-center gap-1 text-xs text-[#030910] dark:text-white md:text-base">
						<button
							className="flex h-3 w-3 items-center justify-center bg-green-600 px-1 text-[12px] text-white"
							onClick={(e) => {
								e.stopPropagation();
								handleChangeWeight('add');
							}}
						>
							+
						</button>
						{itemWeight}
						<button
							className="flex h-3 w-3 items-center justify-center bg-red-600 px-1 text-[12px] text-white"
							onClick={(e) => {
								e.stopPropagation();
								handleChangeWeight('subtract');
							}}
						>
							-
						</button>
					</span>
				</div>
				<div
					className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm bg-red-500 font-bold text-white"
					onClick={() => handleDeleteItem()}
					onKeyDown={() => handleDeleteItem()}
					role="button"
					tabIndex={0}
				>
					X
				</div>
			</div>
		</div>
	);
};
