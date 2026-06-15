<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->string('org_id');
            $table->text('url');
            $table->string('user_name');
            $table->float('rating')->nullable();
            $table->longText('text');
            $table->text('business_reply')->nullable();
            $table->timestamp('date_published')->nullable();
            $table->string('external_review_id')->unique()->nullable();
            $table->timestamps();

            // Внешний ключ на yandex_id
            $table->foreign('org_id')
                ->references('yandex_id')
                ->on('organizations')
                ->onDelete('cascade');

            $table->index('org_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
