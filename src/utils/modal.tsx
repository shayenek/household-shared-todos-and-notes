import { modals } from '@mantine/modals';

const openGlobalModal = (
	modalId: string,
	title: string | React.ReactNode | null,
	children: React.ReactNode,
	currentTheme: string
) => {
	modals.open({
		modalId: modalId,
		title: title ? title : null,
		className: currentTheme,
		styles: {
			title: {
				lineHeight: '1.75',
				marginRight: '0.75rem',
			},
			content: {
				background: currentTheme === 'dark' ? '#1d1f20' : '#fff',
				borderWidth: '2px',
				borderColor: currentTheme === 'dark' ? '#2b3031' : '#ecf0f3',
			},
			header: {
				color: currentTheme === 'dark' ? '#fff' : '#030910',
				background: currentTheme === 'dark' ? '#1d1f20' : '#fff',
			},
		},
		centered: true,
		children: children,
	});
};

export default openGlobalModal;
