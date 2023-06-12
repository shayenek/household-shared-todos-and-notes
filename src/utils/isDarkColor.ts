const isDarkColor = (color: string) => {
	color = color.replace(/\s/g, '').toLowerCase();

	if (color.startsWith('rgb(') && color.endsWith(')')) {
		const rgbValues = color.substring(4, color.length - 1).split(',');

		let r,
			g,
			b = 0;

		if (typeof rgbValues[0] !== 'undefined') {
			r = parseInt(rgbValues[0]);
		}
		if (typeof rgbValues[1] !== 'undefined') {
			g = parseInt(rgbValues[1]);
		}
		if (typeof rgbValues[2] !== 'undefined') {
			b = parseInt(rgbValues[2]);
		}

		let luminance = 0;
		if (typeof r !== 'undefined' && typeof g !== 'undefined' && typeof b !== 'undefined') {
			luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
		}

		if (luminance <= 0.5) {
			return true;
		} else {
			return false;
		}
	}

	return false;
};

export default isDarkColor;
