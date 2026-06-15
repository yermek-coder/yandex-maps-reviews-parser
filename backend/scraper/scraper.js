import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as cheerio from "cheerio";
import crypto from "crypto";

// Подключаем stealth-плагин для обхода детекции автоматизации
puppeteer.use(StealthPlugin());

// Функция для имитации человеческой задержки
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function parseYandexReviews(url) {
    let browser;
    try {
        console.error("Launching protected browser...");
        browser = await puppeteer.launch({
            headless: true,
            // Используем системный путь Alpine Chromium из переменной окружения или хардкодом
            executablePath:
                process.env.PUPPETEER_EXECUTABLE_PATH ||
                "/usr/bin/chromium-browser",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                // Дополнительные фичи маскировки на уровне аргументов Chromium:
                "--disable-blink-features=AutomationControlled", // Скрывает флаг автоматизации
                "--lang=ru-RU,ru", // Жестко задаем русский язык локали
                "--disable-gpu",
                "--disable-software-rasterizer",
                "--disable-dev-shm-usage",
            ],
        });

        const page = await browser.newPage();

        // Устанавливаем реальные заголовки, чтобы не палиться на пустых языках
        await page.setExtraHTTPHeaders({
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        });

        await page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        );
        await page.setViewport({ width: 1280, height: 800 });

        // Единое хранилище для всех отзывов
        const reviewsMap = new Map();
        const maxReviews = 600;

        const addReviewsToMap = (reviewsArray) => {
            if (!reviewsArray || !Array.isArray(reviewsArray)) return;

            reviewsArray.forEach((rev) => {
                if (reviewsMap.size >= maxReviews) return;

                const userName = rev.author?.name || "Аноним";
                const rating = parseFloat(rev.rating || 5);
                const text = (rev.text || "").replace(/\s+/g, " ").trim();
                const datePublished = rev.updatedTime || null;
                const businessReply = rev.businessComment?.text || null;

                if (!text) return; // Пустые отзывы без текста нам не нужны

                // Создаем железный уникальный ключ: имя + дата + кусок текста
                // Используем crypto для генерации красивого фиксированного external_id
                const stringToHash = `${userName}_${datePublished}_${text.substring(0, 100)}`;
                const uniqueId = crypto
                    .createHash("md5")
                    .update(stringToHash)
                    .digest("hex");

                if (uniqueId) {
                    reviewsMap.set(uniqueId, {
                        id: uniqueId, // Теперь бэкенд получит этот хэш как external_review_id
                        userName,
                        rating,
                        text,
                        datePublished,
                        businessReply,
                    });
                }
            });
        };

        // 1. ВКЛЮЧАЕМ ПЕРЕХВАТ СЕТЕВЫХ ЗАПРОСОВ
        page.on("response", async (response) => {
            const requestUrl = response.url();
            if (requestUrl.includes("maps/api/business/fetchReviews")) {
                try {
                    const json = await response.json();
                    if (json && json.data && json.data.reviews) {
                        console.error(
                            `➔ Перехвачен AJAX: найдено ${json.data.reviews.length} отзывов.`,
                        );
                        addReviewsToMap(json.data.reviews);
                    }
                } catch (err) {
                    // Игнорируем ошибки чтения пустых ответов
                }
            }
        });

        // Открываем страницу организации
        console.error("Loading page...");
        // Переключаем на networkidle2, чтобы дождаться начальной загрузки скриптов метрики и карт Яндекса
        await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

        // 2. ДОСТАЕМ ПЕРВУЮ ПАЧКУ ИЗ HTML (До скролла)

        // Сюда сохраним данные рейтинга, если найдем их в JSON
        let extractedRatingData = null;

        // Открываем страницу организации
        console.error("Loading page...");

        console.error(
            "Extracting initial reviews and rating data from state-view script...",
        );
        const html = await page.content();
        const $ = cheerio.load(html);

        const stateScript = $('script[type="application/json"].state-view')
            .first()
            .text();

        if (stateScript) {
            try {
                const pageState = JSON.parse(stateScript);

                // 1. Ищем ratingData в любой точке объекта
                const ratingData = findVal(pageState, "ratingData");
                if (ratingData) {
                    console.error(
                        `✓ [Рекурсия] Найден рейтинг: ${ratingData.ratingValue}, голосов: ${ratingData.ratingCount}`,
                    );
                    extractedRatingData = {
                        ratingCount: parseInt(ratingData.ratingCount) || 0,
                        ratingValue: parseFloat(
                            ratingData.ratingValue
                                ? ratingData.ratingValue.toFixed(2)
                                : 0,
                        ),
                        reviewCount: parseInt(ratingData.reviewCount) || 0,
                    };
                } else {
                    console.error(
                        "⚠ Предупреждение: ключ ratingData не найден в JSON скрипта.",
                    );
                }

                // 2. Ищем массив отзывов (в Яндексе они лежат в reviewResults -> reviews)
                // Сначала ищем контейнер результатов отзывов
                const reviewResults = findVal(pageState, "reviewResults");
                const initialReviews =
                    reviewResults?.reviews || findVal(pageState, "reviews");

                if (initialReviews && Array.isArray(initialReviews)) {
                    console.error(
                        `✓ [Рекурсия] Извлечено первых отзывов из HTML: ${initialReviews.length}`,
                    );
                    addReviewsToMap(initialReviews);
                } else {
                    console.error(
                        "Инфо: Отзывы в HTML не найдены, полагаемся на AJAX при скролле.",
                    );
                }
            } catch (e) {
                console.error(
                    "Критическая ошибка разбора JSON структуры:",
                    e.message,
                );
            }
        }

        // 3. ЛЕНИВЫЙ СКРОЛЛ
        console.error("Starting lazy scroll for remaining reviews...");

        // Микро-скролл для инициализации загрузчика Яндекса
        await page.evaluate(() => {
            window.scrollBy(0, 100);
        });
        await delay(500);

        let attemptsWithNoNewReviews = 0;
        let lastCount = 0;

        while (reviewsMap.size < maxReviews && attemptsWithNoNewReviews < 15) {
            lastCount = reviewsMap.size;
            console.error(
                `Текущий прогресс сбора: ${lastCount} / ${maxReviews}`,
            );

            await page.evaluate(() => {
                // Целимся в разные возможные контейнеры прокрутки отзывов Яндекса
                const container = document.querySelector(
                    ".reviews-view__scroll-container, .ranking-wrapper, .scroll__container, ._name_reviews",
                );
                if (container) {
                    container.scrollTo(0, container.scrollHeight);
                } else {
                    window.scrollBy(0, window.innerHeight);
                }
            });

            // Рандомный интервал для симуляции человека
            const randomWait = Math.floor(Math.random() * 600) + 1200;
            await delay(randomWait);

            if (reviewsMap.size === lastCount) {
                attemptsWithNoNewReviews++;
            } else {
                attemptsWithNoNewReviews = 0;
            }
        }

        // Собираем мета-данные организации (имя оставляем из HTML на всякий случай)
        const orgName =
            $('[itemprop="name"]').first().text().trim() ||
            $("h1").first().text().trim() ||
            "Company Name";
        const finalReviewsArray = Array.from(reviewsMap.values());

        // Извлекаем текстовые счетчики из DOM для резервного сохранения
        const fallbackRating = $(
            ".business-summary-rating-badge-view__rating-text",
        )
            .first()
            .text()
            .trim()
            .replace(",", ".");
        const fallbackCountText = $(".business-rating-amount-view")
            .first()
            .text()
            .trim();
        // Извлекаем только цифры из строки вроде "1 804 отзыва"
        const fallbackCount = fallbackCountText
            ? parseInt(fallbackCountText.replace(/\s/g, ""), 10)
            : 0;

        const result = {
            success: true,
            orgId: url.match(/\/org\/[^\/]+\/(\d+)/)?.[1] || null,
            url: url,
            summary: {
                rating: extractedRatingData
                    ? extractedRatingData.ratingValue
                    : parseFloat(fallbackRating) || null,
                ratingCount: extractedRatingData
                    ? extractedRatingData.ratingCount
                    : fallbackCount || null,
                reviewCount: extractedRatingData
                    ? extractedRatingData.reviewCount
                    : fallbackCount || null,
                parsedCount: finalReviewsArray.length,
            },
            orgInfo: { name: orgName, phone: null },
            reviews: finalReviewsArray.slice(0, maxReviews),
        };

        // Only output JSON to stdout (debug/info go to stderr)
        console.log(JSON.stringify(result));

        return result;
    } catch (error) {
        console.error("Fatal error in scraper:", error.message);
        console.log(JSON.stringify({ success: false, error: error.message }));
    } finally {
        if (browser) await browser.close();
    }
}

/**
 * Рекурсивный поиск значения по ключу в любом объекте или массиве
 */
function findVal(obj, key) {
    if (!obj || typeof obj !== "object") return null;

    // Если ключ прямо здесь, возвращаем его значение
    if (obj.hasOwnProperty(key)) {
        return obj[key];
    }

    // Если это массив, бежим по элементам
    if (Array.isArray(obj)) {
        for (const item of obj) {
            const result = findVal(item, key);
            if (result) return result;
        }
    } else {
        // Если это объект, бежим по свойствам
        for (const k in obj) {
            if (obj.hasOwnProperty(k)) {
                const result = findVal(obj[k], key);
                if (result) return result;
            }
        }
    }
    return null;
}

// Точка входа скрипта
const url = process.argv[2];
if (url) {
    parseYandexReviews(url)
        .then((result) => {
            if (!result) {
                console.log(
                    JSON.stringify({
                        success: false,
                        error: "Fatal error occurred",
                    }),
                );
                process.exit(1);
            }
            process.exit(result.success ? 0 : 1);
        })
        .catch((err) => {
            console.error("Fatal error:", err);
            process.exit(1);
        });
}
