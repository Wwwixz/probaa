export interface ArticleComment {
	id: string;
	author: string;
	text: string;
	time: string;
}

export interface Article {
	id: string;
	title: string;
	subtitle: string;
	rating?: number;
	description: string;
	comments: ArticleComment[];
}

/**
 * Временные тестовые данные — замените на реальный fetch через
 * shared/api, когда появится бэкенд/моки (MSW). id используется в
 * getStaticPaths для генерации страниц /topics/[id].
 */
export const MOCK_ARTICLES: Article[] = [
	{
		id: 'ghazala-beach',
		title: 'Ghazala beach',
		subtitle: 'Шарм-эль-шейх',
		rating: 3.9,
		description:
			'Отель в Египте в самом центре города, с видом на море и собственным пляжем. Рядом рестораны, магазины и остановки транспорта.',
		comments: [
			{
				id: '1',
				author: 'Гость',
				text: 'отель чудесный, сйчас там',
				time: '12:00 сегодня',
			},
		],
	},
];

export function getArticleById(id: string): Article | undefined {
	return MOCK_ARTICLES.find((article) => article.id === id);
}
