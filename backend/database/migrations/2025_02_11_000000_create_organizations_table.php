<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('yandex_id')->unique();
            $table->string('name');
            $table->text('url');
            $table->float('rating')->nullable();
            $table->integer('rating_count')->nullable()->default(0);
            $table->integer('review_count')->default(0);
            $table->string('phone')->nullable();
            $table->timestamp('last_parsed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
