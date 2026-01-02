export default function rehypeKeystaticMathFix() {
	return function transformer(tree) {
		const normalizeMath = (value) =>
			value
				.replace(/\\\{/g, '{')
				.replace(/\\\}/g, '}')
				.replace(/\\_/g, '_');

		const normalizeText = (value) =>
			value
				// Footnotes: "\[^1]" / "\[^1]:" -> "[^1]" / "[^1]:"
				.replace(/\\\[\^/g, '[^')
				// Limited HTML: "\<span ...>" / "\</span>" -> "<span ...>" / "</span>"
				.replace(/\\<span\b/gi, '<span')
				.replace(/\\<\/(?:span)\s*>/gi, '</span>')
				.replace(/\\<\\span\s*>/gi, '</span>')
				.replace(/\\<\\\/(?:span)\s*>/gi, '</span>');

		const getClasses = (node) => {
			const props = node && node.properties;
			const className = props && props.className;
			if (Array.isArray(className)) return className.map(String);
			if (typeof className === 'string') return className.split(/\s+/).filter(Boolean);
			return [];
		};

		const walk = (node, inMath = false, inCode = false) => {
			if (!node || typeof node !== 'object') return;

			if (node.type === 'element') {
				const classes = getClasses(node);
				const isMathElement =
					classes.includes('math') ||
					classes.includes('math-inline') ||
					classes.includes('math-display') ||
					classes.includes('language-math');
				inMath = inMath || isMathElement;

				const tag = String(node.tagName || '').toLowerCase();
				if (tag === 'pre' || tag === 'code') inCode = true;
			}

			if (node.type === 'text' && typeof node.value === 'string') {
				if (inMath) {
					node.value = normalizeMath(node.value);
				} else if (!inCode) {
					node.value = normalizeText(node.value);
				}
			}

			const children = node.children;
			if (Array.isArray(children)) {
				for (const child of children) walk(child, inMath, inCode);
			}
		};

		walk(tree);
	};
}
