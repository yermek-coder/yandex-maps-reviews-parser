<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\Review;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Exception;

class YandexParserService
{
    /**
     * Извлекает ID организации из URL Яндекса
     */
    public function extractOrgId(string $url): ?string
    {
        preg_match('/\/org\/[^\/]+\/(\d+)/', $url, $matches);
        return $matches[1] ?? null;
    }

    /**
     * Главный метод: координирует проверку кэша, запуск скрапера и сохранение
     */
    public function syncReviews(string $url, string $orgId): array
    {
        $organization = Organization::where('yandex_id', $orgId)->first();

        // Проверяем, нужно ли обновлять данные (кэш 2 часа)
        $needsParsing = !$organization ||
            ($organization->last_parsed_at && $organization->last_parsed_at->diffInHours(now()) > 2);

        if (!$needsParsing) {
            return [
                'organization' => $organization,
                'total_parsed' => 'cached',
            ];
        }

        // Запускаем скрапер внутри сервиса
        $parsedData = $this->runScraperProcess($url, $orgId);

        // Сохраняем результаты в БД
        $organization = $this->updateOrCreateOrganization($orgId, $url, $parsedData);
        $reviewsCount = $this->upsertReviews($orgId, $url, $parsedData['reviews'] ?? []);

        return [
            'organization' => $organization,
            'total_parsed' => $reviewsCount,
        ];
    }

    protected function runScraperProcess(string $url, string $orgId): array
    {
        $scraperPath = base_path('scraper/scraper.js');

        // Запуск CLI процесса
        $result = Process::timeout(180)->run("node $scraperPath $url");

        if (!empty($result->errorOutput())) {
            Log::warning("Yandex Scraper [org: $orgId] stderr: " . $result->errorOutput());
        }

        if (!$result->successful()) {
            Log::error("Scraper process failed with exit code: " . $result->exitCode());
            throw new Exception('Ошибка выполнения скрипта Puppeteer.');
        }

        $data = json_decode($result->output(), true);

        if (!$data || !isset($data['success']) || !$data['success']) {
            Log::error("Scraper output parsing error or success=false. Raw output: " . $result->output());
            throw new Exception('Ошибка структуры JSON ответа скрапера.');
        }

        return $data;
    }

    /**
     * Логика сохранения организации
     */
    protected function updateOrCreateOrganization(string $orgId, string $url, array $data): Organization
    {
        return Organization::updateOrCreate(
            ['yandex_id' => $orgId],
            [
                'url' => $url,
                'name' => $data['orgInfo']['name'] ?? 'Company Name',
                'phone' => $data['orgInfo']['phone'] ?? null,
                'rating' => $data['summary']['rating'] ?? null,
                'rating_count' => $data['summary']['ratingCount'] ?? null,
                'review_count' => $data['summary']['reviewCount'] ?? 0,
                'last_parsed_at' => now(),
            ]
        );
    }

    /**
     * Логика сохранения отзывов
     */
    protected function upsertReviews(string $orgId, string $url, array $reviewsData): int
    {
        foreach ($reviewsData as $review) {
            Review::updateOrCreate(
                [
                    'org_id' => $orgId,
                    'external_review_id' => $review['id']
                ],
                [
                    'url' => $url,
                    'user_name' => $review['userName'],
                    'rating' => $review['rating'],
                    'text' => $review['text'],
                    'date_published' => $review['datePublished'] ?? null,
                    'business_reply' => $review['businessReply'] ?? null,
                ]
            );
        }

        return count($reviewsData);
    }
}
