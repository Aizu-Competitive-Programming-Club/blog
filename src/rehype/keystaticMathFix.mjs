export default function rehypeKeystaticMathFix() {
	return function transformer(tree) {
		const normalize = (value) =>
			value
				.replace(/\\\{/g, '{')
				.replace(/\\\}/g, '}')
				.replace(/\\_/g, '_');

		const getClasses = (node) => {
			const props = node && node.properties;
			const className = props && props.className;
			if (Array.isArray(className)) return className.map(String);
			if (typeof className === 'string') return className.split(/\s+/).filter(Boolean);
			return [];
		};

		const walk = (node, inMath = false) => {
			if (!node || typeof node !== 'object') return;

			if (node.type === 'element') {
				const classes = getClasses(node);
				const isMathElement =
					classes.includes('math') ||
					classes.includes('math-inline') ||
					classes.includes('math-display') ||
					classes.includes('language-math');
				inMath = inMath || isMathElement;
			}

			if (inMath && node.type === 'text' && typeof node.value === 'string') {
				node.value = normalize(node.value);
			}

			const children = node.children;
			if (Array.isArray(children)) {
				for (const child of children) walk(child, inMath);
			}
		};

		walk(tree);
	};
}
