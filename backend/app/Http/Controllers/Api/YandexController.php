<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Review;
use App\Services\YandexParserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class YandexController extends Controller
{
    // Объявляем свойство для сервиса
    protected YandexParserService $parserService;

    // Внедряем сервис через конструктор
    public function __construct(YandexParserService $parserService)
    {
        $this->parserService = $parserService;
    }

    /**
     * ЭТАП 1: Запуск парсинга
     */
    public function parseReviews(Request $request): JsonResponse
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $url = $request->input('url');

        $orgId = $this->parserService->extractOrgId($url);

        if (!$orgId) {
            return response()->json(['error' => 'Неверный формат URL Яндекса.'], 400);
        }

        // app developed in kazakhstan, other countries might have different outputs
        // for sake of fixing this quickly let's do this hack
        $kzUrl = str_replace("yandex.ru", "yandex.kz", $url);

        try {
            $result = $this->parserService->syncReviews($kzUrl, $orgId);
            $organization = $result['organization'];

            return response()->json([
                'success' => true,
                'message' => 'Данные успешно синхронизированы с БД.',
                'org_id' => $orgId,
                'total_parsed' => $result['total_parsed'],
                'meta' => [
                    'rating' => $organization->rating,
                    'review_count' => $organization->review_count,
                    'rating_count' => $organization->rating_count,
                    'company_name' => $organization->name
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * ЭТАП 2: Выдача отзывов фронтенду
     */
    public function getReviews(Request $request): JsonResponse
    {
        $request->validate([
            'org_id' => 'required|string',
        ]);

        $orgId = $request->input('org_id');
        $organization = Organization::where('yandex_id', $orgId)->first();

        if (!$organization) {
            return response()->json(['error' => 'Организация не найдена в базе данных. Сначала запустите парсинг.'], 404);
        }

        $reviews = Review::where('org_id', $orgId)
            ->orderBy('date_published', 'desc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'organization' => [
                'id' => $organization->yandex_id,
                'name' => $organization->name,
                'url' => $organization->url,
                'phone' => $organization->phone,
                'rating' => (float) $organization->rating,
                'rating_count' => (int) $organization->rating_count,
                'review_count' => (int) $organization->review_count,
                'last_parsed_at' => $organization->last_parsed_at ? $organization->last_parsed_at->toIso8601String() : null,
            ],
            'reviews' => $reviews
        ]);
    }
}
