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
	discussionsCount: number;
	coverImage: string;
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
		title: 'Ghazala Beach Resort',
		subtitle: 'Шарм-эль-Шейх',
		rating: 3.9,
		discussionsCount: 15,
		coverImage:
			'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
		description:
			'Популярный курортный отель в Наама-Бей. Его часто обсуждают из-за удобного пляжа, расположения рядом с прогулочной зоной и разброса по качеству номеров в разных корпусах.',
		comments: [
			{
				id: '1',
				author: 'Марина',
				text: 'Для своей цены нормальный вариант, особенно если хотите быть ближе к центру и морю.',
				time: '09:10 сегодня',
			},
			{
				id: '2',
				author: 'Игорь',
				text: 'Лучше сразу уточнять, в каком корпусе номер, потому что после реновации впечатления намного лучше.',
				time: 'вчера',
			},
		],
	},
	{
		id: 'sunrise-diamond',
		type: 'hotel',
		title: 'SUNRISE Diamond Beach',
		subtitle: 'Шарм-эль-Шейх',
		rating: 4.6,
		discussionsCount: 28,
		coverImage:
			'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
		description:
			'Курортный отель с хорошим рифом, большой территорией и семейной инфраструктурой. В обсуждениях чаще всего сравнивают питание, анимацию и корпуса для отдыха с детьми.',
		comments: [
			{
				id: '1',
				author: 'Алексей',
				text: 'Риф сильный, если едете ради моря и снорклинга - место очень достойное.',
				time: 'сегодня',
			},
			{
				id: '2',
				author: 'Ольга',
				text: 'С детьми удобно, но лучше просить номер ближе к пляжу, территория большая.',
				time: '2 дня назад',
			},
		],
	},
	{
		id: 'rosa-khutor-weekend',
		type: 'hotel',
		title: 'Rosa Khutor Ski Inn',
		subtitle: 'Роза Хутор, Сочи',
		rating: 4.4,
		discussionsCount: 19,
		coverImage:
			'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
		description:
			'Тема про проживание на горном курорте: где удобнее жить у подъёмников, когда лучше бронировать номера и стоит ли переплачивать за видовые варианты в высокий сезон.',
		comments: [
			{
				id: '1',
				author: 'Светлана',
				text: 'Если поездка короткая, жить ближе к подъёмнику реально удобнее, чем экономить на трансфере.',
				time: 'вчера',
			},
			{
				id: '2',
				author: 'Никита',
				text: 'На праздничные даты хорошие варианты заканчиваются очень быстро.',
				time: '3 дня назад',
			},
		],
	},
	{
		id: 'flight-delay',
		type: 'article',
		title: 'Если задержали рейс',
		subtitle: 'что обязана сделать авиакомпания',
		discussionsCount: 24,
		coverImage:
			'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
		description:
			'Памятка о том, что делать при задержке рейса: когда требовать питание, гостиницу, трансфер и как собрать документы для компенсации.',
		comments: [
			{
				id: '1',
				author: 'Катя',
				text: 'Полезно, что собраны шаги по порядку - в стрессовой ситуации это самое важное.',
				time: 'сегодня',
			},
			{
				id: '2',
				author: 'Роман',
				text: 'Не хватает только шаблона претензии, но как памятка статья очень ок.',
				time: 'вчера',
			},
		],
	},
	{
		id: 'lost-luggage',
		type: 'article',
		title: 'Если потеряли багаж',
		subtitle: 'куда идти и как оформить претензию',
		discussionsCount: 17,
		coverImage:
			'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80',
		description:
			'Пошагово разбираем, как оформить PIR в аэропорту, где отслеживать чемодан и в каких случаях можно получить компенсацию за задержку багажа.',
		comments: [
			{
				id: '1',
				author: 'Лена',
				text: 'Хорошо бы ещё список вещей первой необходимости, которые можно потом компенсировать.',
				time: 'вчера',
			},
			{
				id: '2',
				author: 'Денис',
				text: 'Самое важное - не уходить из зоны выдачи, пока не оформлен акт. Это прям надо выделить.',
				time: '2 дня назад',
			},
		],
	},
	{
		id: 'night-transfer',
		type: 'article',
		title: 'Как пережить ночную пересадку',
		subtitle: 'еда, отдых, безопасность и документы',
		discussionsCount: 12,
		coverImage:
			'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1200&q=80',
		description:
			'Короткий гид по ночным пересадкам: где отдохнуть, как не пропустить следующий сегмент, что делать с багажом и как заранее проверить терминал.',
		comments: [
			{
				id: '1',
				author: 'Аня',
				text: 'Особенно полезен блок про смену терминала и повторный досмотр.',
				time: '3 дня назад',
			},
		],
	},
];

export function getArticleById(id: string): Article | undefined {
	return MOCK_ARTICLES.find((article) => article.id === id);
}
