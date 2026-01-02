export default function remarkKeystaticMathFix() {
	return function transformer(tree: unknown) {
		const walk = (node: any) => {
			if (!node || typeof node !== 'object') return;
			if ((node.type === 'math' || node.type === 'inlineMath') && typeof node.value === 'string') {
				// Keystatic's MDX editor tends to escape braces ("\{"/"\}") which breaks TeX grouping.
				// We normalize them back for rendering. If you need literal braces, use \lbrace and \rbrace.
				node.value = node.value.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
			}
			const children = (node as any).children;
			if (Array.isArray(children)) {
				for (const child of children) walk(child);
			}
		};

		walk(tree as any);
	};
}
