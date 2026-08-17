export interface ArticleComment {
	id: string;
	author: string;
	text: string;
	time: string;
}

export interface Article {
	id: string;
	/** 'hotel' — с рейтингом и лейблом "Описание темы"; 'article' —
	 *  без рейтинга, лейбл "Описание статьи" */
	type: 'article' | 'hotel';
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
		type: 'hotel',
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
	{
		id: 'flight-delay',
		type: 'article',
		title: 'Если задержали рейс',
		subtitle: 'тогда это к вам:',
		description:
			'Международные правила, которые действуют при задержке или отмене рейса, и что вам полагается по закону — компенсация, питание, размещение в отеле.',
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
