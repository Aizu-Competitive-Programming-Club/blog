export default function remarkKeystaticMathFix() {
	return function transformer(tree) {
		const walk = (node) => {
			if (!node || typeof node !== 'object') return;
			if ((node.type === 'math' || node.type === 'inlineMath') && typeof node.value === 'string') {
				// Keystatic's MDX editor tends to escape braces ("\\{"/"\\}") and underscores ("\\_")
				// which breaks TeX grouping / subscripts.
				// If you need literal braces, use \lbrace and \rbrace.
				node.value = node.value
					.replace(/\\\{/g, '{')
					.replace(/\\\}/g, '}')
					.replace(/\\_/g, '_');
			}
			const children = node.children;
			if (Array.isArray(children)) {
				for (const child of children) walk(child);
			}
		};

		walk(tree);
	};
}
